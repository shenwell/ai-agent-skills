# Architecture — Goal Mode Pipeline

How the layers fit together.

```
┌─────────────────────────────────────────────────────────────────┐
│                        HUMAN / AUTOMATION                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │ /goal <objective>
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ COMMAND + SKILL                                                 │
│  bootstrap → intake → master → phases → execute loop            │
└───────┬───────────────┬───────────────┬───────────────┬─────────┘
        │               │               │               │
        ▼               ▼               ▼               ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────────┐
   │ GOAL.md │    │ agents  │    │ scripts │    │ hooks/cloud │
   │ contract│◄───│ planner │───►│ status  │───►│ continue    │
   │ evidence│    │ worker  │    │ verify  │    │ time track  │
   └─────────┘    │ verifier│    │ time    │    └─────────────┘
                  └─────────┘    └─────────┘
```

## Sequence (logical)

```
User
  │
  ├─ goal-init.js ──────────────────────► GOAL.md (DRAFT)
  │
  ├─ goal-intake ───────────────────────► criteria
  ├─ goal-planner ──────────────────────► Master Plan
  ├─ goal-phase-planner × N ────────────► phases/phase-N.md
  │
  └─ loop
       ├─ goal-worker (one step)
       ├─ goal-verifier
       ├─ update GOAL.md
       └─ stop hook? ──► followup if CONTINUE
```

## Layer responsibilities

| Layer | Owns | Does NOT own |
|-------|------|--------------|
| GOAL.md | Criteria, evidence, state, audit | Code execution |
| goal.config.yml | Verify commands, budget, active goal | Business logic |
| Skill | Iteration protocol, stopping rules | Hard OS kill-switch |
| Agents | Specialized roles | Cross-goal global state |
| Scripts | Deterministic status / verify / time | LLM judgment |
| Hooks | Session context, auto-continue | Cloud VM lifecycle |
| Cloud + Automation | Hours-long / beyond VM limits | Completion semantics alone |

## Why all layers

- **Skill only** → no durable state, weak resume
- **GOAL.md only** → agent can ignore the file
- **+ Scripts** → CI / automation can read JSON status
- **+ Hooks** → continue without “please keep going”
- **+ Agents** → fewer false COMPLETE claims
- **+ Cloud + Automation** → past a single session / VM cap
