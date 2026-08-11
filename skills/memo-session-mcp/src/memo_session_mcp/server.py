#!/usr/bin/env python3
"""
Memo Session MCP Server

Companion to memo-session-skill: hybrid FTS search over portfolio memory
(global-memory), registered project MEMORY.md / memory/, and optional document
corpora (PDF/XLSX via optional extras).

Setup:
    pip install -e "path/to/skills/memo-session-mcp"
    # optional: pip install -e "path/to/skills/memo-session-mcp[documents]"

    export GLOBAL_MEMORY_ROOT=~/global-memory
    memo-session-index reindex

Cursor ~/.cursor/mcp.json:
    "memo-session-mcp": {
      "command": "uv",
      "args": [
        "run",
        "--directory", "/path/to/ai-agent-skills/skills/memo-session-mcp",
        "memo-session-mcp"
      ],
      "env": {
        "GLOBAL_MEMORY_ROOT": "/path/to/global-memory"
      }
    }
"""

from __future__ import annotations

import asyncio
import json
import sys

from .config import load_config
from .ingest import ingest_all, ingest_paths
from .search_api import (
    get_source,
    resolve_project,
    search_all,
    search_documents,
    search_portfolio,
    search_project_memory,
)
from .store import MemoryIndex


def _self_test() -> None:
    print("=== Memo Session MCP Self-Test ===")
    try:
        config = load_config()
    except Exception as exc:
        print(f"  Config: FAILED ({exc})")
        print("  Set GLOBAL_MEMORY_ROOT or copy config.example.yaml")
        sys.exit(1)

    print(f"  global_memory_root: {config.global_memory_root}")
    print(f"  index_dir: {config.index_dir}")
    print(f"  portfolio exists: {config.global_memory_root.exists()}")

    index = MemoryIndex(config.index_dir)
    try:
        stats = index.stats()
        print(f"  index files: {stats['files']}, chunks: {stats['chunks']}")
        if stats["files"] == 0 and config.global_memory_root.exists():
            print("  Running initial ingest...")
            result = ingest_all(config, index)
            print(
                f"  indexed: {result.indexed_files}, "
                f"skipped: {result.skipped_files}, chunks: {result.chunk_count}"
            )
        if stats["files"] or index.stats()["files"]:
            sample = search_all(index, "project", limit=3)
            print(f"  sample search: {len(sample)} chars")
    finally:
        index.close()
    print("  Server ready.")
    sys.exit(0)


if "--test" in sys.argv:
    _self_test()


try:
    import mcp_types as types
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
except ImportError:
    print("MCP SDK not installed. Run: pip install mcp", file=sys.stderr)
    sys.exit(1)

_config = None
_index: MemoryIndex | None = None


def _cfg():
    global _config
    if _config is None:
        _config = load_config()
    return _config


def _idx() -> MemoryIndex:
    global _index
    if _index is None:
        _index = MemoryIndex(_cfg().index_dir)
    return _index


