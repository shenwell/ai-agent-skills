# Consolidation protocol

Session digest, quality filter, and temperature classification — after preflight, before routing.

## Session digest (memory consolidation)

Distill volatile session context into a short human-readable summary before routing:

- what was done;
- what was learned;
- what was verified by facts;
- what remains hypothesis;
- what broke or was unexpected;
- decisions made;
- open promises, blockers, and follow-ups.

Separately note user corrections: "never do X", "always do Y", "this is the right approach". These are candidates for **`AGENTS.md`**, **`.cursor/rules/`**, or wiki page `user-preferences.md`, not `warm-cache`.

## Quality filter

Save only knowledge that passes at least 2 of 4 criteria:

- **Non-obvious:** cannot be easily recovered from code, README, or git log.
- **Reusable:** useful in future sessions.
- **Concrete:** contains action, example, file, command, condition, or verifiable fact.
- **Verified:** checked in this session or explicitly approved by the user.

Fifth criterion is mandatory: **right channel**. Even strong knowledge must not go to memory if it belongs in `AGENTS.md`, documentation, test, or existing skill `references/`.

Sixth criterion is mandatory: **`scope`** — `project` | `portfolio` | `both` | `skill` | `rule` | `session-only` (see [portfolio-schema.md](portfolio-schema.md)). Before write **anti-dup**: one paragraph must not appear in both project hot-cache and portfolio; for `both` — link in project, body in `GLOBAL_MEMORY_ROOT/memory/wiki/project-<slug>.md`.

## Temperature classification

Typed **memory architecture** — map each finding to temperature (and optionally cognitive role):

| Temperature | Cognitive role (informative) | Storage |
|-------------|------------------------------|---------|
| HOT | Episodic / working — next 1–3 sessions | `memory/hot-cache.md` |
| WARM | Medium recall — still active, not urgent | `memory/warm-cache.md` |
| COLD | Semantic / procedural — stable transferable knowledge | **`WIKI_ROOT/`** (flat wiki) |

For each finding choose class:

- `session-only` — useful for report, do not save.
- `HOT` — needed in next 1–3 sessions → `memory/hot-cache.md`.
- `WARM` — still needed by agent, not in HOT → `memory/warm-cache.md` (bullets, not article).
- `COLD` — durable transferable knowledge → **`WIKI_ROOT/`** (flat wiki).
- `durable-doc` — project canon: default **wiki**; `AGENTS.md` / `.cursor/rules/` for agent rules; `docs/` — only if explicit in `AGENTS.md` or user request (see [routing-and-canon.md](routing-and-canon.md) § docs/ and wiki).
- `regression` — bug better fixed with a test.
- `skill-update` — short rule, trigger, or gotcha in existing `SKILL.md`.
- `skill-reference` — large topic in `references/<topic>.md` of existing skill plus link from `SKILL.md`.

For each saved finding specify **`scope`** (required). HOT/WARM/COLD temperature applies **within** chosen channel (project or portfolio).
