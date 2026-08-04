# Dated entries

**Canonical order rules** for all journals with dates. Other protocol files reference this document only.

**Principle:** where events are recorded with **date and/or time**, order **newest to oldest** (reverse chronological). New entry — **at top** of list or block; new period (`## YYYY-MM`, `## YYYY-MM-DD`, table row with date) — **above** older ones.

## Journal files (required)

| File | How to write new |
|------|------------------|
| `memory/changelog.md` | Line `YYYY-MM-DD \| …` — **first** under `## YYYY-MM`; month without section — new `## YYYY-MM` right after intro, **above** older months |
| `memory/decisions.md` | Section `## YYYY-MM-DD` (or `YYYY-MM`) — **above** older dates; within section order as in session source |
| `memory/open-loops.md` | **`## Active`** — **always** right after intro, before closed archive; blocks "Closed in session …" / dated headers — **newer above** |
| `memory/hot-cache.md` / `warm-cache.md` | Only with `## YYYY-MM-DD` sections: new day **above**; bullets within day — new **at top** |
| `memory/wiki/agent-mistakes-registry.md` | Bullets with `last_verified` — new **at top** of list |
| `GLOBAL_MEMORY_ROOT/memory/*` | Same rules for portfolio |
| `~/.cursor/skills/memo-session-skill/references/changelog.md` | Like `memory/changelog.md` (skill evolution) |

**Table with date column** (e.g. project `memory/decisions.md`): new data rows — **right under** `|---|` separator, **above** older rows.

**Do not sort** by date without explicit journal header: thematic `##` in wiki (`Phase N`, `Prod`, `SEO`), `open-loops` / `hot-cache` by phase or subsystem without date in header; reference pages `WIKI_ROOT/*.md`.

## `memory/changelog.md` (details)

- **Path:** only **`memory/changelog.md`**. Do not keep parallel journal under `WIKI_ROOT/` or root `wiki/`.
- **Purpose:** short history of **intentional** skill edits: `MEMORY.md`, `memory/**`, `WIKI_ROOT/**`, `AGENTS.md`, `.cursor/rules/`, `.cursor/skills/`; `docs/` — only if skill actually changed them. Do not duplicate git diff.
- **Line:** `YYYY-MM-DD | action | affected paths | reason`. No secrets, tokens, passwords, PII.
- **When to add (Agent mode):** after skill edits in session (bootstrap, hygiene, soft/hard conflict after choice). No "pending" on unresolved hard conflict. Exception: only empty journal on bootstrap — one line.
- **Minimum:** session with skill edits — **at least one** meaningful line; otherwise do not touch file.
- **Meta:** do not confuse with **`references/changelog.md`** of this skill — project/portfolio journal **only** `memory/changelog.md`.
