---
goal_id: example-eslint
title: "Fix all ESLint errors in src/components"
status: PLANNED
iteration: 0
max_iterations: 50
started_at: null
last_evaluation: null
blocker: null
active_step: null
---

# GOAL: Fix all ESLint errors in src/components

## Objective

Eliminate all ESLint errors and warnings in `src/components/**` without changing component behavior. Full test suite must remain green.

## Completion Criteria (ALL must be satisfied)

- [ ] C1: ESLint reports 0 errors in `src/components` (`npm run lint -- src/components`)
- [ ] C2: All tests pass (`npm test`)
- [ ] C3: Production build succeeds (`npm run build`)

## Evidence Required

| Criterion | Verification command | Evidence location |
|-----------|---------------------|-------------------|
| C1 | `npm run lint -- src/components` | Progress log |
| C2 | `npm test` | Progress log |
| C3 | `npm run build` | Progress log |

## Budget Limits

- Max iterations: 50
- Max hours: 6

## Plan

- [ ] Step 1: Run lint on src/components, save full error list to progress log
- [ ] Step 2: Fix import/order and unused-vars errors (batch by rule)
- [ ] Step 3: Fix react-hooks and accessibility rules
- [ ] Step 4: Fix remaining rule violations file by file
- [ ] Step 5: Full verify — lint, test, build

## Progress Log

### Iteration 0 — example

- **Action**: Example goal for documentation
- **Status**: PLANNED
- **Next steps**: Copy pattern for your project; run `/goal run example-eslint` after adapting paths
