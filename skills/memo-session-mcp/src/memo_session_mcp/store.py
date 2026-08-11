"""SQLite FTS5 index for memory chunks."""

from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from pathlib import Path


@dataclass
class SearchHit:
    score: float
    source_path: str
    collection: str
    section: str
    line_start: int
    chunk_index: int
    content: str
    project_slug: str | None = None


class MemoryIndex:
    def __init__(self, index_dir: Path) -> None:
        self.index_dir = index_dir
        self.index_dir.mkdir(parents=True, exist_ok=True)
        self.db_path = index_dir / "memory_index.db"
        self._conn = sqlite3.connect(self.db_path)
        self._conn.row_factory = sqlite3.Row
        self._init_schema()

    def close(self) -> None:
        self._conn.close()

    def _init_schema(self) -> None:
        self._conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY,
                path TEXT NOT NULL UNIQUE,
                sha256 TEXT NOT NULL,
                collection TEXT NOT NULL,
                project_slug TEXT,
                mtime REAL,
                indexed_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS chunks (
                id INTEGER PRIMARY KEY,
                file_id INTEGER NOT NULL,
                chunk_index INTEGER NOT NULL,
                section TEXT,
                line_start INTEGER,
                content TEXT NOT NULL,
                FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
            );

            CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
                content,
                section,
                source_path UNINDEXED,
                collection UNINDEXED,
                project_slug UNINDEXED,
                chunk_id UNINDEXED,
                tokenize='unicode61'
            );
            """
        )
        self._conn.commit()

    def get_file_sha(self, path: str) -> str | None:
        row = self._conn.execute(
            "SELECT sha256 FROM files WHERE path = ?", (path,)
        ).fetchone()
        return row["sha256"] if row else None

    def delete_file(self, path: str) -> int:
        rows = self._conn.execute(
            "SELECT id FROM files WHERE path = ?", (path,)
        ).fetchall()
        if not rows:
            return 0
        file_id = rows[0]["id"]
        chunk_ids = [
            r["id"]
            for r in self._conn.execute(
                "SELECT id FROM chunks WHERE file_id = ?", (file_id,)
            ).fetchall()
        ]
        for cid in chunk_ids:
            self._conn.execute(
                "DELETE FROM chunks_fts WHERE chunk_id = ?", (str(cid),)
            )
        self._conn.execute("DELETE FROM chunks WHERE file_id = ?", (file_id,))
        self._conn.execute("DELETE FROM files WHERE id = ?", (file_id,))
        self._conn.commit()
        return len(chunk_ids)

    def upsert_file(
        self,
        path: str,
        sha256: str,
        collection: str,
        project_slug: str | None,
        mtime: float,
        chunks: list[tuple[int, str, int, str]],
    ) -> int:
        self.delete_file(path)
        cur = self._conn.execute(
            """
            INSERT INTO files (path, sha256, collection, project_slug, mtime)
            VALUES (?, ?, ?, ?, ?)
            """,
            (path, sha256, collection, project_slug, mtime),
        )
        file_id = cur.lastrowid
        count = 0
        for chunk_index, section, line_start, content in chunks:
            cur = self._conn.execute(
                """
                INSERT INTO chunks (file_id, chunk_index, section, line_start, content)
                VALUES (?, ?, ?, ?, ?)
                """,
                (file_id, chunk_index, section, line_start, content),
            )
            chunk_id = cur.lastrowid
            self._conn.execute(
                """
                INSERT INTO chunks_fts (content, section, source_path, collection, project_slug, chunk_id)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    content,
                    section or "",
                    path,
                    collection,
                    project_slug or "",
                    str(chunk_id),
                ),
            )
            count += 1
        self._conn.commit()
        return count

    def search(
        self,
        query: str,
        *,
        collection: str | None = None,
        project_slug: str | None = None,
        limit: int = 8,
    ) -> list[SearchHit]:
        terms = [t for t in query.split() if len(t) > 1]
        if not terms:
            return []
        if len(terms) == 1:
            fts_query = terms[0]
        else:
            fts_query = " OR ".join(terms)
        sql = """
            SELECT
                chunks_fts.chunk_id,
                chunks_fts.source_path,
                chunks_fts.collection,
                chunks_fts.project_slug,
                chunks_fts.section,
                chunks.content,
                chunks.line_start,
                chunks.chunk_index,
                bm25(chunks_fts) AS rank
            FROM chunks_fts
            JOIN chunks ON chunks.id = CAST(chunks_fts.chunk_id AS INTEGER)
            WHERE chunks_fts MATCH ?
        """
        params: list[object] = [fts_query]
        if collection:
            sql += " AND chunks_fts.collection = ?"
            params.append(collection)
        if project_slug:
            sql += " AND chunks_fts.project_slug = ?"
            params.append(project_slug)
        sql += " ORDER BY rank LIMIT ?"
        params.append(limit)

        try:
            rows = self._conn.execute(sql, params).fetchall()
        except sqlite3.OperationalError:
            # Fallback: OR query without quotes
            fts_query = " OR ".join(terms)
            params[0] = fts_query
            rows = self._conn.execute(sql, params).fetchall()

        hits: list[SearchHit] = []
        for row in rows:
            rank = float(row["rank"])
            hits.append(
                SearchHit(
                    score=max(0.0, -rank),
                    source_path=row["source_path"],
                    collection=row["collection"],
                    section=row["section"] or "",
                    line_start=int(row["line_start"] or 0),
                    chunk_index=int(row["chunk_index"] or 0),
                    content=row["content"],
                    project_slug=row["project_slug"] or None,
                )
            )
        return hits

    def keyword_fallback(
        self,
        query: str,
        *,
        collection: str | None = None,
        project_slug: str | None = None,
        limit: int = 8,
    ) -> list[SearchHit]:
        q = f"%{query.lower()}%"
        sql = """
            SELECT c.content, c.section, c.line_start, c.chunk_index,
                   f.path, f.collection, f.project_slug
            FROM chunks c
            JOIN files f ON f.id = c.file_id
            WHERE lower(c.content) LIKE ?
        """
        params: list[object] = [q]
        if collection:
            sql += " AND f.collection = ?"
            params.append(collection)
        if project_slug:
            sql += " AND f.project_slug = ?"
            params.append(project_slug)
        sql += " LIMIT ?"
        params.append(limit)
        rows = self._conn.execute(sql, params).fetchall()
        return [
            SearchHit(
                score=0.5,
                source_path=row["path"],
                collection=row["collection"],
                section=row["section"] or "",
                line_start=int(row["line_start"] or 0),
                chunk_index=int(row["chunk_index"] or 0),
                content=row["content"],
                project_slug=row["project_slug"] or None,
            )
            for row in rows
        ]

    def stats(self) -> dict:
        files = self._conn.execute("SELECT COUNT(*) AS c FROM files").fetchone()["c"]
        chunks = self._conn.execute("SELECT COUNT(*) AS c FROM chunks").fetchone()["c"]
        by_collection = self._conn.execute(
            "SELECT collection, COUNT(*) AS c FROM files GROUP BY collection"
        ).fetchall()
        return {
            "files": files,
            "chunks": chunks,
            "collections": {r["collection"]: r["c"] for r in by_collection},
            "db_path": str(self.db_path),
        }

    def list_indexed_paths(self) -> list[str]:
        rows = self._conn.execute("SELECT path FROM files ORDER BY path").fetchall()
        return [r["path"] for r in rows]
