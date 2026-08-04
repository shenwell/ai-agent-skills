# goal-mode

<p align="center">
  <img src="assets/banner.png" alt="GOAL MODE" width="1024" />
</p>

Open **Goal Mode** for AI coding agents — durable-contract equivalent of [Claude Code `/goal`](https://code.claude.com/docs/en/goal).

## Install

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -g
node ~/.cursor/skills/goal-mode/scripts/goal-bootstrap.js
```

Then: `/goal <your objective>`

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
