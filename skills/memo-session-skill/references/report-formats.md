# Report and handoff formats

## Session wrap-up (default)

On clean/soft updates do not block on prior approval. After applying show what changed:

```markdown
## Session wrap-up updates

### 1. Documentation, memory, tests

| # | File | Type | Status | Change |
|---|------|------|--------|--------|

### 2. Skills

| # | File | Type | Status | Change |
|---|------|------|--------|--------|

### 3. Skills reviewed without edits

- `skill-name` — reviewed, no edits needed.

### 4. Memory hygiene

- Thresholds: what exceeded; demote HOT→WARM, promote WARM→wiki.
- Preflight: gitignore (ok / needs user), bootstrap (what created), broken index links.

### 5. Changelog

- Project: **`memory/changelog.md`**
- Portfolio: **`GLOBAL_MEMORY_ROOT/memory/changelog.md`** (or "skipped")
- Brief: how many lines, for which events (format — [dated-entries.md](dated-entries.md)).

### 6. Portfolio memory

| # | File | scope | Status | Change |
|---|------|-------|--------|--------|
| … | … | project/portfolio/both | … | … |

- `GLOBAL_MEMORY_ROOT`: path, available / degraded
- AGENTS.md check: ok / patched / skipped (if workspace = global-memory)
```

Types: `doc-update`, `portfolio-update`, `rule-update`, `memory-new`, `memory-update`, `regression`, `skill-update`, `skill-reference`, `skill-new-incident`, `status`.

If hard conflicts exist, add separate `Conflict resolution required` block (see [conflict-gate.md](conflict-gate.md)) and do not apply disputed changes until user choice.

## Analysis-only format

If user asks analysis only, use:

```markdown
## Brief digest

## Key knowledge

## Open loops

## Decisions

## Worth saving

## Handoff for next session
```

## Handoff

At end of large session provide short handoff for **cross-session continuity**:

- `HOT`: what to keep in mind right now (working memory for next session).
- `Open loops`: open tasks and blockers.
- `Decisions`: approved and advisory decisions separately.
- `Next actions`: 1–5 concrete next steps.
- `Suggested memory updates`: what to save and where.
- `Memory hygiene`: preflight summary (gitignore, broken links, bootstrap) and temperature limit actions.
- `Changelog`: project and portfolio — updated / skipped (why).
- `Portfolio HOT` / `Portfolio open loops` / `Portfolio hygiene` — if portfolio available.

## Inbox intake

When the trigger is `/inbox` (not a session wrap-up), use:

```markdown
## Inbox intake

| Item | Type | Wiki | Archive | Status |
|------|------|------|---------|--------|

Index: reindexed N files | skipped (MCP offline)
```

Empty queue: one line, then stop. Include a **Where to look** navigation table if the project requires source citations.
