# Automation Setup

Продлевает работу **за пределы лимита одной VM-сессии** Cloud Agent (8h+).

## Time budget across sessions

Wall-clock время суммируется в `goals/{id}/time-log.json`. После каждой VM-сессии stop hook пишет сессию; automation перезапускает агента, пока `should_continue: true` и `over_time_budget: false`.

Проверка:

```bash
node .cursor/skills/goal-mode/scripts/goal-time.js status goals/{goal-id} --json
```

Финальный отчёт: [time-tracking.md](time-tracking.md) → `SESSION_TIME_REPORT.md`.

## Status Check Script

```bash
node .cursor/skills/goal-mode/scripts/goal-status.js goals/{goal-id} --json
```

Output:

```json
{
  "goal_id": "fix-eslint",
  "status": "CONTINUE",
  "iteration": 23,
  "max_iterations": 50,
  "should_continue": true,
  "session_should_loop": true,
  "execution_mode": "run_until_complete",
  "max_steps_per_session": 10,
  "steps_remaining_in_phase": 4,
  "blocker": null,
  "resume_prompt": "Read goals/fix-eslint/GOAL.md..."
}
```

`should_continue: true` when status is ACTIVE, CONTINUE, planning states (DRAFT/INTAKE/PLANNING), or PLANNED with `planning_level: phase` (ready to execute).

When `execution_mode` is `run_until_complete`, use `session_should_loop` and `resume_prompt` in Cloud Agent / Automation prompts — parent should run multiple worker→verifier cycles per session (up to `max_steps_per_session`), not a single step.

## Cursor Automation (hourly)

**Trigger:** Schedule — every hour  
**Condition:** Run script; continue if `should_continue`

**Action:** Cloud Agent on branch `goal/{id}`

**Prompt:**

```
{{resume_prompt from goal-status.js}}
Follow goal-mode skill. Skill: goal-mode.
```

Use Cursor Automations editor — see automate skill for setup.

## GitHub Action Alternative

`.github/workflows/goal-resume.yml`:

```yaml
name: Goal Resume Check
on:
  schedule:
    - cron: '0 * * * *'
  workflow_dispatch:
    inputs:
      goal_id:
        description: Goal folder name
        required: true

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - id: status
        run: |
          OUT=$(node .cursor/skills/goal-mode/scripts/goal-status.js goals/${{ inputs.goal_id }} --json)
          echo "$OUT"
          echo "should_continue=$(echo $OUT | jq -r .should_continue)" >> $GITHUB_OUTPUT
      - name: Notify
        if: steps.status.outputs.should_continue == 'true'
        run: |
          echo "Goal still active — trigger Cloud Agent manually or via Cursor API"
          # Optional: curl Cursor API / comment on issue
```

## GitHub Issue as Audit Surface

Optional: create issue per goal, post iteration summaries as comments. Links human visibility to GOAL.md state.

## Stop Conditions

Do **not** re-trigger when:

- `status: COMPLETE`
- `status: FAILED`
- `status: BLOCKED` (notify human instead)
- `iteration >= max_iterations`
