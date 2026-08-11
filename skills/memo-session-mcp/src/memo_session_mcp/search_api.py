"""Search API used by MCP tools and CLI."""

from __future__ import annotations

from .config import Config
from .registry import ProjectEntry, find_project, parse_projects_registry
from .store import MemoryIndex, SearchHit


def _format_hit(hit: SearchHit) -> str:
    loc = f"line ~{hit.line_start}" if hit.line_start else f"chunk {hit.chunk_index}"
    slug = f" · project={hit.project_slug}" if hit.project_slug else ""
    preview = hit.content.strip().replace("\n", " ")
    if len(preview) > 400:
        preview = preview[:400] + "…"
    return (
        f"**[{hit.score:.2f}] {hit.section or '(section)'}**{slug}\n"
        f"  Source: `{hit.source_path}` ({hit.collection}, {loc})\n"
        f"  {preview}\n"
    )


def search(
    index: MemoryIndex,
    query: str,
    *,
    collection: str | None = None,
    project_slug: str | None = None,
    limit: int = 8,
) -> list[SearchHit]:
    hits = index.search(
        query, collection=collection, project_slug=project_slug, limit=limit
    )
    if not hits:
        hits = index.keyword_fallback(
            query, collection=collection, project_slug=project_slug, limit=limit
        )
    return hits


def search_portfolio(index: MemoryIndex, query: str, limit: int = 8) -> str:
    hits = search(index, query, collection="portfolio", limit=limit)
    if not hits:
        return "No portfolio matches."
    out = [f"Portfolio search ({len(hits)} hits):\n"]
    out.extend(_format_hit(h) for h in hits)
    return "\n".join(out)


def search_project_memory(
    index: MemoryIndex, query: str, project_slug: str, limit: int = 8
) -> str:
    hits = search(
        index, query, collection="project", project_slug=project_slug, limit=limit
    )
    if not hits:
        return f"No project memory matches for slug `{project_slug}`."
    out = [f"Project `{project_slug}` ({len(hits)} hits):\n"]
    out.extend(_format_hit(h) for h in hits)
    return "\n".join(out)


def search_documents(index: MemoryIndex, query: str, limit: int = 8) -> str:
    hits = search(index, query, collection="documents", limit=limit)
    if not hits:
        return "No document matches."
    out = [f"Documents search ({len(hits)} hits):\n"]
    out.extend(_format_hit(h) for h in hits)
    return "\n".join(out)


def search_all(index: MemoryIndex, query: str, limit: int = 10) -> str:
    hits = search(index, query, limit=limit)
    if not hits:
        return "No matches across portfolio, projects, or documents."
    out = [f"Unified search ({len(hits)} hits):\n"]
    out.extend(_format_hit(h) for h in hits)
    return "\n".join(out)


def resolve_project(config: Config, query: str) -> str:
    registry = config.global_memory_root / "memory" / "wiki" / "projects-registry.md"
    entries = parse_projects_registry(registry)
    entry = find_project(entries, query)
    if not entry:
        return f"No project found for query: {query}"
    lines = [
        f"**{entry.name}** (`{entry.slug}`)",
        f"- git_remote: {entry.git_remote or '(none)'}",
        f"- local_path: {entry.local_path or '(none)'}",
        f"- project_memory: {entry.project_memory or '(none)'}",
        f"- last_verified: {entry.last_verified or '(unknown)'}",
        f"- status: {entry.status or '(unknown)'}",
    ]
    card = config.global_memory_root / "memory" / "wiki" / f"project-{entry.slug}.md"
    if card.is_file():
        lines.append(f"- card: `{card}`")
    return "\n".join(lines)


def get_source(index: MemoryIndex, source_path: str, chunk_index: int = 0) -> str:
    hits = index.keyword_fallback(
        source_path.split("/")[-1], limit=50
    )
    for hit in hits:
        if hit.source_path == source_path and hit.chunk_index == chunk_index:
            return (
                f"# {hit.section}\n\n"
                f"Source: `{hit.source_path}`\n\n"
                f"{hit.content}"
            )
    # Direct read fallback
    from pathlib import Path

    path = Path(source_path)
    if path.is_file():
        text = path.read_text(encoding="utf-8", errors="replace")
        return f"Source: `{source_path}`\n\n{text[:8000]}"
    return f"Source not found: {source_path}"
