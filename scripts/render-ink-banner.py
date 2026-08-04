#!/usr/bin/env python3
"""Render PM-SKILLS-style ink banners for README / SKILL.md."""

from __future__ import annotations

import sys
from typing import Iterable

GOAL_MODE_TITLE = [
    " ██████╗  ██████╗  █████╗ ██╗         ███╗   ███╗ ██████╗ ██████╗ ███████╗",
    "██╔════╝ ██╔═══██╗██╔══██╗██║         ████╗ ████║██╔═══██╗██╔══██╗██╔════╝",
    "██║  ███╗██║   ██║███████║██║         ██╔████╔██║██║   ██║██║  ██║█████╗  ",
    "██║   ██║██║   ██║██╔══██║██║         ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝  ",
    "╚██████╔╝╚██████╔╝██║  ██║███████╗    ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗",
    " ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝",
]

COLLECTION_TITLE = [
    " █████╗ ██╗     █████╗  ██████╗ ███████╗███╗   ██╗████████╗",
    "██╔══██╗██║    ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝",
    "███████║██║    ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ",
    "██╔══██║██║    ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ",
    "██║  ██║██║    ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ",
    "╚═╝  ╚═╝╚═╝    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ",
    "",
    "███████╗██╗  ██╗██╗██╗     ██╗     ███████╗",
    "██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝",
    "███████╗█████╔╝ ██║██║     ██║     ███████╗",
    "╚════██║██╔═██╗ ██║██║     ██║     ╚════██║",
    "███████║██║  ██╗██║███████╗███████╗███████║",
    "╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝",
]


def normalize_block(lines: Iterable[str]) -> list[str]:
    block = [line.rstrip() for line in lines if line.strip()]
    if not block:
        return []
    block = [line.lstrip(" ") for line in block]
    width = max(len(line) for line in block)
    return [line.ljust(width) for line in block]


def box(title_lines: Iterable[str], meta_lines: Iterable[str]) -> str:
    title = normalize_block(title_lines)
    meta = [line.strip() for line in meta_lines if line.strip()]
    content_width = max([len(line) for line in title + meta] + [0])
    inner = content_width + 4

    def row(line: str, *, align: str) -> str:
        if align == "left":
            body = f"  {line.ljust(content_width)}  "
        else:
            body = f"  {line:^{content_width}}  "
        return "║" + body + "║"

    top = "╔" + "═" * inner + "╗"
    bottom = "╚" + "═" * inner + "╝"
    blank = "║" + " " * inner + "║"

    rows = [top, blank]
    for line in title:
        rows.append(row(line, align="center"))
    rows.append(blank)
    for line in meta:
        rows.append(row(line, align="center"))
    rows.extend([blank, bottom])
    return "\n".join(rows)


BANNERS = {
    "collection": "README.md",
    "goal-mode": "skills/goal-mode/README.md",
}


def render(kind: str) -> str:
    if kind == "goal-mode":
        title = GOAL_MODE_TITLE
        meta = [
            "Keep agents working until tests, lint, typecheck, or CI are green",
            "Claude Code /goal alternative · Cursor · Codex · Cloud Agent",
            "v1.2.0 · August 2026 · MIT",
        ]
    elif kind == "collection":
        title = COLLECTION_TITLE
        meta = [
            "Public Agent Skills collection for coding agents",
            "Cursor · Claude Code · Codex · Windsurf · and more ...",
            "goal-mode · npx skills add shenwell/ai-agent-skills · MIT",
        ]
    else:
        raise SystemExit(f"unknown banner kind: {kind}")
    return box(title, meta)


def patch_markdown(path: str, banner: str) -> None:
    import re
    from pathlib import Path

    text = Path(path).read_text(encoding="utf-8")
    updated, count = re.subn(
        r"```\n╔.*?╚[═]+╝\n```",
        f"```\n{banner}\n```",
        text,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise SystemExit(f"banner block not found in {path}")
    Path(path).write_text(updated, encoding="utf-8", newline="\n")


def main() -> None:
    kind = sys.argv[1] if len(sys.argv) > 1 else "goal-mode"

    if kind == "apply":
        for banner_kind, path in BANNERS.items():
            patch_markdown(path, render(banner_kind))
        patch_markdown("skills/goal-mode/SKILL.md", render("goal-mode"))
        print("updated README.md, skills/goal-mode/README.md, skills/goal-mode/SKILL.md")
        return

    banner = render(kind)
    if len(sys.argv) > 2:
        with open(sys.argv[2], "w", encoding="utf-8", newline="\n") as handle:
            handle.write(banner + "\n")
    else:
        sys.stdout.reconfigure(encoding="utf-8")
        print(banner)


if __name__ == "__main__":
    main()