def _tool_definitions() -> list[types.Tool]:
    return [
        types.Tool(
            name="search_portfolio",
            description=(
                "Search portfolio/global memory (GLOBAL_MEMORY_ROOT): project registry, "
                "infra, domains, cross-project decisions, open loops. Use before answering "
                "questions about servers, paths, git remotes, or portfolio-wide context."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "limit": {"type": "integer", "default": 8},
                },
                "required": ["query"],
            },
        ),
        types.Tool(
            name="search_project",
            description=(
                "Search MEMORY.md and memory/ for a project slug from projects-registry.md."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "project_slug": {"type": "string"},
                    "limit": {"type": "integer", "default": 8},
                },
                "required": ["query", "project_slug"],
            },
        ),
        types.Tool(
            name="search_documents",
            description=(
                "Search optional document corpora (PDF/Excel/PPTX) configured in "
                "knowledge_sources. Requires [documents] extra at index time."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "limit": {"type": "integer", "default": 8},
                },
                "required": ["query"],
            },
        ),
        types.Tool(
            name="search_all",
            description=(
                "Unified search across portfolio, all indexed project memories, and "
                "document corpora. Prefer this when unsure which layer holds the answer."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "limit": {"type": "integer", "default": 10},
                },
                "required": ["query"],
            },
        ),
        types.Tool(
            name="resolve_project",
            description=(
                "Resolve project slug/name/path to registry entry: git_remote, "
                "local_path, project_memory, status."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "slug, name, or path fragment",
                    },
                },
                "required": ["query"],
            },
        ),
        types.Tool(
            name="get_source",
            description="Get full text chunk or file by source_path from search results.",
            inputSchema={
                "type": "object",
                "properties": {
                    "source_path": {"type": "string"},
                    "chunk_index": {"type": "integer", "default": 0},
                },
                "required": ["source_path"],
            },
        ),
        types.Tool(
            name="reindex",
            description=(
                "Full reindex of portfolio + registered projects + knowledge_sources. "
                "Call after memo-session-skill writes or when index is stale."
            ),
            inputSchema={"type": "object", "properties": {}},
        ),
        types.Tool(
            name="reindex_changed",
            description="Incremental reindex for specific file paths changed in a session.",
            inputSchema={
                "type": "object",
                "properties": {
                    "paths": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                },
                "required": ["paths"],
            },
        ),
        types.Tool(
            name="index_status",
            description="Show index statistics (file/chunk counts per collection).",
            inputSchema={"type": "object", "properties": {}},
        ),
    ]


async def _on_list_tools(
    _ctx: object, _params: types.PaginatedRequestParams | None
) -> types.ListToolsResult:
    return types.ListToolsResult(tools=_tool_definitions())


async def _on_call_tool(
    _ctx: object, params: types.CallToolRequestParams
) -> types.CallToolResult:
    name = params.name
    arguments = dict(params.arguments or {})
    idx = _idx()
    cfg = _cfg()

    if name == "search_portfolio":
        text = search_portfolio(idx, arguments["query"], arguments.get("limit", 8))
    elif name == "search_project":
        text = search_project_memory(
            idx,
            arguments["query"],
            arguments["project_slug"],
            arguments.get("limit", 8),
        )
    elif name == "search_documents":
        text = search_documents(idx, arguments["query"], arguments.get("limit", 8))
    elif name == "search_all":
        text = search_all(idx, arguments["query"], arguments.get("limit", 10))
    elif name == "resolve_project":
        text = resolve_project(cfg, arguments["query"])
    elif name == "get_source":
        text = get_source(
            idx,
            arguments["source_path"],
            arguments.get("chunk_index", 0),
        )
    elif name == "reindex":
        result = ingest_all(cfg, idx)
        text = json.dumps(
            {
                "indexed_files": result.indexed_files,
                "skipped_files": result.skipped_files,
                "pruned_files": result.pruned_files,
                "chunk_count": result.chunk_count,
                "errors": result.errors,
            },
            ensure_ascii=False,
            indent=2,
        )
    elif name == "reindex_changed":
        result = ingest_paths(cfg, idx, arguments.get("paths", []))
        text = json.dumps(
            {
                "indexed_files": result.indexed_files,
                "skipped_files": result.skipped_files,
                "pruned_files": result.pruned_files,
                "chunk_count": result.chunk_count,
                "errors": result.errors,
            },
            ensure_ascii=False,
            indent=2,
        )
    elif name == "index_status":
        stats = idx.stats()
        stats["global_memory_root"] = str(cfg.global_memory_root)
        text = json.dumps(stats, ensure_ascii=False, indent=2)
    else:
        text = f"Unknown tool: {name}"

    return types.CallToolResult(
        content=[types.TextContent(type="text", text=text)]
    )


server = Server(
    "memo-session-mcp",
    on_list_tools=_on_list_tools,
    on_call_tool=_on_call_tool,
)


async def _run_server() -> None:
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream, write_stream, server.create_initialization_options()
        )


def main_cli() -> None:
    asyncio.run(_run_server())


if __name__ == "__main__":
    main_cli()
