# shenwell/skills

<p align="center">
  <img src="assets/banner.svg" alt="SKILLS — green to blue" width="840" />
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)
[![skills.sh](https://skills.sh/b/shenwell/skills)](https://skills.sh/shenwell/skills)

```
shenwell/skills
└── skills/
    ├── goal-mode/          ← Claude Code /goal equivalent (open)
    └── <next-skill>/
```

---

## Install

```bash
npx skills add shenwell/skills --list
npx skills add shenwell/skills --skill goal-mode -g
# or all skills in this repo:
npx skills add shenwell/skills --all -g
```

### After install — bootstrap the project (goal-mode)

```bash
# use whichever path exists on your machine
node ~/.cursor/skills/goal-mode/scripts/goal-bootstrap.js
node ~/.agents/skills/goal-mode/scripts/goal-bootstrap.js
node ~/.claude/skills/goal-mode/scripts/goal-bootstrap.js
node ~/.codex/skills/goal-mode/scripts/goal-bootstrap.js
# Windows:
node $env:USERPROFILE\.cursor\skills\goal-mode\scripts\goal-bootstrap.js
```

Then:

```
/goal Fix all ESLint errors in src; tests and build must pass
```

| Host | Notes |
|------|--------|
| **Cursor** | Full stack after bootstrap: `/goal`, agents, hooks |
| **Claude Code** | Use skill protocols + durable `GOAL.md`; optional native `/goal` for the stop condition |
| **Codex / Windsurf / Copilot / others** | Skill + scripts; hooks are Cursor-specific |

---

## Available skills

### `goal-mode`

Open Goal Mode — durable-contract equivalent of [Claude Code `/goal`](https://code.claude.com/docs/en/goal).

Package: [`skills/goal-mode/`](skills/goal-mode/)

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

Configure after bootstrap (`.cursor/goal.config.yml`):

```yaml
verify:
  test: { command: "npm test", required: true }
  lint: { command: "npm run lint", required: true }
budget:
  max_iterations: 50
  max_hours: 8
```

---

## Add another skill

```
skills/my-skill/SKILL.md   # name + description frontmatter (required)
```

1. Create the folder + `SKILL.md`
2. `npx skills add . --list`
3. Document it above
4. Push → `npx skills add shenwell/skills --skill my-skill`

---

## Layout

```
README.md
LICENSE
.gitignore
skills/
└── goal-mode/
```

That is all skills.sh needs. Everything for `goal-mode` lives under `skills/goal-mode/`.

---

## Security

Skills may include **scripts** that run shell commands. Review before installing.

## License

MIT — [LICENSE](LICENSE). Not affiliated with Anthropic or Claude Code.
