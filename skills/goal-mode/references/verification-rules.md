# Verification Rules

## Mandatory Before SATISFIED

1. Run the **exact** command from GOAL.md Evidence table or `.cursor/goal.config.yml` verify section
2. Capture **full** output (or last 50 lines if huge) in Progress Log
3. Exit code 0 required unless criterion explicitly allows warnings
4. If command fails → criterion is **NOT_SATISFIED**

## Script Shortcut

```bash
node .cursor/skills/goal-mode/scripts/goal-verify.js goals/{goal-id}
```

Parses config, runs all `required: true` verify commands, outputs JSON for evidence.

## Re-Verification Every Iteration

Even if criterion was SATISFIED in iteration 5, re-run in iteration 6 before claiming COMPLETE.

Exception: criterion marked SATISFIED with HIGH evidence and **no files changed** since last verify — still re-run at final COMPLETE iteration.

## Linking Criteria to Config

When scaffolding goal, map each criterion to a verify key:

| Criterion | Config key |
|-----------|------------|
| All tests pass | `verify.test` |
| Lint clean | `verify.lint` |
| Build succeeds | `verify.build` |
| No TS errors | `verify.typecheck` |

Custom criteria need explicit command in GOAL.md Evidence table.
