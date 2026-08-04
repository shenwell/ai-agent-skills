# Cloud Agent Setup

For **6+ hour** runs without keeping your laptop open.

## Prerequisites

- Cursor Cloud Agents enabled
- Repo pushed to remote
- `.cursor/` and `goals/` committed to branch

## Launch Checklist

| Setting | Value |
|---------|-------|
| Environment | Match project (Node 20, Python 3.12, etc.) |
| Branch | `goal/{goal-id}` — isolated from main |
| Long-running | **ON** (critical — else ~30 min timeout) |
| Auto-run | **ON** |
| Max duration | 8 hours (or more; automation extends beyond that) |
| Skill | `goal-mode` |
| Checkpoints | Enabled |

## Initial Prompt

```
Read goals/{goal-id}/GOAL.md and .cursor/goal.config.yml.
Set active_goal in config to goals/{goal-id}.
Run: node .cursor/skills/goal-mode/scripts/goal-status.js goals/{goal-id} --json

If session_should_loop is true (run_until_complete mode):
  Run up to max_steps_per_session iterations (goal-worker → goal-verifier → GOAL.md) in THIS session.
  Do NOT stop after one step while status is ACTIVE or CONTINUE.

Otherwise: one iteration, self-evaluate, update GOAL.md.
Follow goal-mode skill exactly.
Use goal-worker subagent for implementation, goal-verifier before COMPLETE.
```

## Branch Workflow

```bash
git checkout -b goal/fix-eslint-frontend
git add goals/fix-eslint-frontend/ .cursor/
git commit -m "goal: start fix-eslint-frontend"
git push -u origin goal/fix-eslint-frontend
```

## Monitoring

Watch Cloud Agent dashboard for:

- `iteration` climbing in agent output
- Token usage vs budget hint
- BLOCKED status — intervene quickly
- Checkpoint creation every ~10 min

## After COMPLETE

1. `goal-verifier` confirms all criteria
2. Open PR from `goal/{id}` → main
3. Set goal status COMPLETE in GOAL.md
4. Disable automation trigger for this goal

## Iteration Size

Structure plan steps to complete in **< 30 minutes** each — reduces loss on VM timeout mid-iteration.
