"""Configuration loading with env overrides."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

_ENV_VAR = re.compile(r"\$\{([A-Z_][A-Z0-9_]*)\}")


def _expand(value: str, env: dict[str, str]) -> str:
    def repl(match: re.Match[str]) -> str:
        key = match.group(1)
        return env.get(key, os.environ.get(key, ""))

    return _ENV_VAR.sub(repl, value)


def _resolve_path(raw: str | Path | None, env: dict[str, str]) -> Path | None:
    if raw is None:
        return None
    text = _expand(str(raw), env)
    return Path(os.path.expanduser(text)).resolve()


@dataclass
class KnowledgeSource:
    id: str
    path: Path
    collection: str = "documents"
    patterns: list[str] = field(default_factory=lambda: ["**/*.md"])


@dataclass
class Config:
    global_memory_root: Path
    index_dir: Path
    knowledge_sources: list[KnowledgeSource] = field(default_factory=list)
    index_project_memories: bool = True
    chunk_max_chars: int = 1800
    chunk_overlap_chars: int = 200

    @property
    def portfolio_memory_paths(self) -> list[Path]:
        root = self.global_memory_root
        candidates = [
            root / "MEMORY.md",
            root / "memory",
        ]
        return [p for p in candidates if p.exists()]


def default_config_paths() -> list[Path]:
    paths: list[Path] = []
    if env := os.environ.get("MEMO_SESSION_MCP_CONFIG"):
        paths.append(Path(env))
    home = Path.home()
    paths.extend(
        [
            home / ".config" / "memo-session-mcp" / "config.yaml",
            home / ".memo-session-mcp.yaml",
        ]
    )
    return paths


def load_config(config_path: Path | None = None) -> Config:
    env: dict[str, str] = {}
    if gm := os.environ.get("GLOBAL_MEMORY_ROOT"):
        env["GLOBAL_MEMORY_ROOT"] = gm

    data: dict[str, Any] = {}
    paths = [config_path] if config_path else []
    paths.extend(default_config_paths())
    for path in paths:
        if path and path.is_file():
            with path.open(encoding="utf-8") as fh:
                data = yaml.safe_load(fh) or {}
            break

    gm_raw = os.environ.get("GLOBAL_MEMORY_ROOT") or data.get(
        "global_memory_root", "~/global-memory"
    )
    idx_raw = os.environ.get("MEMO_SESSION_MCP_INDEX_DIR") or data.get(
        "index_dir", "~/.local/share/memo-session-mcp"
    )

    global_memory_root = _resolve_path(gm_raw, env)
    index_dir = _resolve_path(idx_raw, env)
    if global_memory_root is None or index_dir is None:
        raise ValueError("global_memory_root and index_dir must be set")

    sources: list[KnowledgeSource] = []
    for item in data.get("knowledge_sources") or []:
        path = _resolve_path(_expand(str(item["path"]), env), env)
        if path is None or not path.exists():
            continue
        sources.append(
            KnowledgeSource(
                id=str(item.get("id", path.name)),
                path=path,
                collection=str(item.get("collection", "documents")),
                patterns=list(item.get("patterns") or ["**/*.md"]),
            )
        )

    return Config(
        global_memory_root=global_memory_root,
        index_dir=index_dir,
        knowledge_sources=sources,
        index_project_memories=bool(data.get("index_project_memories", True)),
        chunk_max_chars=int(data.get("chunk_max_chars", 1800)),
        chunk_overlap_chars=int(data.get("chunk_overlap_chars", 200)),
    )
