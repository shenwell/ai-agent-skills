# memo-session-skill evolution (meta)

Not to be confused with project or portfolio `memory/changelog.md`.

## 2026-08

- 2026-08-14 | inbox protocol from practice | references/inbox-protocol.md, commands/inbox.md | classify by content (DOCX meetings); search before write; no hub dumps; UTF-8/scratch; manifests for paginated sources; transcript YAML + ASR note
- 2026-08-14 | inbox command completeness | commands/inbox.md | autonomy rule, inline pipeline fallback, Agent vs Ask/Plan; protocol paths relative to skill (`../references/…`)
- 2026-08-14 | inbox intake | SKILL.md, references/inbox-protocol.md, commands/inbox.md, preflight, routing, trust-boundary | v1.3.0; bootstrap `memory/inbox/`; `/inbox` extracts to wiki; source originals → `memory/archive/`
- 2026-08-04 | progressive disclosure refactor | SKILL.md, references/*.md | v1.1.0; split protocol into preflight, consolidation, routing-and-canon, dated-entries, temperature-limits, conflict-gate, report-formats, portfolio-search, references/README.md; SKILL.md ~280 lines
- 2026-08-04 | README cleanup | README.md | v1.0.5; remove skills.sh audit table from README (trust boundary stays in references/)
- 2026-08-04 | Socket audit hardening | SKILL.md Trust boundary, references/trust-boundary.md, goal-mode-integration.md | v1.0.3; standalone skill; no bundled install; explicit write allowlist
- 2026-08-04 | public publish | skills/memo-session-skill/, goal-mode integration | v1.0.0 in shenwell/ai-agent-skills; references/goal-mode-integration.md; memory-checkpoints cross-link
- 2026-08-04 | English translation | SKILL.md, README.md, references/, agents/ | v1.0.1; English-only triggers and protocol

## 2026-05

- 2026-05-27 | dated entries canon | SKILL.md, references/portfolio-schema.md, global-memory.md | all dated journals: newest first; not changelog-only
- 2026-05-27 | changelog order | SKILL.md, references/portfolio-schema.md, references/changelog.md | reverse chronological: new lines and months at top of `memory/changelog.md`
- 2026-05-26 | portfolio layer | SKILL.md, references/global-memory.md, portfolio-schema.md, agents/portfolio-librarian.md, agents-md-template.md | GLOBAL_MEMORY_ROOT; scope; anti-dup; dual changelog (hardcoded default path removed in v1.0.2)
