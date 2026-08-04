```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  █████╗ ██╗     █████╗  ██████╗ ███████╗███╗   ██╗████████╗   ║
║  ██╔══██╗██║    ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝  ║
║  ███████║██║    ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║     ║
║  ██╔══██║██║    ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║     ║
║  ██║  ██║██║    ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║     ║
║  ╚═╝  ╚═╝╚═╝    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝     ║
║  ███████╗██╗  ██╗██╗██╗     ██╗     ███████╗                  ║
║  ██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝                  ║
║  ███████╗█████╔╝ ██║██║     ██║     ███████╗                  ║
║  ╚════██║██╔═██╗ ██║██║     ██║     ╚════██║                  ║
║  ███████║██║  ██╗██║███████╗███████╗███████║                  ║
║  ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝                  ║
║                                                               ║
║       Public Agent Skills collection for coding agents        ║
║    Cursor · Claude Code · Codex · Windsurf · and more ...     ║
║   goal-mode · memo-session-skill · npx skills add shenwell/ai-agent-skills · MIT   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)
[![skills.sh](https://img.shields.io/badge/skills.sh-npx%20skills%20add-black)](https://skills.sh/shenwell/ai-agent-skills)

**Public [Agent Skills](https://agentskills.io/) for Cursor, Claude Code, Codex, Windsurf, and more.**  
- **`goal-mode`** — keep coding agents working until tests, lint, typecheck, or CI are green (open alternative to [Claude Code `/goal`](https://code.claude.com/docs/en/goal)).  
- **`memo-session-skill`** — turn session knowledge into durable `memory/`, wiki, and handoffs; pairs with goal-mode checkpoints.

Stops the common failure mode: the agent tries once, claims “done,” and leaves a red build.

```
shenwell/ai-agent-skills
└── skills/
    ├── goal-mode/              ← keep going until tests/lint/build are green
    ├── memo-session-skill/     ← session → memory/wiki/handoff
    └── <next-skill>/
```

---

## Quickstart

### 1. Install

**Global** — available in all projects on this machine:

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -g -a cursor -y
```

**This repository only** — install into the current project (share with the team via git):

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -a cursor -y
```

`-a cursor` installs for Cursor; `-y` skips the interactive agent picker.  
Other agents: add more `-a` flags, e.g. `-a cursor -a claude-code -a codex`.  
List skills: `npx skills add shenwell/ai-agent-skills --list`

**Recommended pair** for long autonomous runs:

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -g -a cursor -y
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```


### 2. First run (in any project)

Open the project in Cursor (or your agent) and run:

```
/goal Fix all ESLint errors in src; tests and build must pass
```

On the **first** `/goal` in a project the agent bootstraps automatically: copies `goal.config.yml`, hooks, `/goal` command, templates into `.cursor/`. You do **not** need a separate bootstrap command for normal use.

| Host | What you get |
|------|----------------|
| **Cursor** | Full stack after first `/goal`: command, agents, hooks, config |
| **Claude Code** | Skill protocols + durable `GOAL.md`; optional native `/goal` |
| **Codex / Windsurf / others** | Skill + scripts; Cursor hooks are Cursor-only |

<details>
<summary>Optional — manual bootstrap</summary>

If you want hooks/config **before** the first `/goal`, or the agent could not find the skill path:

```bash
# pick the path that exists after install
node ~/.cursor/skills/goal-mode/scripts/goal-bootstrap.js
node ~/.agents/skills/goal-mode/scripts/goal-bootstrap.js
# Windows PowerShell:
node $env:USERPROFILE\.cursor\skills\goal-mode\scripts\goal-bootstrap.js
```

</details>

---

## Who this is for

- Engineers who want an agent to **keep going until green** (lint, tests, CI), not stop after one attempt
- Teams using **Cursor Cloud Agent** or long unattended runs
- Anyone looking for an open **Claude Code `/goal` alternative** with a durable contract + verifier

---

## Available skills

