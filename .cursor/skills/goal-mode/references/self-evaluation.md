# Self-Evaluation Protocol

After **every** iteration, evaluate **every** completion criterion individually.

## Per-Criterion Template

```
Criterion: C{n} — {description}
Status: SATISFIED | NOT_SATISFIED | UNKNOWN
Evidence: {exact command run + output excerpt OR file:line reference}
Confidence: HIGH | MEDIUM | LOW
```

## Confidence Rules

| Confidence | When |
|------------|------|
| HIGH | Fresh full command output, 0 failures, reproduced this iteration |
| MEDIUM | Partial check, indirect evidence, or flaky test |
| LOW | Inference without running verify command — **treat as NOT_SATISFIED** |

## Overall State Decision

| State | Condition |
|-------|-----------|
| COMPLETE | ALL criteria SATISFIED, ALL confidence HIGH |
| BLOCKED | Cannot proceed without human decision; document exact blocker |
| CONTINUE | At least one NOT_SATISFIED, progress made, budget remaining |
| FAILED | Budget exceeded OR same blocker 3+ iterations OR unrecoverable error |

## Verifier Subagent

Before agent claims COMPLETE, delegate to **goal-verifier**:

- Runs `node .cursor/skills/goal-mode/scripts/goal-verify.js goals/{id}`
- Independently marks each criterion
- If verifier disagrees with worker → state stays CONTINUE, not COMPLETE

## Anti-Patterns (reject these)

- "Tests should pass now" without output
- "I fixed all lint issues" without running lint
- Checking only subset of criteria
- Reusing evidence from iteration N-1 without re-run
