# shenwell/skills

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   ███████╗██╗  ██╗██╗██╗     ██╗     ███████╗                    ║
║   ██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝                    ║
║   ███████╗█████╔╝ ██║██║     ██║     ███████╗                    ║
║   ╚════██║██╔═██╗ ██║██║     ██║     ╚════██║                    ║
║   ███████║██║  ██╗██║███████╗███████╗███████║                    ║
║   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝                    ║
║                                                                  ║
║          Public Agent Skills collection                          ║
║          Install with:  npx skills add shenwell/skills           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)
[![skills.sh](https://skills.sh/b/shenwell/skills)](https://skills.sh/shenwell/skills)

Open [Agent Skills](https://agentskills.io/) for Cursor, Claude Code, Codex, Windsurf, and other compatible agents.  
Browse on [skills.sh](https://skills.sh/shenwell/skills).

```
shenwell/skills
└── skills/
    ├── goal-mode/          ← Claude Code /goal equivalent (open)
    └── <your-next-skill>/  ← add more packages here
```

---

## Install

```bash
# List skills in this repo
npx skills add shenwell/skills --list

# Install one skill (global)
npx skills add shenwell/skills --skill goal-mode -g

# Install everything from this collection
npx skills add shenwell/skills --all -g
```

Multi-IDE details → **[docs/INSTALL.md](docs/INSTALL.md)**

---

## Available skills

### `goal-mode`

**Open Goal Mode** — durable-contract equivalent of [Claude Code `/goal`](https://code.claude.com/docs/en/goal).

You give an objective. The skill builds a `GOAL.md` contract, hierarchical plan, worker⇄verifier loop, time budget, and auto-resume until `COMPLETE` / `BLOCKED` / `FAILED`.

```bash
npx skills add shenwell/skills --skill goal-mode -g
node ~/.cursor/skills/goal-mode/scripts/goal-bootstrap.js
```

Then in chat:

```
/goal Fix all ESLint errors in src; tests and build must pass
```

| | |
|-|-|
| Package | [`skills/goal-mode/`](skills/goal-mode/) |
| vs Claude Code | [docs/VS-CLAUDE-CODE.md](docs/VS-CLAUDE-CODE.md) |
| Publish notes | [docs/PUBLISH.md](docs/PUBLISH.md) |

```
  YOU                          GOAL MODE                         DONE
   │                               │                               │
   │  /goal Fix lint errors        │                               │
   ├──────────────────────────────►│  intake → plan → execute      │
   │                               │  worker ⇄ verifier            │
   │                               ├──────────────────────────────►│
   │                               │         COMPLETE + report     │
```

---

## Goal Mode — why it exists

Claude Code `/goal` separates **doing work** from **deciding done**.  
`goal-mode` brings that to the open skills ecosystem with a **git-durable** contract:

| Idea | Claude Code `/goal` | `goal-mode` |
|------|---------------------|-------------|
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

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GOAL MODE PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────┤
│  CONTRACT          goals/{id}/GOAL.md  +  goal.config.yml               │
│  COMMAND           /goal <text>                                         │
│  SKILL             goal-mode — when to stop, how to iterate             │
│  AGENTS            intake → planner → phase-planner → worker → verifier │
│  HOOKS             sessionStart + stop (auto-continue)                  │
│  SCRIPTS           init · status · verify · time · bootstrap            │
│  LONG RUN          Cloud Agent · automation · max_hours                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Configure (after bootstrap)

```yaml
# .cursor/goal.config.yml
verify:
  test:  { command: "npm test", required: true }
  lint:  { command: "npm run lint", required: true }
budget:
  max_iterations: 50
  max_hours: 8
execution:
  mode: run_until_complete
```

### Time report

```bash
node .cursor/skills/goal-mode/scripts/goal-time.js report goals/<id>
```

→ `goals/<id>/SESSION_TIME_REPORT.md`

---

## Adding another public skill

```
skills/
└── my-skill/
    ├── SKILL.md          # required (name + description frontmatter)
    ├── scripts/          # optional
    ├── references/       # optional
    └── agents/           # optional
```

1. Create `skills/<name>/SKILL.md`
2. `npx skills add . --list` — confirm discovery
3. Document it in this README under **Available skills**
4. Push — install with `npx skills add shenwell/skills --skill <name>`

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Repository layout

```
skills/                         # this GitHub repo (collection)
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── docs/                       # install guides
├── skills/
│   └── goal-mode/              # ← the only skill package (add more here)
├── install-global.ps1          # optional Cursor helper
└── install.ps1                 # optional: bootstrap into a project
```

Everything an agent needs to run `goal-mode` is inside `skills/goal-mode/` (scripts, agents, hooks scaffold, templates).
---

## Security

Skills may include **scripts** that run shell commands. Review them before installing. Pin a git commit for production use.

---

## License

MIT — see [LICENSE](LICENSE).

Not affiliated with Anthropic or Claude Code.
