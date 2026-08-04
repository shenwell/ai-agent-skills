# AI Agent Skills

<p align="center">
  <img src="assets/banner.png" alt="AI Agent Skills — public Agent Skills collection for Cursor, Claude Code, and Codex" width="1024" />
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)
[![skills.sh](https://skills.sh/b/shenwell/ai-agent-skills)](https://skills.sh/shenwell/ai-agent-skills)

**Public [Agent Skills](https://agentskills.io/) for Cursor, Claude Code, Codex, Windsurf, and more.**  
First skill: **`goal-mode`** — keep coding agents working until tests, lint, typecheck, or CI are green (open alternative to [Claude Code `/goal`](https://code.claude.com/docs/en/goal)).

Stops the common failure mode: the agent tries once, claims “done,” and leaves a red build.

```
shenwell/ai-agent-skills
└── skills/
    ├── goal-mode/          ← keep going until tests/lint/build are green
    └── <next-skill>/
```

---

## Quickstart — install with npx skills

```bash
npx skills add shenwell/ai-agent-skills --list
npx skills add shenwell/ai-agent-skills --skill goal-mode -g
# or all skills in this repo:
npx skills add shenwell/ai-agent-skills --all -g
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
4. Push → `npx skills add shenwell/ai-agent-skills --skill my-skill`

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Layout

```
README.md
LICENSE
CONTRIBUTING.md
.gitignore
assets/banner.png
skills/
└── goal-mode/
```

That is all [skills.sh](https://skills.sh) needs. Everything for `goal-mode` lives under `skills/goal-mode/`.

---

## Social preview (GitHub)

Recommended share image: [`assets/social-preview.png`](assets/social-preview.png) (1280×640).

Set once in the repo: **Settings → General → Social preview → Upload image** (GitHub has no stable simple CLI for this). Until set, shares use the default Open Graph card.

## License

MIT — [LICENSE](LICENSE). Not affiliated with Anthropic or Claude Code.
