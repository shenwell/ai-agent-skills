# Contributing

This repository is a **public skills collection**: https://github.com/shenwell/skills

## Layout

```
skills/<skill-name>/SKILL.md   ← what npx skills / skills.sh installs
.cursor/skills/<skill-name>/   ← Cursor maintainer copy (keep in sync)
docs/                          ← install + comparison docs
```

## Add a new skill

1. Create `skills/my-skill/SKILL.md` with `name` + `description` frontmatter (`name` must match the folder).
2. Add optional `scripts/`, `references/`, `agents/`.
3. Verify discovery:

   ```bash
   npx skills add . --list
   ```

4. List it under **Available skills** in `README.md`.
5. Open a PR or push to `main`.

## Edit `goal-mode`

Prefer editing `skills/goal-mode/`, then sync:

```powershell
Copy-Item -Path .\skills\goal-mode\* -Destination .\.cursor\skills\goal-mode\ -Recurse -Force
.\install-global.ps1 -Force
```

### Principles (goal-mode)

1. **Contract over vibes** — stop conditions live in `GOAL.md` + verify commands.
2. **Worker ≠ verifier** — implementer alone must not declare COMPLETE.
3. **English for public surfaces** — README, SKILL.md, INSTALL docs.
4. **Scripts stay deterministic** — no surprise network in hooks.

### Test

```bash
npx skills add . --list
node skills/goal-mode/scripts/goal-bootstrap.js --json
node skills/goal-mode/scripts/goal-status.js goals/example-eslint --json
```

## License

MIT
