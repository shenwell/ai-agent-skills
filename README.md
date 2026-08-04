# Goal Mode

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   ██████╗  ██████╗  █████╗ ██╗         ███╗   ███╗ ██████╗       ║
║  ██╔════╝ ██╔═══██╗██╔══██╗██║         ████╗ ████║██╔═══██╗      ║
║  ██║  ███╗██║   ██║███████║██║         ██╔████╔██║██║   ██║      ║
║  ██║   ██║██║   ██║██╔══██║██║         ██║╚██╔╝██║██║   ██║      ║
║  ╚██████╔╝╚██████╔╝██║  ██║███████╗    ██║ ╚═╝ ██║╚██████╔╝      ║
║   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝ ╚═════╝       ║
║                                                                  ║
║     Open Goal Mode for AI coding agents                          ║
║     The durable-contract equivalent of Claude Code /goal         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)
[![skills.sh](https://skills.sh/b/shenwell/goal-mode)](https://skills.sh/shenwell/goal-mode)

You give the agent an **objective**. Goal Mode turns it into a **contract**, a **plan**, an **evidence loop**, and a **stop condition** — then keeps working until the goal is actually done.

Inspired by [Claude Code `/goal`](https://code.claude.com/docs/en/goal). Built to run on **Cursor** first, usable from **any Agent Skills–compatible IDE**.

---

## Why this exists

Claude Code `/goal` changed the game: the model that **works** is not the same mechanism that decides **done**.

Goal Mode brings that idea to the open Agent Skills ecosystem:

| Idea | Claude Code `/goal` | This repo |
|------|---------------------|-----------|
| Keep going across turns | Native Stop-hook evaluator | Session loop + stop hooks + automation |
| Verifiable finish line | Condition string | `GOAL.md` criteria + verify commands |
| Durable state | Session-scoped | Git-tracked `goals/{id}/` |
| Independent check | Small fast model | `goal-verifier` + scripts |
| Long runs | Session / headless | Cloud Agent + time budget + resume |

```
  WITHOUT GOAL MODE                 WITH GOAL MODE
  ─────────────────                 ──────────────
  "fix the lint errors"            /goal Fix all ESLint errors in src/
         │                                    │
         ▼                                    ▼
  agent tries a bit                 ┌─────────────────────┐
  claims "done"                     │ GOAL.md  contract   │
  you re-prompt                     │ criteria + evidence │
  context evaporates                │ budget + plan       │
                                    └──────────┬──────────┘
                                               │
                                    worker ⇄ verifier loop
                                    hooks resume on stop
                                    time report at the end
                                               │
                                               ▼
                                         COMPLETE (proven)
```

---

## Install (30 seconds)

### Via skills.sh / skills CLI (recommended)

```bash
npx skills add shenwell/goal-mode --skill goal-mode -g
```

Then bootstrap the **current project** (hooks, config, templates):

```bash
# macOS / Linux (path may be ~/.agents/skills or ~/.cursor/skills)
node ~/.cursor/skills/goal-mode/scripts/goal-bootstrap.js

# Windows PowerShell
node $env:USERPROFILE\.cursor\skills\goal-mode\scripts\goal-bootstrap.js
```

### Cursor one-liner (this machine / clone)

```powershell
.\install-global.ps1
```

Full multi-IDE instructions → **[docs/INSTALL.md](docs/INSTALL.md)**  
Claude Code comparison → **[docs/VS-CLAUDE-CODE.md](docs/VS-CLAUDE-CODE.md)**

---

## Quick start

In Cursor chat:

```
/goal Fix all ESLint errors in src/components; npm test and npm run build must pass
```

Or ask the agent:

```
Use goal-mode: eliminate TypeScript errors in packages/api until tsc exits 0
```

Pipeline (automatic):

```
     ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ BOOTSTRAP│──►│  INTAKE  │──►│  MASTER  │──►│  PHASES  │──►│ EXECUTE  │
     │ project  │   │ criteria │   │  table   │   │ expanded │   │ loop     │
     └──────────┘   └──────────┘   └──────────┘   └──────────┘   └────┬─────┘
                                                                      │
                         ┌────────────────────────────────────────────┘
                         ▼
              ┌────────────────────┐
              │  COMPLETE / BLOCKED│
              │  + time report     │
              └────────────────────┘
```

---

## Architecture (ink)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GOAL MODE PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────┤
│  CONTRACT          goals/{id}/GOAL.md  +  goal.config.yml               │
│                    criteria · evidence · budget · lifecycle             │
├─────────────────────────────────────────────────────────────────────────┤
│  COMMAND           /goal <text>                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  SKILL             goal-mode  — when to stop, how to iterate            │
├─────────────────────────────────────────────────────────────────────────┤
│  AGENTS            intake → planner → phase-planner → worker → verifier │
├─────────────────────────────────────────────────────────────────────────┤
│  HOOKS             sessionStart (context)  +  stop (auto-continue)      │
├─────────────────────────────────────────────────────────────────────────┤
│  SCRIPTS           init · status · verify · time · bootstrap            │
├─────────────────────────────────────────────────────────────────────────┤
│  LONG RUN          Cloud Agent · automation re-trigger · max_hours      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Lifecycle

```
 DRAFT ──► INTAKE ──► PLANNING ──► PLANNED ──► ACTIVE ──► CONTINUE ──┐
                                                         │           │
                                                         └───────────┘
                                                               │
                    ┌──────────────┬──────────────┬────────────┤
                    ▼              ▼              ▼            │
               COMPLETE        BLOCKED         FAILED          │
                    │              │              │            │
                    └──────────────┴──────────────┴────────────┘
                              SESSION_TIME_REPORT.md
```

---

## What good goals look like

| Good | Poor |
|------|------|
| `npm run lint` exits 0 on `src/` | “Clean up the frontend” |
| All tests green + build succeeds | “Ship the feature” (no criteria) |
| Migrate module X; typecheck passes | Architectural choice with no verify |

---

## Configure verify commands

Edit `.cursor/goal.config.yml` after bootstrap:

```yaml
verify:
  test:  { command: "npm test", required: true }
  lint:  { command: "npm run lint", required: true }
  build: { command: "npm run build", required: false }

budget:
  max_iterations: 50
  max_hours: 8

execution:
  mode: run_until_complete
  max_steps_per_session: 10

time_tracking:
  enabled: true
  report_on_terminal: true
```

---

## Time report

After a run finishes (or budget hits):

```bash
node .cursor/skills/goal-mode/scripts/goal-time.js report goals/<id>
```

→ `goals/<id>/SESSION_TIME_REPORT.md` — wall-clock time and activity breakdown.

---

## Repository layout

```
goal-mode/
├── skills/goal-mode/          # ← skills.sh / npx skills add entry
│   ├── SKILL.md
│   ├── scripts/
│   ├── references/
│   ├── agents/                # Cursor subagents (bundled)
│   ├── commands/goal.md
│   ├── templates/
│   └── project-scaffold/      # hooks + config for bootstrap
├── docs/
│   ├── INSTALL.md
│   └── VS-CLAUDE-CODE.md
├── .cursor/                   # Cursor-native copy for this repo
├── templates/
├── goals/                     # active goals live here in consumer projects
├── install-global.ps1
├── install.ps1
└── LICENSE
```

---

## Security note

This skill includes **scripts** that run shell commands (verify, status, hooks). Review them before installing in sensitive environments. Prefer pinning a git commit when installing.

---

## License

MIT — see [LICENSE](LICENSE).

Not affiliated with Anthropic or Claude Code. “Goal Mode” here means an open, contract-based autonomous loop inspired by the `/goal` workflow.
