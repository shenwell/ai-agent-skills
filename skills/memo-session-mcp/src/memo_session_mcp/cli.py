#!/usr/bin/env python3
"""CLI for indexing and self-test (no MCP required)."""

from __future__ import annotations

import argparse
import json
import sys

from .config import load_config
from .ingest import ingest_all, ingest_paths
from .search_api import search_all, search_portfolio
from .store import MemoryIndex


def main(argv: list[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    parser = argparse.ArgumentParser(description="Memo Session MCP index CLI")
    parser.add_argument(
        "--config",
        type=str,
        default=None,
        help="Path to config.yaml (or MEMO_SESSION_MCP_CONFIG)",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("status", help="Show index statistics")
    p_reindex = sub.add_parser("reindex", help="Full reindex of all sources")
    p_changed = sub.add_parser(
        "reindex-changed", help="Reindex specific file paths"
    )
    p_changed.add_argument("paths", nargs="+", help="File paths to reindex")
    p_search = sub.add_parser("search", help="Test search query")
    p_search.add_argument("query", help="Search query")
    p_search.add_argument(
        "--scope",
        choices=["all", "portfolio"],
        default="all",
    )

    args = parser.parse_args(argv)
    config = load_config(args.config and __import__("pathlib").Path(args.config))
    index = MemoryIndex(config.index_dir)

    try:
        if args.command == "status":
            stats = index.stats()
            stats["global_memory_root"] = str(config.global_memory_root)
            stats["exists"] = config.global_memory_root.exists()
            print(json.dumps(stats, indent=2, ensure_ascii=False))
            return 0

        if args.command == "reindex":
            result = ingest_all(config, index)
            print(
                json.dumps(
                    {
                        "indexed_files": result.indexed_files,
                        "skipped_files": result.skipped_files,
                        "chunk_count": result.chunk_count,
                        "errors": result.errors,
                    },
                    indent=2,
                    ensure_ascii=False,
                )
            )
            return 0 if not result.errors else 1

        if args.command == "reindex-changed":
            result = ingest_paths(config, index, args.paths)
            print(
                json.dumps(
                    {
                        "indexed_files": result.indexed_files,
                        "skipped_files": result.skipped_files,
                        "chunk_count": result.chunk_count,
                        "errors": result.errors,
                    },
                    indent=2,
                    ensure_ascii=False,
                )
            )
            return 0 if not result.errors else 1

        if args.command == "search":
            if args.scope == "portfolio":
                print(search_portfolio(index, args.query))
            else:
                print(search_all(index, args.query))
            return 0
    finally:
        index.close()

    return 1


if __name__ == "__main__":
    sys.exit(main())
