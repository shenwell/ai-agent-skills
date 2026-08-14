# memo-session-skill references

Progressive disclosure: `SKILL.md` is the pipeline skeleton; these files are normative detail. Read in order during Agent-mode execution (see **Agent execution contract** in `SKILL.md`).

| Step | File | Purpose |
|------|------|---------|
| Preflight | [preflight-protocol.md](preflight-protocol.md) | gitignore, hygiene, portfolio root, AGENTS.md, bootstrap |
| Inbox | [inbox-protocol.md](inbox-protocol.md) | `/inbox` queue → wiki + `memory/archive/` originals |
| Consolidate | [consolidation-protocol.md](consolidation-protocol.md) | digest, quality filter, temperature |
| Route | [routing-and-canon.md](routing-and-canon.md) | channels, wiki canon, git policy, skill analysis |
| Limits | [temperature-limits.md](temperature-limits.md) | HOT/WARM/COLD thresholds and compaction |
| Gate | [conflict-gate.md](conflict-gate.md) | clean/soft/hard, source priority, journal writes |
| Dated writes | [dated-entries.md](dated-entries.md) | reverse-chronological journal order |
| Report | [report-formats.md](report-formats.md) | wrap-up, analysis-only, handoff |
| Search | [portfolio-search.md](portfolio-search.md) | read-only portfolio lookup |

## Supporting references

| File | Purpose |
|------|---------|
| [trust-boundary.md](trust-boundary.md) | Write allowlist, untrusted input |
| [portfolio-schema.md](portfolio-schema.md) | scope, anti-dup, registry |
| [global-memory.md](global-memory.md) | `GLOBAL_MEMORY_ROOT` resolution |
| [agents-md-template.md](agents-md-template.md) | AGENTS.md memory-flow block |
| [goal-mode-integration.md](goal-mode-integration.md) | Optional goal-mode checkpoints |
| [dry-run-checklist.md](dry-run-checklist.md) | Maintainer verification |
| [changelog.md](changelog.md) | Skill evolution journal (not project `memory/changelog.md`) |
