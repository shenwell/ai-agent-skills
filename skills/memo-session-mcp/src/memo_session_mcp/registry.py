"""Parse projects-registry.md markdown table."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path


@dataclass
class ProjectEntry:
    slug: str
    name: str
    git_remote: str
    local_path: str
    project_memory: str
    last_verified: str
    status: str

    @property
    def memory_path(self) -> Path | None:
        if self.project_memory:
            p = Path(self.project_memory)
            if p.is_file():
                return p
        if self.local_path:
            candidate = Path(self.local_path) / "MEMORY.md"
            if candidate.is_file():
                return candidate
        return None

    @property
    def memory_dir(self) -> Path | None:
        if self.local_path:
            d = Path(self.local_path) / "memory"
            if d.is_dir():
                return d
        if self.project_memory:
            d = Path(self.project_memory).parent / "memory"
            if d.is_dir():
                return d
        return None


def _split_row(line: str) -> list[str]:
    inner = line.strip().strip("|")
    return [cell.strip() for cell in inner.split("|")]


def parse_projects_registry(path: Path) -> list[ProjectEntry]:
    if not path.is_file():
        return []

    rows: list[ProjectEntry] = []
    header: list[str] | None = None

    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if not line.strip().startswith("|"):
            continue
        if re.match(r"^\|\s*[-:]+\s*\|", line):
            continue
        cells = _split_row(line)
        if header is None:
            header = [c.lower().replace(" ", "_") for c in cells]
            continue
        if len(cells) < len(header):
            cells.extend([""] * (len(header) - len(cells)))
        row = dict(zip(header, cells))
        slug = row.get("slug", "")
        if not slug or slug == "slug":
            continue
        rows.append(
            ProjectEntry(
                slug=slug,
                name=row.get("name", ""),
                git_remote=row.get("git_remote", ""),
                local_path=row.get("local_path", ""),
                project_memory=row.get("project_memory", ""),
                last_verified=row.get("last_verified", ""),
                status=row.get("status", ""),
            )
        )
    return rows


def find_project(entries: list[ProjectEntry], query: str) -> ProjectEntry | None:
    q = query.strip().lower()
    for entry in entries:
        if entry.slug.lower() == q:
            return entry
    for entry in entries:
        if q in entry.name.lower() or q in entry.slug.lower():
            return entry
    for entry in entries:
        if entry.local_path and q in entry.local_path.lower():
            return entry
    return None
