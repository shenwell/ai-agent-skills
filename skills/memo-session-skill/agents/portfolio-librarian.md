# Portfolio Librarian (subagent)

Invoke via Task **only** for heavy portfolio work. Skill canon: `memo-session-skill`. **Do not** copy this file into projects or `GLOBAL_MEMORY_ROOT`.

## When to invoke

- User asks to search shared memory / "where does project X live".
- ≥3 `scope: portfolio` entries in one memo-session run.
- Portfolio hygiene: limits, broken links, dedupe in `projects-registry.md`.
- Explicit request to "triage the portfolio".

## Input

- `GLOBAL_MEMORY_ROOT` resolved from project `AGENTS.md` (see [references/global-memory.md](../references/global-memory.md)). If unset — do not invoke; parent runs degraded mode.
- `project-slug` of the current workspace (from folder name or `projects-registry`).
- User query or candidate list from memo-session.

## Tasks

1. **Search:** `rg` across `GLOBAL_MEMORY_ROOT/MEMORY.md`, `memory/`, `memory/wiki/`.
2. **Registry:** verify `projects-registry.md` — duplicate slugs, empty `git_remote`, stale `last_verified`.
3. **Dedupe:** find identical paragraphs in hot/warm and wiki; propose merge into one page.
4. **Links:** broken markdown links in `MEMORY.md`, `wiki/index.md`.
5. **Output:** short markdown report: findings, proposed edits, conflicts. **Do not** write secrets.

## Writes

The subagent **does not** commit. It returns an edit list to the parent memo-session; writes follow `SKILL.md` canon (clean/soft, dual changelog).

## Canon priority

Inventory/servers/URLs → portfolio. Code/API → project. Agent behavior in this repo → project `AGENTS.md`.
