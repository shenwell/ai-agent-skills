# Conflict gate and auto-start

## Auto-start

Invoking this skill is permission to start the pipeline: read context, run **preflight**, analyze session, classify findings, reconcile memory, prepare updates. Do not ask "start?" or require confirmation for clean updates.

After preflight and routing, **before writing** new facts from session run conflict gate:

1. **Project:** `MEMORY.md`, `WIKI_ROOT`, `memory/`, `AGENTS.md`, `.cursor/rules/`, project skills.
2. **Portfolio** (if `GLOBAL_MEMORY_ROOT` available): `GLOBAL_MEMORY_ROOT/MEMORY.md`, `memory/`, `memory/wiki/`, portfolio `AGENTS.md`.

Canon by type: inventory/servers/domains/URL/git_remote → **portfolio**; agent behavior in this repo → project `AGENTS.md`; code/API → **project**.

## Classify result

- `clean` — no contradictions. In Agent mode apply changes automatically; commit/push still only on explicit request.
- `soft conflict` — duplicate, stale wording, or obvious clarification. May update automatically if new version confirmed by current session; note in handoff as `Resolved automatically`.
- `hard conflict` — contradicts `approved_by: user`, `AGENTS.md`, `.cursor/rules/`, safety rule, git policy, secrets, or canon cannot be determined. Do not write disputed fragment; show conflict report and ask user to choose.

## Source priority for auto-resolution

1. Explicit current user instruction in this session.
2. Decisions with `approved_by: user` in `memory/decisions.md`, flat `adr-*.md` under `WIKI_ROOT/`, or other project canonical doc.
3. `AGENTS.md` and `.cursor/rules/`.
4. `MEMORY.md` as index.
5. `memory/hot-cache.md`, then `memory/warm-cache.md`.
6. `WIKI_ROOT/` pages (COLD), including `archived-*.md`.
7. Agent conclusion without confirmation — advisory only.

If current user instruction changes prior approved rule, do not overwrite silently: record new decision as supersedes and reflect in handoff.

## Journal write (Agent mode only, after actual file edits)

- **Project:** `memory/changelog.md`, and as needed `decisions` / `open-loops` / dated `hot-cache` — per [dated-entries.md](dated-entries.md).
- **Portfolio:** `GLOBAL_MEMORY_ROOT/memory/changelog.md` (and same portfolio journals) — same order; in changelog **reason** mandatory `from:<project-slug>` (slug of current workspace, not `global-memory`, if session was in another repo).

On **hard** conflict — journal entry **only after** user choice.

## Hard conflict format

```markdown
## Conflict resolution required

| # | Topic | Already in memory | New from session | Why conflict | Options |
|---|-------|-------------------|------------------|--------------|---------|
```

See [report-formats.md](report-formats.md) for full session wrap-up template.
