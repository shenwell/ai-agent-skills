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
║     Session knowledge → MEMORY.md · memory/ · wiki · optional portfolio      ║
║         Standalone · trust boundary · Cursor · MIT · v1.0.3                  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)
[![skills.sh](https://img.shields.io/badge/skills.sh-npx%20skills%20add-black)](https://skills.sh/shenwell/ai-agent-skills/memo-session-skill)

**memo-session-skill** is an [Agent Skill](https://agentskills.io/) that analyzes the work session, separates noise from durable knowledge, and routes findings into the right channel: `MEMORY.md`, `memory/` (HOT/WARM), wiki, `AGENTS.md`, and optionally a user-configured portfolio root.

Conflict gate, temperature limits, explicit write allowlist. **No network calls during sessions.** See [`references/trust-boundary.md`](references/trust-boundary.md).

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

### First run

In your project after a non-trivial session:

```
wrap up the session
```

The skill runs preflight (gitignore, bootstrap `memory/` scaffold), classification, and writes automatically. Commit only on explicit request.

Collection: [AI Agent Skills](../../README.md) · protocol: [`SKILL.md`](SKILL.md)

## When to use

- "wrap up the session", "save what we learned", "handoff", "open loops"
- After debugging, workarounds, user corrections, architectural decisions

**Do not use** for one-line trivia, secrets, or replacing git log.

## Security (skills.sh audits)

| Auditor | Typical result |
|---------|----------------|
| Gen Agent Trust Hub | Pass (SAFE) |
| Snyk | Pass |
| Socket | May show LOW **Warn** on skills that write local files — review [Socket detail](https://skills.sh/shenwell/ai-agent-skills/memo-session-skill/security/socket) |

This skill is **standalone** — it does not install other skills during execution. Optional [goal-mode integration](references/goal-mode-integration.md) is documented separately.

## Layout

```
SKILL.md              ← agent protocol (required)
references/           ← trust-boundary, portfolio, global-memory, templates
agents/               ← portfolio-librarian (optional subagent)
```

## License

MIT (see [repo root](../../LICENSE)).
