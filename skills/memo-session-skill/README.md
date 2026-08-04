```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ███╗   ███╗███████╗███╗   ███╗ ██████╗     ███████╗███████╗███████╗███████╗ ║
║  ████╗ ████║██╔════╝████╗ ████║██╔═══██╗    ██╔════╝██╔════╝██╔════╝██╔════╝ ║
║  ██╔████╔██║█████╗  ██╔████╔██║██║   ██║    ███████╗█████╗  █████╗  ███████╗ ║
║  ██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██║   ██║    ╚════██║██╔══╝  ██╔══╝  ╚════██║ ║
║  ██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║╚██████╔╝    ███████║███████╗███████╗███████║ ║
║  ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝     ╚══════╝╚══════╝╚══════╝╚══════╝ ║
║                                                                              ║
║     Session knowledge → MEMORY.md · memory/ · wiki · portfolio memory        ║
║              Pairs with goal-mode checkpoints · Cursor · MIT                 ║
║                          v1.0.2 · August 2026                                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)
[![skills.sh](https://img.shields.io/badge/skills.sh-npx%20skills%20add-black)](https://skills.sh/shenwell/ai-agent-skills/memo-session-skill)

**memo-session-skill** is an [Agent Skill](https://agentskills.io/) that analyzes the work session, separates noise from durable knowledge, and routes findings into the right channel: `MEMORY.md`, `memory/` (HOT/WARM), wiki, `AGENTS.md`, skills, and optional portfolio memory.

Conflict gate, temperature limits, dual-write to portfolio without duplicates.

## Quickstart

### Install

**Global** — all projects on this machine:

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```

**This repository only:**

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -a cursor -y
```

**With goal-mode** (recommended):

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -g -a cursor -y
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```

### First run

In your project after a non-trivial session:

```
wrap up the session
```

or

```
save what we learned and handoff
```

The skill runs preflight (gitignore, bootstrap `memory/` scaffold), classification, and writes automatically. Commit only on explicit request.

Collection: [AI Agent Skills](../../README.md) · full agent instructions: [`SKILL.md`](SKILL.md)

## When to use

- "wrap up the session", "save what we learned", "handoff", "open loops"
- After debugging, workarounds, user corrections, architectural decisions
- **Automatically** from goal-mode: phase complete, `BLOCKED`, `COMPLETE`, session step limit

**Do not use** for one-line trivia, secrets, or replacing git log.

## goal-mode pairing

Goal Mode drives `GOAL.md` and verification until green. Memo-session preserves durable context across iterations and sessions.

| goal-mode event | Memo depth |
|-----------------|------------|
| Phase complete | `full` pipeline |
| BLOCKED / COMPLETE | `full` |
| Session step limit / every N iterations | `light` (hot-cache) |

Details: [`references/goal-mode-integration.md`](references/goal-mode-integration.md) · [goal-mode memory checkpoints](../goal-mode/references/memory-checkpoints.md)

## Layout

```
SKILL.md              ← agent protocol (required)
references/           ← portfolio, global-memory, goal-mode, templates
agents/               ← portfolio-librarian (optional subagent)
```

## License

MIT (see [repo root](../../LICENSE)).
