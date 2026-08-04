# goal-mode

<p align="center">
  <img src="assets/banner.png" alt="goal-mode Agent Skill — keep Cursor and Claude Code agents working until tests and CI are green" width="1024" />
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)
[![skills.sh](https://skills.sh/b/shenwell/ai-agent-skills/goal-mode)](https://skills.sh/shenwell/ai-agent-skills/goal-mode)

**goal-mode** is an [Agent Skill](https://agentskills.io/) that keeps coding agents working until a **verifiable** finish line — tests green, lint clean, typecheck clean, or CI passing — instead of stopping after one attempt or claiming “done” without proof.

Durable `GOAL.md` contract · phased plans · worker ⇄ verifier · time budget · auto-resume.  
Open alternative to [Claude Code `/goal`](https://code.claude.com/docs/en/goal) for **Cursor**, Claude Code, Codex, and other hosts.

## Quickstart — install with npx skills

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -g
node ~/.cursor/skills/goal-mode/scripts/goal-bootstrap.js
# also common after CLI install:
node ~/.agents/skills/goal-mode/scripts/goal-bootstrap.js
```

Then:

```
/goal Fix all ESLint errors in src; tests and build must pass
```

Collection: [AI Agent Skills](../../README.md) · full agent instructions: [`SKILL.md`](SKILL.md)

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
