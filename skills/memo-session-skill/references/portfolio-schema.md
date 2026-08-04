# Portfolio memory schema

Root path: **`GLOBAL_MEMORY_ROOT`** — resolved only from `GLOBAL_MEMORY_ROOT:` in project `AGENTS.md` (see [global-memory.md](global-memory.md)). No default path in this skill.

## Scope (required for every finding)

| Scope | Where to write |
|-------|----------------|
| `project` | Current repository only (`memory/`, project wiki) |
| `portfolio` | `GLOBAL_MEMORY_ROOT` only |
| `both` | Body in global; in project **one link line** to `memory/wiki/project-<slug>.md` or registry |
| `skill` | `~/.cursor/skills/` or `.cursor/skills/` |
| `rule` | `AGENTS.md` / `.cursor/rules/` |
| `session-only` | Report only, no write |

### Anti-dup

- **Forbidden:** the same paragraph in project `hot-cache` and portfolio.
- **Allowed `both`:** link in project + full text in `project-<slug>.md` or portfolio thematic wiki.

## Criteria for `scope: portfolio`

At least 2 of: non-obvious, reusable, concrete, verified — **and** topic:

- another repository, server, domain, certificate, URL, integration;
- repeatable agent mistake across all repos;
- explicit request to "record globally".

Requires `GLOBAL_MEMORY_ROOT` to be set and available; otherwise route to project memory or skip with degraded-mode note.

## `projects-registry.md`

Columns:

| slug | name | git_remote | local_path | project_memory | last_verified | status |

- **git_remote** — canonical across machines (full URL).
- **local_path** — path on this PC (machine-specific; lives in portfolio, not in public skills).
- **status:** `active` | `archived` | `advisory`.

Details live in `memory/wiki/project-<slug>.md`; do not duplicate long tables in the registry.

## Required wiki pages (bootstrap)

- `projects-registry.md`
- `hosting-and-servers.md`
- `domains-and-certificates.md`
- `urls-and-environments.md`
- `agent-mistakes-registry.md`
- `agent-process.md`
- `project-<slug>.md` — as projects appear

## Conflict gate (portfolio)

| Knowledge type | Canon |
|----------------|--------|
| Servers, domains, repo paths, URL catalog | Portfolio |
| Agent behavior in this repo | Project `AGENTS.md` |
| Code, API, migrations | Project |

Source priority — as in [conflict-gate.md](conflict-gate.md), plus portfolio `decisions.md` and wiki between project `MEMORY.md` and project hot-cache.

## Entry metadata (recommended)

In portfolio bullets and cards: `source`, `project` (slug), `last_verified` (YYYY-MM-DD), `status`: verified | advisory | unknown.

## Limits (portfolio only)

| Layer | Limit |
|-------|-------|
| MEMORY.md | ≤300 |
| hot-cache | ≤150 |
| warm-cache | ≤250 |
| open-loops | ≤200 |
| decisions | ≤150 |
| wiki/*.md | ~700, then split |

Do not change project limits.

## Portfolio changelog and dated entries

Paths: `GLOBAL_MEMORY_ROOT/memory/changelog.md`, `decisions.md`, `open-loops.md`, dated sections in `hot-cache.md`, `agent-mistakes-registry.md`.

**Order:** as in [dated-entries.md](dated-entries.md) (newest first; `## Active` in open-loops pinned at top).

Changelog: same line format as project; in **reason** — `from:<slug>` of current workspace.

## Subagent

Heavy search/dedupe/hygiene: [../agents/portfolio-librarian.md](../agents/portfolio-librarian.md) — only from the skill catalog; do not copy into projects or the portfolio repo.