### `goal-mode` — Claude Code `/goal` alternative

Keep the agent working until a **verifiable** finish line — tests green, lint clean, build passing, migration done — with a durable contract, verifier, and auto-resume.

Package: [`skills/goal-mode/`](skills/goal-mode/) · skill README: [`skills/goal-mode/README.md`](skills/goal-mode/README.md)

```
  YOU                          GOAL MODE                         DONE
   │                               │                               │
   │  /goal Fix lint errors        │                               │
   ├──────────────────────────────►│  intake → plan → execute      │
   │                               │  worker ⇄ verifier            │
   │                               ├──────────────────────────────►│
   │                               │         COMPLETE + report     │
```

| Idea | Claude Code `/goal` | `goal-mode` |
|------|---------------------|-------------|
| Keep going | Stop-hook evaluator | Session loop + hooks + automation |
| Finish line | Condition string | `GOAL.md` criteria + verify commands |
| State | Session | Git-tracked `goals/{id}/` |
| Done check | Small fast model | `goal-verifier` + scripts |
| Long runs | Session / headless | Cloud Agent + `max_hours` |

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CONTRACT   goals/{id}/GOAL.md + goal.config.yml                        │
│  AGENTS     intake → planner → phase-planner → worker → verifier        │
│  HOOKS      sessionStart + stop (auto-continue)                         │
│  SCRIPTS    init · status · verify · time · bootstrap                   │
└─────────────────────────────────────────────────────────────────────────┘
```

Configure after first `/goal` or manual bootstrap (`.cursor/goal.config.yml`):

```yaml
verify:
  test: { command: "npm test", required: true }
  lint: { command: "npm run lint", required: true }
budget:
  max_iterations: 50
  max_hours: 8
memory:
  skill: memo-session-skill
  checkpoints:
    enabled: true
    on_phase_complete: full
    on_complete: full
```

---

### `memo-session-skill` — session knowledge → memory

Analyze the work session and route durable knowledge into `MEMORY.md`, `memory/` (HOT/WARM), project wiki, `AGENTS.md`, skills, and optional portfolio memory — with conflict gate and temperature limits.

Package: [`skills/memo-session-skill/`](skills/memo-session-skill/) · skill README: [`skills/memo-session-skill/README.md`](skills/memo-session-skill/README.md)

```
  SESSION                    MEMO SESSION                      NEXT TURN
     │                            │                                │
     │  подведи итоги             │  preflight → classify → route  │
     ├───────────────────────────►│  HOT / WARM / wiki / portfolio │
     │                            ├───────────────────────────────►│
     │                            │         handoff + changelog    │
```

| Trigger | What gets saved |
|---------|-----------------|
| «подведём итоги», «сохрани знания», handoff | Full pipeline |
| goal-mode phase complete / BLOCKED / COMPLETE | `full` checkpoint (auto) |
| Session step limit in goal-mode | `light` hot-cache update |

Install:

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```

Integration with goal-mode: [memo-session goal-mode-integration](skills/memo-session-skill/references/goal-mode-integration.md)

---

## Add another skill

```
skills/my-skill/SKILL.md   # name + description frontmatter (required)
```

1. Create the folder + `SKILL.md`
2. `npx skills add . --list`
3. Document it above
4. Push → `npx skills add shenwell/ai-agent-skills --skill my-skill`

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Layout

```
README.md
LICENSE
CONTRIBUTING.md
.gitignore
.github/ISSUE_TEMPLATE/
skills/
├── goal-mode/
└── memo-session-skill/
```

That is all [skills.sh](https://skills.sh) needs. Everything for `goal-mode` lives under `skills/goal-mode/`.

---

## Social preview (GitHub)

Картинка для **Settings → Social preview** загружена вручную (2026-08-04). В репозитории файла нет — при смене превью обновляй только в настройках GitHub.

## License

MIT — [LICENSE](LICENSE). Not affiliated with Anthropic or Claude Code.
