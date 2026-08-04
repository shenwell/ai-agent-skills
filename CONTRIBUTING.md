# Contributing

Thanks for improving Goal Mode.

## Layout

- **Public skill package:** `skills/goal-mode/` (what [skills.sh](https://skills.sh) / `npx skills add` installs)
- **Cursor working copy:** `.cursor/skills/goal-mode/` (keep in sync with the public package)
- **Docs:** `docs/INSTALL.md`, `docs/VS-CLAUDE-CODE.md`

After editing the skill, sync both trees (or edit `skills/goal-mode` and copy to `.cursor`).

```powershell
Copy-Item -Path .\skills\goal-mode\* -Destination .\.cursor\skills\goal-mode\ -Recurse -Force
.\install-global.ps1 -Force
```

## Principles

1. **Contract over vibes** — stopping rules live in `GOAL.md` + verify commands.
2. **Worker ≠ verifier** — never let the implementer alone declare COMPLETE.
3. **English for public surfaces** — README, SKILL.md, INSTALL, comparison docs.
4. **Scripts stay deterministic** — no network calls in hooks without clear need.

## Test locally

```bash
npx skills add . --list
node skills/goal-mode/scripts/goal-bootstrap.js --json
node skills/goal-mode/scripts/goal-status.js goals/example-eslint --json
```

## License

MIT
