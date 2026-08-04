# Time Tracking

Goal Mode tracks **wall-clock session time** and (optionally) **per-activity breakdown**.

## What is tracked automatically

| Event | Mechanism | File |
|-------|-----------|------|
| Cursor session start | `sessionStart` hook → `goal-time.js session-start` | `goals/{id}/time-log.json` |
| Session end / stop hook | `stop` hook → `goal-time.js session-end` | `time-log.json` |
| Hour budget | `goal-status.js` reads `time-log.json` | JSON status |
| Final report | `goal-time.js report` on terminal status | `SESSION_TIME_REPORT.md` |

## Activity breakdown

Parent agent **after each step** calls:

```bash
node .cursor/skills/goal-mode/scripts/goal-time.js log goals/{id} \
  --activity worker --detail "phase-0 step 3: fix lint in Button.tsx"
```

Activity types: `intake`, `master_plan`, `phase_plan`, `worker`, `verifier`, `verify_commands`, `memory_checkpoint`, `orchestration`, `other`.

### When to log

| Stage | activity |
|-------|----------|
| goal-intake | `intake` |
| goal-planner | `master_plan` |
| goal-phase-planner | `phase_plan` |
| goal-worker | `worker` |
| goal-verifier | `verifier` |
| `goal-verify.js` | `verify_commands` |
| memo-session-skill | `memory_checkpoint` |

## Commands

```bash
# Time budget status
node .cursor/skills/goal-mode/scripts/goal-time.js status goals/my-goal --json

# Generate / refresh report
node .cursor/skills/goal-mode/scripts/goal-time.js report goals/my-goal

# Full report as JSON
node .cursor/skills/goal-mode/scripts/goal-time.js report goals/my-goal --format json
```

## Post-session report

`goals/{id}/SESSION_TIME_REPORT.md` contains:

- total wall-clock time and remaining budget
- breakdown by activity type (%)
- session list (start → duration → reason)
- last 30 logged steps

**Parent agent must** at the end of a terminal session (`COMPLETE`, `BLOCKED`, `FAILED`, or hour budget exhausted):

1. Call `goal-time.js report`
2. Show the user a short summary from the report (elapsed, top activities, file path)

## 6+ hour budget

In `goal.config.yml`:

```yaml
budget:
  max_hours: 8   # or 12, 24 — any value

hooks:
  max_continue_loops: 72   # ≥ max_iterations and ~4× max_hours

cloud_agent:
  max_duration_hours: 8    # single VM limit; automation continues beyond that
```

Rules:

- `should_continue` = false when `elapsed >= max_hours` (even if iteration < max_iterations)
- stop hook keeps auto-continue while both iteration and time budget remain
- Cloud Agent: one VM ≤ `max_duration_hours`; for 12h+ enable [automation-setup.md](automation-setup.md) (hourly re-trigger)

## time-log.json format

```json
{
  "goal_id": "my-goal",
  "started_at": "2026-08-04T10:00:00.000Z",
  "total_wall_ms": 7200000,
  "sessions": [{ "session_id": "s-...", "started_at": "...", "duration_ms": 3600000, "end_reason": "continue" }],
  "activities": [{ "activity": "worker", "detail": "phase-0 step 1", "duration_ms": 0 }],
  "by_activity_ms": { "worker": 5400000, "verifier": 900000 }
}
```
