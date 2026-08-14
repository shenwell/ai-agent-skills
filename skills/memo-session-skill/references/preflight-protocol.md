# Preflight protocol

Run **on every invocation** after [Step 1: Understand context](../SKILL.md#step-1-understand-context), before session digest.

## 1. `.gitignore` check

Read `.gitignore` (and if needed `.git/info/exclude`). If **`MEMORY.md`**, **`memory/`** root, or **wiki root** (actual `WIKI_ROOT`, see [routing-and-canon.md](routing-and-canon.md)) is ignored — **do not edit the file silently**: show a prominent block in the report and propose removing those lines **only after explicit user consent**. If these paths are **not** ignored — **do not change** ignore.

## 2. Hygiene scan

- Count lines in `MEMORY.md`, `memory/hot-cache.md`, `memory/warm-cache.md`, `memory/open-loops.md`, `memory/decisions.md` (if files exist).
- Check for **`memory/changelog.md`** (see [dated-entries.md](dated-entries.md)), **`WIKI_ROOT/index.md`**, and **`memory/inbox/README.md`**.
- If `MEMORY.md` or `WIKI_ROOT/index.md` has markdown links to paths inside the repo — flag broken links (missing file), including link to **`memory/changelog.md`** if present.
- **Legacy:** if old journal `WIKI_ROOT/changelog.md` or `wiki/changelog.md` exists with accepted canon **`memory/changelog.md`** — do not delete without explicit request; add one line to **Memory hygiene** "migrate entries to `memory/changelog.md`".
- **Legacy:** if `memory/feedback/`, `memory/projects/`, `memory/references/` exist — do not delete; propose moving **wiki articles** to `WIKI_ROOT/*.md` and link from `index.md`. If `memory/archive/` holds markdown articles that belong in wiki — same proposal. Keep PDFs, Office files, and full transcripts in `archive/` as **source originals** ([inbox-protocol.md](inbox-protocol.md)).

See [temperature-limits.md](temperature-limits.md) for thresholds. Exceeding limits **does not block** the pipeline: add **`Memory hygiene`** block — demote HOT→WARM, promote WARM→wiki, compress index.

## 1.5. GLOBAL_MEMORY_ROOT (portfolio)

1. Read [global-memory.md](global-memory.md).
2. Resolve `GLOBAL_MEMORY_ROOT:` from project `AGENTS.md` only — **no baked-in default path** in this skill.
3. If set: verify directory exists and is readable. In Agent mode if scaffold missing — bootstrap portfolio per [portfolio-schema.md](portfolio-schema.md) (like project §3 below, with portfolio limits).
4. If unset, missing, or unreadable — **degraded mode**; continue with project preflight only; report "Portfolio skipped".

## 1.6. Project `AGENTS.md` check (memory flow)

Checklist (mark ok / needs patch):

- [ ] "Agent memory" / "Memory flow" block (project read order at minimum)
- [ ] If portfolio is used: `GLOBAL_MEMORY_ROOT:` with a **user-defined** path (never a maintainer's machine path)
- [ ] If portfolio is used: dual-write on memo-session without duplicate paragraphs
- [ ] **No** requirement to copy `memo-session-skill` into the project

In **Agent mode**, if block missing and workspace is a project repo (not the portfolio-memory repo itself): add template from [agents-md-template.md](agents-md-template.md) (do not rewrite entire `AGENTS.md`).

## 2b. Hygiene scan (portfolio)

If `GLOBAL_MEMORY_ROOT` available — same checks as §2 for portfolio; limits — [temperature-limits.md](temperature-limits.md) § Portfolio limits. Separate **Portfolio hygiene** block in report.

## 3. Bootstrap scaffold (Agent mode only)

If any required canon element is missing — **create missing** with short template (heading + 2–5 lines of purpose). **Do not** overwrite existing files wholesale. **Do not** create `memory/feedback/`, `projects/`, `references/` as a wiki substitute. **Do** create `memory/inbox/` (ingest queue). Do **not** put wiki articles in `memory/archive/`; that tree is **source originals** after inbox intake — create it on first document/transcript ingest, not as a second wiki. Durable articles stay in wiki (COLD).

For **`memory/inbox/README.md`** on create:

```markdown
# Inbox

Drop materials here for the agent to ingest (`/inbox` or "process inbox").

After processing: extracts go to wiki / memory layers; originals that are not wiki pages go to `memory/archive/`; the ticket is deleted. This README stays.
```

For **`memory/warm-cache.md`** on create:

```markdown
# Warm cache

Medium memory: demote from HOT; promote stable items to wiki (COLD).
```

For **`memory/changelog.md`** on create, minimal scaffold is enough (full format in [dated-entries.md](dated-entries.md)):

```markdown
# Changelog

Project memory change journal.

## YYYY-MM

```

Substitute current month for `YYYY-MM`.

If **`MEMORY.md`** missing — create **agent instruction** template (≤60 lines on first bootstrap; ≤200 long-term):

```markdown
# Project memory

Entry point for repository memory. Does not duplicate wiki or replace git log.

## Temperatures

| Layer | File / place | Meaning |
|-------|----------------|--------|
| HOT | [hot-cache](memory/hot-cache.md) | Context for next 1–3 sessions |
| WARM | [warm-cache](memory/warm-cache.md) | Medium memory; demote from HOT |
| COLD | [Wiki](memory/wiki/index.md) | Transferable articles (`WIKI_ROOT/*.md`) |

Demote down (HOT→WARM), promote to wiki (WARM→COLD). WARM — bullets and links, not essays.

## Agent flow

1. Read this file → `hot-cache` → as needed `warm-cache` → `open-loops` / `decisions`.
2. Urgent new item → HOT.
3. HOT full or item cooled → WARM (one link line in HOT if needed).
4. Stable / process / ADR / long text → wiki page + link in `index.md` / here.
5. Behavior rules ("never do X") → `AGENTS.md` / `.cursor/rules/`, not warm-cache.
6. After skill edits → [changelog](memory/changelog.md) and other journals with date — **at top** (see [dated-entries.md](dated-entries.md)). Commit — only on user request.
7. New material to ingest → `memory/inbox/` then `/inbox`.

Limits and conflict gate: **memo-session-skill**.

## Map

- [changelog](memory/changelog.md) · [hot-cache](memory/hot-cache.md) · [warm-cache](memory/warm-cache.md)
- [open-loops](memory/open-loops.md) · [decisions](memory/decisions.md)
- [Wiki — entry](memory/wiki/index.md) · [inbox](memory/inbox/README.md)
```
