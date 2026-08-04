# Install Goal Mode

Goal Mode follows the [Agent Skills](https://agentskills.io/) format and installs with the open [`skills` CLI](https://github.com/vercel-labs/skills) used by [skills.sh](https://skills.sh/).

---

## Universal install (skills CLI)

```bash
# List what will be discovered
npx skills add shenwell/skills --list

# Install goal-mode globally for your user
npx skills add shenwell/skills --skill goal-mode -g -y

# Or project-scoped (committed with the repo)
npx skills add shenwell/skills --skill goal-mode -y
```

After install, **bootstrap the project** so hooks/config/templates exist:

```bash
# Try common install locations (use the one that exists on your machine)
node ~/.cursor/skills/goal-mode/scripts/goal-bootstrap.js --json
node ~/.agents/skills/goal-mode/scripts/goal-bootstrap.js --json
node ~/.claude/skills/goal-mode/scripts/goal-bootstrap.js --json
node ~/.codex/skills/goal-mode/scripts/goal-bootstrap.js --json

# Windows PowerShell
node $env:USERPROFILE\.cursor\skills\goal-mode\scripts\goal-bootstrap.js --json
```

Then open Agent chat and run:

```
/goal <your objective>
```

or:

```
Follow the goal-mode skill. Objective: <your objective>
```

---

## Cursor

### Option A — skills CLI (recommended for publishing consumers)

1. `npx skills add shenwell/skills --skill goal-mode -g -y`
2. Bootstrap (above)
3. Restart Cursor if `/goal` does not appear
4. Edit `.cursor/goal.config.yml` verify commands

### Option B — clone installer

```powershell
git clone https://github.com/shenwell/skills.git
cd goal-mode
.\install-global.ps1          # user-global skill + agents + /goal
# or into one project:
.\install.ps1 -Target D:\path\to\your-app
```

### What Cursor gets (full stack)

| Piece | Path |
|-------|------|
| Skill | `~/.cursor/skills/goal-mode` or `.cursor/skills/goal-mode` |
| Slash command | `.cursor/commands/goal.md` → `/goal` |
| Subagents | `.cursor/agents/goal-*.md` |
| Hooks | `.cursor/hooks.json` + `hooks/goal-*.js` |
| Config | `.cursor/goal.config.yml` |

Enable **Cloud Agent** long-running for 6h+ sessions — see `skills/goal-mode/references/cloud-agent-setup.md`.

---

## Claude Code

Claude Code has a **native** [`/goal`](https://code.claude.com/docs/en/goal) command (v2.1.139+). Use this skill when you want:

- a **git-durable** goal contract (`GOAL.md`) across sessions/machines
- hierarchical planning artifacts
- portable verify scripts shared with Cursor teammates

### Install

```bash
npx skills add shenwell/skills --skill goal-mode -g -y
# skill often lands in ~/.claude/skills/goal-mode
```

### Usage pattern

1. Ask Claude to follow **goal-mode** and create `goals/{id}/GOAL.md` via `goal-init.js`.
2. Run intake → plan → execute protocols from the skill.
3. Optionally combine with native `/goal` for the stop condition, e.g.:

```text
/goal goals/fix-eslint/GOAL.md status is COMPLETE (or BLOCKED/FAILED), verified by goal-verifier
```

4. Use `goal-status.js` / `goal-verify.js` as deterministic checks inside the condition when possible.

See [VS-CLAUDE-CODE.md](VS-CLAUDE-CODE.md).

---

## OpenAI Codex / ChatGPT agent skills

```bash
npx skills add shenwell/skills --skill goal-mode -g -y
# often: ~/.codex/skills/goal-mode
```

Invoke by name (“use goal-mode”) or `/goal-mode` if your Codex build lists skills as slash commands. Run bootstrap if you want project files; Codex may not load Cursor hooks — the **skill protocol + scripts** still apply.

---

## Windsurf / Cascade

```bash
npx skills add shenwell/skills --skill goal-mode -g -y
```

If the CLI offers a Windsurf target, select it. Otherwise copy:

```text
skills/goal-mode/  →  ~/.codeium/windsurf/skills/goal-mode/
```

(or the skills path shown by your Windsurf version). Bootstrap for `goals/` + templates; hooks are Cursor-specific.

---

## GitHub Copilot Chat (skills-compatible builds)

```bash
npx skills add shenwell/skills --skill goal-mode -g -y
```

Use the skill when asking Copilot to run an autonomous objective. Prefer **project-scoped** install so `goals/` stays in the repo.

---

## Amp, Aider, Goose, and others

Any host that discovers Agent Skills directories can load `SKILL.md`.

Minimum viable path without Cursor hooks:

1. Install the skill folder.
2. Create a goal: `node <skill>/scripts/goal-init.js "…"`.
3. Tell the agent: follow `SKILL.md` session loop; update `GOAL.md` every iteration.
4. Run `goal-verify.js` / `goal-status.js` for evidence.

---

## Verify discovery

```bash
npx skills add shenwell/skills --list
# should show: goal-mode
```

```bash
npx skills list
# should include goal-mode after install
```

---

## Updating

```bash
npx skills update
# or re-add
npx skills add shenwell/skills --skill goal-mode -g -y --force
```

From a clone:

```powershell
.\install-global.ps1 -Force
```

Then re-run bootstrap in active projects if scaffold changed:

```bash
node <skill>/scripts/goal-bootstrap.js --force --json
```

---

## Uninstall

```bash
npx skills remove goal-mode
```

Remove project leftovers manually if desired: `.cursor/hooks*`, `.cursor/goal.config.yml`, `goals/` (keep if you still need audit history).
