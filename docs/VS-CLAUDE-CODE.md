# Goal Mode vs Claude Code `/goal`

This project is an **open, portable Goal Mode** inspired by [Claude Code `/goal`](https://code.claude.com/docs/en/goal). It is **not** affiliated with Anthropic.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     SAME IDEA, DIFFERENT HOST                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Claude Code                         Goal Mode (this repo)              │
│   ───────────                         ─────────────────────              │
│                                                                          │
│   /goal <condition>                   /goal <objective>                  │
│         │                                      │                         │
│         ▼                                      ▼                         │
│   work one turn                       intake → plan → execute            │
│         │                                      │                         │
│         ▼                                      ▼                         │
│   fast model: done?                   verifier + verify cmds             │
│    yes ──► stop                        HIGH evidence ──► COMPLETE        │
│    no  ──► next turn                   CONTINUE ──► hooks / loop         │
│                                                                          │
│   state: session                      state: goals/{id}/GOAL.md (git)    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Side-by-side

| Dimension | Claude Code `/goal` | Goal Mode (open) |
|-----------|---------------------|------------------|
| Entry | `/goal <condition>` | `/goal <text>` or “use goal-mode” |
| Stop decision | Separate small model vs condition | `goal-verifier` + script evidence + criteria checkboxes |
| State | Session-scoped | Durable files under `goals/` |
| Planning | Implicit in the agent | Explicit master + phase plans |
| Multi-agent | Single primary + evaluator | intake / planner / worker / verifier roles |
| Hosts | Claude Code | Cursor, Claude Code, Codex, Windsurf, … |
| Long run | Session / headless | Cloud Agent + automation + `max_hours` |
| Time audit | Turns / tokens in `/goal` | `SESSION_TIME_REPORT.md` |

## When to use which

**Prefer Claude Code native `/goal`** when:

- You live in Claude Code day-to-day
- The finish line is a short verifiable condition
- You do not need a shared git audit trail

**Prefer this Goal Mode** when:

- The team uses **Cursor** (or mixed IDEs)
- You need a **repo-visible contract** and progress log
- Work spans **hours**, Cloud Agents, or handoffs between people
- You want hierarchical plans and drift guards as first-class artifacts

## Using both together

On Claude Code you can:

1. Maintain `GOAL.md` with this skill (contract + plan + evidence).
2. Drive the session with native `/goal` pointed at a condition that mirrors the contract, for example:

```text
/goal Read goals/my-goal/GOAL.md; status is COMPLETE with all criteria checked and goal-verifier agreeing, or status is BLOCKED/FAILED
```

That gives you Claude’s evaluator loop **plus** a durable project artifact teammates can resume in Cursor.

## Design principle (shared)

```
  ┌─────────────────────┐         ┌─────────────────────┐
  │   WORKER MODEL      │         │   DONE? DECIDER     │
  │   writes / runs     │────────►│   not the same hat  │
  └─────────────────────┘         └─────────────────────┘
```

Never trust the same role that implemented the change to solely declare victory. Goal Mode encodes that as `goal-worker` vs `goal-verifier` (+ scripts).
