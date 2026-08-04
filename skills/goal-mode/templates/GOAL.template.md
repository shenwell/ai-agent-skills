---
goal_id: {{GOAL_ID}}
title: "{{TITLE}}"
status: DRAFT
planning_level: none
iteration: 0
max_iterations: 50
current_phase: null
phases_total: 0
started_at: null
last_evaluation: null
blocker: null
active_step: null
execution_mode: null   # null = from goal.config.yml
last_memory_checkpoint: 0
max_hours: null        # null = from goal.config.yml budget.max_hours
---

# GOAL: {{TITLE}}

## Objective

{{OBJECTIVE}}

## Completion Criteria (ALL must be satisfied)

_Agent fills from intake — one criterion per master-plan phase or verifiable outcome._

- [ ] C1: _pending intake_

## Evidence Required

| Criterion | Verification command | Evidence location |
|-----------|---------------------|-------------------|
| C1 | _from goal.config.yml_ | Progress log |

## Budget Limits

- Max iterations: 50
- Max hours: _from goal.config.yml (default 8)_

_Time log: `time-log.json` · Report: `SESSION_TIME_REPORT.md`_

## Master Plan

_Agent fills at planning_level: master. One row per phase._

| Phase | Name | Status | Plan file | Exit criterion |
|-------|------|--------|-----------|----------------|
| — | _pending master plan_ | pending | — | — |

## Current Execution Context

- **Planning level**: none | master | phase | executing
- **Current phase**: —
- **Active plan file**: —
- **Active step**: —

## Progress Log

### Iteration 0 — created

- **Action**: Goal scaffolded from template
- **Status**: DRAFT
- **Next steps**: Auto-intake → master plan → phase plans → run
