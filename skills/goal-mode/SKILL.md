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

<p align="center">
  <img src="https://raw.githubusercontent.com/shenwell/skills/main/skills/goal-mode/assets/banner.png" alt="GOAL MODE" width="840" />
</p>

```
╔══════════════════════════════════════════╗
║              G O A L  M O D E            ║
║   contract → plan → work ⇄ verify → done ║
╚══════════════════════════════════════════╝
```

Inspired by [Claude Code `/goal`](https://code.claude.com/docs/en/goal).  
Autonomy needs a **contract**, not only a prompt.

```
  WITHOUT GOAL MODE                      WITH GOAL MODE
  ─────────────────                      ──────────────
  "fix the lint"                        /goal Fix lint; tests must pass
         │                                        │
         ▼                                        ▼
  agent tries a bit                      ╔═══════════════════════╗
  claims "done"                          ║  GOAL.md   CONTRACT   ║
  you re-prompt                          ║  criteria · evidence  ║
  context gone                           ║  budget · plan        ║
                                         ╚══════════╤════════════╝
                                                    │
                                         worker ⇄ verifier loop
                                         hooks resume on stop
                                         time report at the end
                                                    │
                                                    ▼
                                              ★ COMPLETE ★
```

This skill gives the agent:

1. Durable `goals/{id}/GOAL.md` (criteria + evidence + budget)
2. Hierarchical planning (master → per-phase plans)
3. Worker/verifier loop that refuses “done” without evidence
4. Auto-continue + wall-clock time tracking (6h+)
5. Project bootstrap after `npx skills add`

**Canonical docs:** [references/](references/) · [README](README.md) · collection [README](../../README.md)

---

## When to use

```
  ┌─────────────────────────────┐     ┌─────────────────────────────┐
  │  USE GOAL MODE              │     │  DO NOT USE                 │
  ├─────────────────────────────┤     ├─────────────────────────────┤
  │  lint / test / typecheck →0 │     │  “make it better” no metric │
  │  migrations + verify cmds    │     │  open-ended architecture    │
  │  multi-hour Cloud Agent     │     │  one-shot Q&A               │
  │  “keep going until green”   │     │  needs constant human design│
  └─────────────────────────────┘     └─────────────────────────────┘
```

## Routing

| Trigger | Action |
|---------|--------|
| `/goal <text>` or “run goal mode on …” | Bootstrap → intake → master → phases → execute |
| `/goal run` | Execution only ([hierarchical-plan-protocol](references/hierarchical-plan-protocol.md) L4) |
| `/goal resume` | [resume-protocol](references/resume-protocol.md) |
| `/goal plan` | Re-run Levels 2–3 |
| Stop hook / automation | Resume while `ACTIVE` / `CONTINUE` |

---

## Step 0 — Bootstrap (first use in a project)

```
  ┌──────────────┐     ┌──────────────────────────────────────────┐
  │ npx skills   │────►│  goal-bootstrap.js                       │
  │ add … -g     │     │  → goal.config.yml · hooks · agents      │
  └──────────────┘     │  → /goal command · templates · goals/    │
                       └──────────────────────────────────────────┘
```

```bash
node "$HOME/.cursor/skills/goal-mode/scripts/goal-bootstrap.js" --json
node "$HOME/.agents/skills/goal-mode/scripts/goal-bootstrap.js" --json
# Windows:
node "$env:USERPROFILE\.cursor\skills\goal-mode\scripts\goal-bootstrap.js" --json
# Already in project:
node .cursor/skills/goal-mode/scripts/goal-bootstrap.js --json
```

---

## Full pipeline (`/goal <text>`)

```
     ╔════════╗   ╔════════╗   ╔════════╗   ╔════════════╗
     ║ 0 BOOT ║──►║1 INTAKE║──►║2 MASTER║──►║ 3 PHASE×N  ║
     ║scaffold║   ║criteria║   ║ table  ║   ║ expanded   ║
     ╚════════╝   ╚════════╝   ╚════════╝   ╚═════╤══════╝
                                                  │
                                                  ▼
                                           ╔══════════════╗
                                           ║  4 EXECUTE   ║
                                           ║ worker⇄verify║
                                           ║ until done   ║
                                           ╚══════╤═══════╝
                                                  │
                    ┌─────────────┬───────────────┼───────────────┐
                    ▼             ▼               ▼               ▼
               COMPLETE       BLOCKED         FAILED          CONTINUE
                    │             │               │               │
                    └─────────────┴───────────────┘               │
                         SESSION_TIME_REPORT.md                   │
                                                                  │
                                                         stop hook│
                                                         resumes  ┘
```

### Scaffold

```bash
node .cursor/skills/goal-mode/scripts/goal-init.js "Your objective text"
```

### Agents (delegate — do not role-play)

```
  ┌─────────────┐   ┌─────────────┐   ┌──────────────────┐
  │ goal-intake │──►│goal-planner │──►│goal-phase-planner│
  └─────────────┘   └─────────────┘   └────────┬─────────┘
                                               │ ×N
                                               ▼
                                    ┌────────────────────┐
                                    │    goal-worker     │◄── one step
                                    └─────────┬──────────┘
                                              │
                                              ▼
                                    ┌────────────────────┐
                                    │   goal-verifier    │◄── evidence
                                    └────────────────────┘
```

| Stage | subagent_type |
|-------|---------------|
| Intake | `goal-intake` |
| Master plan | `goal-planner` |
| Phase plan | `goal-phase-planner` |
| Work step | `goal-worker` |
| Verify | `goal-verifier` |

If the host has no subagents: parent follows [references/](references/) sequentially.

---

## One iteration (Level 4)

`goal-worker` does **one** unchecked step from `phases/phase-{N}.md`.

```
  GOAL.md + phase-N.md
           │
           ▼
  ┌─────────────────┐
  │ 1 budget check  │
  │ 2 drift guard   │
  │ 3 implement ONE │
  │ 4 verify rules  │
  │ 5 self-eval     │
  │ 6 update logs   │
  └────────┬────────┘
           │
           ├── phase done? → current_phase++
           └── all phases? → verifier → COMPLETE (HIGH only)
```

1. Read `GOAL.md` + active phase file + `goal.config.yml`
2. Pre-check iteration + time budget (`goal-status.js --json`)
3. [drift-prevention](references/drift-prevention.md) before edits
4. Implement one step
5. [verification-rules](references/verification-rules.md)
6. [self-evaluation](references/self-evaluation.md)
7. Update phase checkboxes + Progress Log
8. Phase complete → advance `current_phase`
9. All phases done → `goal-verifier` → `COMPLETE` only with HIGH evidence

---

## Session loop (`run_until_complete`)

Parent = **orchestrator**. Worker = **single-step executor**.

```
  ╔═══════════════════════════════════════════════════════════════╗
  ║  WHILE status ∈ {ACTIVE, CONTINUE}                            ║
  ║    AND iteration < max_iterations                             ║
  ║    AND NOT over_time_budget                                   ║
  ║    AND steps_done < max_steps_per_session:                    ║
  ║                                                               ║
  ║      worker ──► verifier ──► update GOAL.md                   ║
  ║      steps_done++                                             ║
  ║      break on COMPLETE | BLOCKED | FAILED | PAUSED            ║
  ║                                                               ║
  ║  END                                                          ║
  ║  session limit + CONTINUE ──► stop hook auto-continues        ║
  ╚═══════════════════════════════════════════════════════════════╝
```

**Forbidden:** ending the turn after one step while `CONTINUE` and session budget remains.

---

## Time tracking (6h+)

```
  sessionStart                stop / terminal
       │                            │
       ▼                            ▼
  ┌─────────────┐            ┌──────────────────────────┐
  │ time-log    │───────────►│ SESSION_TIME_REPORT.md   │
  │ .json       │  activities│ elapsed · by activity    │
  └─────────────┘            └──────────────────────────┘
```

- Hooks record wall-clock in `goals/{id}/time-log.json`
- Parent logs: `goal-time.js log … --activity worker|verifier|…`
- On terminal: `goal-time.js report` → `SESSION_TIME_REPORT.md`
- Details: [time-tracking](references/time-tracking.md)

---

## Stopping rules

```
  DRAFT → INTAKE → PLANNING → PLANNED → ACTIVE ⇄ CONTINUE
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
                    ★ COMPLETE ★           BLOCKED              FAILED
                         │                    │                    │
                         └────────────────────┴────────────────────┘
                                    time report
```

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

```
  ┌────────────┐  full stack: /goal · agents · hooks · Cloud
  │   Cursor   │
  └────────────┘
  ┌────────────┐  protocols + GOAL.md; optional native /goal
  │Claude Code │
  └────────────┘
  ┌────────────┐  skill + scripts; bootstrap what host supports
  │Codex / etc │
  └────────────┘
```

See collection [README](../../README.md) for multi-IDE install.

## Troubleshooting

[references/troubleshooting.md](references/troubleshooting.md)
