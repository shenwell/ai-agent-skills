"""Index build and incremental updates."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .chunking import chunk_markdown, file_sha256, read_document
from .config import Config, KnowledgeSource
from .registry import ProjectEntry, parse_projects_registry
from .store import MemoryIndex


@dataclass
class IngestResult:
    indexed_files: int = 0
    skipped_files: int = 0
    pruned_files: int = 0
    chunk_count: int = 0
    errors: list[str] | None = None


def prune_missing_files(index: MemoryIndex) -> int:
    """Remove index rows whose files no longer exist on disk."""
    pruned = 0
    for path in index.list_indexed_paths():
        if not Path(path).is_file():
            index.delete_file(path)
            pruned += 1
    return pruned


def _glob_files(root: Path, patterns: list[str]) -> list[Path]:
    found: set[Path] = set()
    for pattern in patterns:
        if "**" in pattern:
            found.update(root.glob(pattern))
        else:
            found.update(root.rglob(pattern.lstrip("/")))
    return sorted(p for p in found if p.is_file())


def _index_file(
    index: MemoryIndex,
    path: Path,
    *,
    collection: str,
    project_slug: str | None,
    config: Config,
) -> tuple[int, bool]:
    path_str = str(path.resolve())
    sha = file_sha256(path)
    if index.get_file_sha(path_str) == sha:
        return 0, True

    try:
        if path.suffix.lower() in {".pdf", ".xlsx", ".xlsm", ".pptx"}:
            text = read_document(path)
        else:
            text = path.read_text(encoding="utf-8", errors="replace")
    except Exception as exc:
        raise RuntimeError(f"{path}: {exc}") from exc

    chunks = chunk_markdown(
        text,
        max_chars=config.chunk_max_chars,
        overlap=config.chunk_overlap_chars,
    )
    payload = [
        (c.chunk_index, c.section, c.line_start, c.content) for c in chunks
    ]
    if not payload and text.strip():
        payload = [(0, path.stem, 1, text.strip()[: config.chunk_max_chars])]

    count = index.upsert_file(
        path_str,
        sha,
        collection,
        project_slug,
        path.stat().st_mtime,
        payload,
    )
    return count, False


def collect_portfolio_files(config: Config) -> list[tuple[Path, str, str | None]]:
    items: list[tuple[Path, str, str | None]] = []
    root = config.global_memory_root
    if not root.exists():
        return items

    for path in _glob_files(root, ["**/*.md"]):
        if "share" in path.parts and "colleague-export" in path.parts:
            continue
        items.append((path, "portfolio", None))
    return items


def collect_project_files(
    config: Config, entries: list[ProjectEntry]
) -> list[tuple[Path, str, str | None]]:
    items: list[tuple[Path, str, str | None]] = []
    if not config.index_project_memories:
        return items
    for entry in entries:
        mem = entry.memory_path
        if mem and mem.is_file():
            items.append((mem, "project", entry.slug))
        mem_dir = entry.memory_dir
        if mem_dir:
            for path in _glob_files(mem_dir, ["**/*.md"]):
                items.append((path, "project", entry.slug))
    return items


def collect_knowledge_files(
    sources: list[KnowledgeSource],
) -> list[tuple[Path, str, str | None]]:
    items: list[tuple[Path, str, str | None]] = []
    for src in sources:
        if not src.path.exists():
            continue
        for path in _glob_files(src.path, src.patterns):
            items.append((path, src.collection, src.id))
    return items


def ingest_all(config: Config, index: MemoryIndex) -> IngestResult:
    registry_path = config.global_memory_root / "memory" / "wiki" / "projects-registry.md"
    entries = parse_projects_registry(registry_path)

    all_items: list[tuple[Path, str, str | None]] = []
    all_items.extend(collect_portfolio_files(config))
    all_items.extend(collect_project_files(config, entries))
    all_items.extend(collect_knowledge_files(config.knowledge_sources))

    result = IngestResult(errors=[])
    result.pruned_files = prune_missing_files(index)

    seen: set[Path] = set()
    for path, collection, slug in all_items:
        if path in seen:
            continue
        seen.add(path)
        try:
            chunks, skipped = _index_file(
                index, path, collection=collection, project_slug=slug, config=config
            )
            if skipped:
                result.skipped_files += 1
            else:
                result.indexed_files += 1
                result.chunk_count += chunks
        except Exception as exc:
            result.errors.append(str(exc))

    return result


def ingest_paths(
    config: Config, index: MemoryIndex, paths: list[str]
) -> IngestResult:
    registry_path = config.global_memory_root / "memory" / "wiki" / "projects-registry.md"
    entries = parse_projects_registry(registry_path)
    slug_by_path: dict[str, str] = {}
    for entry in entries:
        if entry.memory_path:
            slug_by_path[str(entry.memory_path.resolve())] = entry.slug
        if entry.memory_dir:
            for p in entry.memory_dir.rglob("*.md"):
                slug_by_path[str(p.resolve())] = entry.slug

    result = IngestResult(errors=[])
    for raw in paths:
        path = Path(raw).resolve()
        if not path.is_file():
            result.errors.append(f"Not found: {raw}")
            continue
        collection = "portfolio"
        slug = None
        path_str = str(path)
        if path_str in slug_by_path:
            collection = "project"
            slug = slug_by_path[path_str]
        elif config.global_memory_root in path.parents or path == config.global_memory_root:
            collection = "portfolio"
        else:
            for src in config.knowledge_sources:
                if src.path in path.parents or path == src.path:
                    collection = src.collection
                    slug = src.id
                    break

        try:
            chunks, skipped = _index_file(
                index, path, collection=collection, project_slug=slug, config=config
            )
            if skipped:
                result.skipped_files += 1
            else:
                result.indexed_files += 1
                result.chunk_count += chunks
        except Exception as exc:
            result.errors.append(str(exc))
    return result
