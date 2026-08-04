# Contributing

Public skills collection: https://github.com/shenwell/skills

## Layout

```
skills/<skill-name>/SKILL.md   ← what npx skills / skills.sh installs
docs/                          ← install + comparison docs
```

Local `.cursor/`, `templates/`, and `goals/` are **gitignored** — use them on your machine if you want; they are not published.

## Add a new skill

1. Create `skills/my-skill/SKILL.md` (`name` must match the folder).
2. Optional: `scripts/`, `references/`, `agents/`.
3. Verify:

   ```bash
   npx skills add . --list
   ```

4. List it under **Available skills** in `README.md`.
5. Push.

## Edit `goal-mode`

Edit `skills/goal-mode/` only. Optional local Cursor install:

```powershell
.\install-global.ps1 -Force
```

### Principles (goal-mode)

1. **Contract over vibes** — stop conditions in `GOAL.md` + verify commands.
2. **Worker ≠ verifier**.
3. **English** for public docs / SKILL.md.
4. **Deterministic scripts**.

### Test

```bash
npx skills add . --list
node skills/goal-mode/scripts/goal-bootstrap.js --json
```

## License

MIT
