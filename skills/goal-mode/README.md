# goal-mode

<p align="center">
  <img src="assets/banner.png" alt="GOAL MODE" width="1024" />
</p>

Keep the agent working until the goal is **verifiably done** (tests green, lint clean, build passing) — not after one attempt and a hopeful “done”.

Durable `GOAL.md` contract · phased plans · worker ⇄ verifier · time budget · auto-resume.  
Open alternative to [Claude Code `/goal`](https://code.claude.com/docs/en/goal).

## Install

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -g
node ~/.cursor/skills/goal-mode/scripts/goal-bootstrap.js
```

Then: `/goal Fix all ESLint errors in src; tests and build must pass`

Collection README: [../../README.md](../../README.md)

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

MIT (see repo root).
