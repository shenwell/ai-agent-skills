---
name: goal-mode
description: >-
  Autonomous Goal Mode for AI coding agents — the open equivalent of Claude Code
  /goal. Turns a plain-language objective into a durable contract (GOAL.md),
  hierarchical plan, evidence-based work loop, independent verifier, time budget,
  and auto-resume until COMPLETE, BLOCKED, or FAILED. Use when the user says
  /goal, "goal mode", "run until done", "autonomous agent", "keep going until
  tests pass", Claude Code /goal alternative, long-running refactor/migration/
  lint fix, Cloud Agent unattended work, or asks to plan then execute with
  verifiable stop conditions.
disable-model-invocation: true
metadata:
  version: "1.0.0"
  author: productlaba
  category: autonomous-execution
  tags: goal, autonomous, claude-code, cursor, verifier, planning
---

# Goal Mode

**Open Goal Mode for any AI coding agent** — inspired by [Claude Code `/goal`](https://code.claude.com/docs/en/goal).

Autonomy needs a **contract**, not only a prompt. This skill gives the agent:

1. A durable `goals/{id}/GOAL.md` contract (criteria + evidence + budget)
2. Hierarchical planning (master → per-phase expanded plans)
3. A worker/verifier loop that refuses “done” without evidence
4. Session auto-continue + wall-clock time tracking (6h+)
5. Project bootstrap so it works after `npx skills add`

```
  YOU                          GOAL MODE                         DONE
   │                               │                               │
   │  /goal Fix all ESLint errors  │                               │
   ├──────────────────────────────►│                               │
   │                               │  intake → plan → execute      │
   │                               │  worker ⇄ verifier            │
   │                               │  hooks / resume / time budget │
   │                               ├──────────────────────────────►│
   │                               │         COMPLETE + report     │
```

**Canonical docs:** [references/](references/) · [INSTALL.md](../../docs/INSTALL.md) · [VS Claude Code](../../docs/VS-CLAUDE-CODE.md)

## When to use

| Use Goal Mode | Do not use Goal Mode |
|---------------|----------------------|
| Lint/test/typecheck zero-out | Vague “make it better” with no metric |
| Migrations with verify commands | Open-ended architecture debates |
| Multi-hour Cloud Agent runs | One-shot Q&A |
| “Keep going until green” | Tasks needing constant human design |

## Routing

| Trigger | Action |
|---------|--------|
| `/goal <text>` or “run goal mode on …” | Bootstrap → intake → master → phases → execute |
| `/goal run` | Execution only ([hierarchical-plan-protocol](references/hierarchical-plan-protocol.md) L4) |
| `/goal resume` | [resume-protocol](references/resume-protocol.md) |
| `/goal plan` | Re-run Levels 2–3 |
| Stop hook / automation | Resume while `ACTIVE` / `CONTINUE` |

## Step 0 — Bootstrap (required on first use in a project)

Resolve the skill root (global or project), then:

```bash
# After: npx skills add <owner>/goals-productlaba --skill goal-mode -g
node "$HOME/.agents/skills/goal-mode/scripts/goal-bootstrap.js" --json
# Cursor global path (common):
node "$HOME/.cursor/skills/goal-mode/scripts/goal-bootstrap.js" --json
# Windows PowerShell:
node "$env:USERPROFILE\.cursor\skills\goal-mode\scripts\goal-bootstrap.js" --json
# Already in project:
node .cursor/skills/goal-mode/scripts/goal-bootstrap.js --json
```

Creates/syncs: `.cursor/goal.config.yml`, hooks, agents, `/goal` command, `templates/`, `goals/`, project-local skill copy.

## Full pipeline (`/goal <text>`)

```
┌────────────┐   ┌────────────┐   ┌────────────┐   ┌──────────────────────────┐
│  0 BOOT    │──►│  1 INTAKE  │──►│  2 MASTER  │──►│  3 PHASE × N             │
│  scaffold  │   │  criteria  │   │  plan table│   │  expanded phase plans    │
└────────────┘   └────────────┘   └────────────┘   └────────────┬─────────────┘
                                                                │
                                                                ▼
                                                 ┌──────────────────────────────┐
                                                 │  4 EXECUTE                   │
                                                 │  worker → verifier → GOAL.md │
                                                 │  until COMPLETE|BLOCKED|FAIL │
                                                 └──────────────────────────────┘
```

### Scaffold

```bash
node .cursor/skills/goal-mode/scripts/goal-init.js "Your objective text"
```

### Agents (delegate — do not role-play)

| Stage | subagent_type |
|-------|---------------|
| Intake | `goal-intake` |
| Master plan | `goal-planner` |
| Phase plan | `goal-phase-planner` |
| Work step | `goal-worker` |
| Verify | `goal-verifier` |

If the host has no subagents: parent follows the same protocols in [references/](references/) sequentially.

## One iteration (Level 4)

`goal-worker` does **one** unchecked step from `phases/phase-{N}.md`.

1. Read `GOAL.md` + active phase file + `goal.config.yml`
2. Pre-check iteration + time budget (`goal-status.js --json`)
3. [drift-prevention](references/drift-prevention.md) before edits
4. Implement one step
5. [verification-rules](references/verification-rules.md)
6. [self-evaluation](references/self-evaluation.md)
7. Update phase checkboxes + Progress Log
8. Phase complete → advance `current_phase`
9. All phases done → `goal-verifier` → `COMPLETE` only with HIGH evidence

## Session loop (`run_until_complete`)

Parent = orchestrator. Worker = single-step executor.

```
steps_done = 0
WHILE status ∈ {ACTIVE, CONTINUE}
  AND iteration < max_iterations
  AND NOT over_time_budget
  AND steps_done < max_steps_per_session:
    worker → verifier → update GOAL.md
    steps_done++
    break on COMPLETE | BLOCKED | FAILED | PAUSED
END
# session step limit + CONTINUE → stop hook auto-continues
```

**Forbidden:** ending the turn after one step while `CONTINUE` and session budget remains.

## Time tracking (6h+)

- Hooks record wall-clock sessions in `goals/{id}/time-log.json`
- Parent logs activities: `goal-time.js log … --activity worker|verifier|…`
- On terminal status: `goal-time.js report` → `SESSION_TIME_REPORT.md`
- Details: [time-tracking](references/time-tracking.md)

## Stopping rules

| Status | Meaning |
|--------|---------|
| `COMPLETE` | All criteria HIGH + all master phases complete |
| `BLOCKED` | Exact blocker + A/B/C options for the human |
| `CONTINUE` | More work; keep looping / hook resume |
| `FAILED` | Iteration **or** hour budget exhausted |
| `PAUSED` | Human stop |

## Frontmatter (GOAL.md)

```yaml
status: DRAFT | INTAKE | PLANNING | PLANNED | ACTIVE | CONTINUE | BLOCKED | COMPLETE | FAILED
planning_level: none | intake | master | phase | executing
current_phase: 0
phases_total: N
iteration: 0
max_iterations: 50
active_step: "phase-2 step 3a"
```

## Host differences

| Host | What you get |
|------|----------------|
| **Cursor** | Full stack: skill + agents + `/goal` + hooks + Cloud Agent |
| **Claude Code** | Skill protocols + GOAL.md contract; map loop to Stop hooks / native `/goal` if available |
| **Codex / Copilot / Windsurf / others** | Skill instructions + scripts; bootstrap what the host supports |

See [docs/INSTALL.md](../../docs/INSTALL.md).

## Troubleshooting

[references/troubleshooting.md](references/troubleshooting.md)
