# Publish to skills.sh

There is **no separate registry upload**. [skills.sh](https://skills.sh) indexes public GitHub repos that people install with `npx skills add`.

## Checklist

1. Push this repo to **public** GitHub (`shenwell/goal-mode` or your name).
2. Confirm discovery locally:

   ```bash
   npx skills add shenwell/goal-mode --list
   # must show: goal-mode
   ```

3. Tell users:

   ```bash
   npx skills add shenwell/goal-mode --skill goal-mode -g
   node ~/.cursor/skills/goal-mode/scripts/goal-bootstrap.js
   ```

4. README already points at `shenwell/goal-mode` (badge + install commands).

5. Ranking on the leaderboard grows from **anonymous install telemetry** — share the install command.

## Required layout (already done)

```
skills/goal-mode/SKILL.md
```

## Security

Skills with `scripts/` run shell commands. Keep the Security note in the README. Prefer that consumers pin a commit for production use.
