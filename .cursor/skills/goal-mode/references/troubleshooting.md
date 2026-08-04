# Troubleshooting

## Premature Stop After CONTINUE

**Symptoms:** One iteration done, status CONTINUE, agent ends turn.

**Causes:**
1. `execution.mode = single_iteration` (or legacy hook message)
2. Parent follows hook "Execute one iteration" literally
3. `loop_limit` exhausted in hooks.json

**Fix:**
1. Set `execution.mode: run_until_complete` in goal.config.yml
2. Update goal-stop-continue.js message (respects execution mode)
3. Raise hooks.json `loop_limit` to match `budget.max_iterations`
4. Re-run: `/goal resume <id>`

## False COMPLETE

**Symptoms:** GOAL.md says COMPLETE; verify commands fail manually.

**Fix:**
1. Strengthen verification-rules — re-run every criterion every iteration
2. Always delegate to goal-verifier before COMPLETE
3. Add to skill: never claim COMPLETE without `goal-verify.js` exit 0

## Objective Drift

**Symptoms:** Unrelated files modified.

**Fix:** Enforce drift-prevention.md; set `drift.allowed_paths` in config.

## Cloud Agent Timeout Mid-Iteration

**Symptoms:** No Progress Log entry; stale checkpoint.

**Fix:** Smaller plan steps; automation re-trigger; resume-protocol.

## Token Budget Exhausted

**Fix:**
- `.cursorignore` aggressive
- grep instead of full file reads
- Split goal into sub-goals under `goals/`

## Automation Duplicate Work

**Symptoms:** Agent redoes completed steps.

**Fix:** Use exact resume_prompt from goal-status.js; verify plan checkboxes updated.

## Same Blocker 3+ Iterations

**Fix:** Set status BLOCKED; present A/B/C options to user.

## Agent Ignores GOAL.md

**Fix:** sessionStart hook injects goal; set `active_goal` in config; commit GOAL.md to branch.

## Windows Paths

Use forward slashes in GOAL.md paths: `goals/my-goal/GOAL.md`. Scripts work on Windows with Node.
