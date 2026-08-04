# Memory Checkpoints During Goal Execution

**Skill:** [`memo-session-skill`](../../memo-session-skill/SKILL.md) — install:

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```

Path after install: `~/.cursor/skills/memo-session-skill/` · integration: [memo-session goal-mode-integration](../../memo-session-skill/references/goal-mode-integration.md)

Goal Mode already logs **what happened** in `GOAL.md` Progress Log. Memo-session captures **durable knowledge** (decisions, gotchas, workarounds) into `memory/` and wiki so the next agent turn — after context summarization or stop-hook — does not lose project context.

## When to Run (mandatory checkpoints)

| Event | Memo depth | Why |
|-------|------------|-----|
| **Phase complete** (all steps `[x]`, exit criterion verified) | `full` | Largest context loss risk; stable learnings per milestone |
| **BLOCKED** | `full` | Human handoff must include blocker + options tried |
| **COMPLETE** | `full` | Close open-loops; wiki runbook; portfolio update if cross-repo |
| **Session step limit** (`max_steps_per_session` exhausted, status still CONTINUE) | `light` | Context about to reset via stop hook |
| **Every N iterations** (default: same as `max_steps_per_session`) | `light` | Batch checkpoint before summarization |

## When NOT to Run

- After every single worker step — `GOAL.md` + phase file already record progress
- Trivial steps (checkbox, echo, rename) with no new knowledge
- When `memory.checkpoints.enabled: false` in goal.config.yml

## Memo Depth

### `light` (2–5 min, inline by parent)

Update only:

- `memory/hot-cache.md` — goal id, phase, iteration, active_step, 3–7 bullets of new facts
- `memory/open-loops.md` — if new blocker or follow-up
- `goals/{id}/GOAL.md` frontmatter: `last_memory_checkpoint: <iteration>`

No full wiki page unless a gotcha is clearly stable.

### `full` (memo-session pipeline)

Run full **memo-session-skill** preflight → classify → route:

- **HOT** → decisions, active context for next session
- **WARM** → demote from HOT when over limits
- **COLD (wiki)** → `memory/wiki/goal-<goal-id>.md` or append to existing goal wiki page
- **Portfolio** (`GLOBAL_MEMORY_ROOT`) — if goal touched infra, deploy, or cross-repo facts

Always add one line to `memory/changelog.md` after writes.

## Wiki Per Goal

Preferred layout:

```
memory/wiki/goal-<goal-id>.md   # durable runbook for this goal
memory/wiki/index.md            # link under «Goals» or «Active work»
```

Link from `GOAL.md` Progress Log: `Memory: memory/wiki/goal-<id>.md`.

On **COMPLETE**: merge goal wiki section «Outcome» + link from index; demote HOT items that only applied to this goal.

## Integration in Session Loop

After each worker→verifier cycle, parent checks verifier `memory_checkpoint`:

```
none          → continue loop
light         → inline hot-cache update (no stop)
full          → run memo-session-skill, then continue or stop per status
phase_complete → full memo, then current_phase++
```

At end of session loop (before responding to user):

1. If `iteration - last_memory_checkpoint >= memory.checkpoints.every_n_iterations` → `light`
2. If session step budget exhausted → `light` minimum

## Config

See `goal.config.yml` → `memory.checkpoints`. Defaults align with `execution.max_steps_per_session`.

## Triggers for User

User does not need to remember — parent agent runs checkpoints automatically. Manual override:

```
/memo summarize goal progress
```
