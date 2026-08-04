# Resume Protocol

**Triggers:** `/goal resume`, Automation, stop hook, Cloud Agent restart.

## Steps

1. Read `goals/{id}/GOAL.md` — `planning_level`, `current_phase`, master plan
2. If `planning_level` < `executing` → complete missing planning (intake/master/phase), no production code
3. Read `goals/{id}/phases/phase-{current_phase}.md`
4. Note last completed step in phase Progress Log
5. If BLOCKED → surface blocker; wait for user
6. If COMPLETE or FAILED → stop
7. Continue from next unchecked step in **phase plan**
8. Do not rebuild plans if already `executing`

## Resume Prompt Template

Use `resume_prompt` from `goal-status.js --json` when available (includes execution mode and session step budget).

```
Read goals/{id}/GOAL.md and phases/phase-{N}.md.
Planning level: {planning_level}. Current phase: {N}.
Last action: {from Progress Log}.
Continue next unchecked phase step. Do NOT redo completed steps.
If status is PLANNED → start execution (ACTIVE) immediately.
If execution_mode is run_until_complete → loop worker→verifier up to max_steps_per_session.
Follow goal-mode skill exactly.
```

## Automation Integration

1. `node .cursor/skills/goal-mode/scripts/goal-status.js goals/{id} --json`
2. If `should_continue: true` → Cloud Agent with resume prompt
3. If `planning_level` is intake/master/phase → resume planning, not execution
4. If BLOCKED → notify human

## Duplicate Work Prevention

- Completed phase steps stay `[x]`
- Completed master phases stay `complete`
- Log duplicate attempts in Progress Log
