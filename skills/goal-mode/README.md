```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ██████╗  ██████╗  █████╗ ██╗         ███╗   ███╗ ██████╗ ██████╗ ███████╗  ║
║  ██╔════╝ ██╔═══██╗██╔══██╗██║         ████╗ ████║██╔═══██╗██╔══██╗██╔════╝  ║
║   ██║  ███╗██║   ██║███████║██║         ██╔████╔██║██║   ██║██║  ██║█████╗   ║
║   ██║   ██║██║   ██║██╔══██║██║         ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝   ║
║  ╚██████╔╝╚██████╔╝██║  ██║███████╗    ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗  ║
║   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝  ║
║                                                                              ║
║      Keep agents working until tests, lint, typecheck, or CI are green       ║
║         Claude Code /goal alternative • Cursor • Codex • Cloud Agent         ║
║                          v1.2.0 • August 2026 • MIT                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)
[![skills.sh](https://img.shields.io/badge/skills.sh-npx%20skills%20add-black)](https://skills.sh/shenwell/ai-agent-skills/goal-mode)

**goal-mode** is an [Agent Skill](https://agentskills.io/) that keeps coding agents working until a **verifiable** finish line — tests green, lint clean, typecheck clean, or CI passing — instead of stopping after one attempt or claiming “done” without proof.

Durable `GOAL.md` contract · phased plans · worker ⇄ verifier · time budget · auto-resume.  
Open alternative to [Claude Code `/goal`](https://code.claude.com/docs/en/goal) for **Cursor**, Claude Code, Codex, and other hosts.

## Quickstart

### Install

**Global** — all projects on this machine:

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -g -a cursor -y
```

**This repository only**:

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -a cursor -y
```

Other agents: `-a claude-code`, `-a codex`, … (repeat `-a`). `-y` skips the agent picker.

### First run

In your project:

```
/goal Fix all ESLint errors in src; tests and build must pass
```

The first `/goal` **bootstraps the project** (config, hooks, command) automatically. No separate `node …/goal-bootstrap.js` step for normal use.

Collection: [AI Agent Skills](../../README.md) · full agent instructions: [`SKILL.md`](SKILL.md)

<details>
<summary>Optional — manual bootstrap</summary>

```bash
node ~/.cursor/skills/goal-mode/scripts/goal-bootstrap.js
# or after CLI copy:
node ~/.agents/skills/goal-mode/scripts/goal-bootstrap.js
```

</details>

## When to use

- “Keep going until tests pass” / “don’t stop until green”
- Fix all lint or type errors; make CI green
- Unattended / overnight / Cloud Agent multi-hour runs
- Resume a goal across sessions

**Prefer over** one-shot chat for long refactors and migrations.  
**Do not use** for one-shot Q&A or vague “make it better” without a measurable finish line.

## Layout

```
SKILL.md              ← agent instructions (required)
scripts/              ← init, status, verify, time, bootstrap
references/           ← protocols
agents/               ← Cursor subagents (bundled)
commands/goal.md      ← /goal slash command
project-scaffold/     ← hooks + config copied on bootstrap
templates/            ← GOAL.md / PHASE.md templates
```

## License

MIT (see [repo root](../../LICENSE)). Not affiliated with Anthropic or Claude Code.
