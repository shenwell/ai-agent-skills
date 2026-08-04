# goal-mode integration (optional)

**Not a dependency.** Install [goal-mode](../../goal-mode/SKILL.md) separately if you want autonomous runs with memory checkpoints. Memo-session works standalone.

**Skills:** `memo-session-skill` + optional `goal-mode` ([shenwell/ai-agent-skills](https://github.com/shenwell/ai-agent-skills))

Goal Mode records **what happened** in `GOAL.md` (Progress Log, statuses, iterations). Memo-session saves **durable knowledge** — decisions, gotchas, workarounds — in `memory/` and wiki so the next agent turn (after summarization or stop-hook) does not lose project context.

## Install the pair (only if you use both)

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
npx skills add shenwell/ai-agent-skills --skill goal-mode -g -a cursor -y
```

Install only what you need. Memo-session does not invoke `npx skills add` during its pipeline.

After the first `/goal` in a project, bootstrap copies `.cursor/goal.config.yml` with `memory.checkpoints` → `skill: memo-session-skill`.

## When goal-mode invokes memo-session

| Event | Depth | Action |
|-------|-------|--------|
| Phase complete (exit criterion verified) | `full` | Full memo-session pipeline |
| `BLOCKED` | `full` | Handoff with blocker and options |
| `COMPLETE` | `full` | Close open-loops; wiki runbook; portfolio if cross-repo |
| Session step limit (`max_steps_per_session`) | `light` | `hot-cache` + open-loops only |
| Every N iterations (`every_n_iterations`) | `light` | Batch checkpoint |

Details: [goal-mode/references/memory-checkpoints.md](../../goal-mode/references/memory-checkpoints.md).

## Memo depth

### `light` (2–5 min, inline by parent)

- `memory/hot-cache.md` — goal id, phase, iteration, 3–7 bullet facts
- `memory/open-loops.md` — new blocker or follow-up
- `goals/{id}/GOAL.md` frontmatter: `last_memory_checkpoint: <iteration>`

### `full` (full memo-session-skill pipeline)

Preflight → classify → route → conflict gate → write:

- **HOT** — decisions, active context for next session
- **WARM** — demote from HOT at limits
- **COLD (wiki)** — `memory/wiki/goal-<goal-id>.md`
- **Portfolio** — if goal touched infra, deploy, or cross-repo facts

Line in `memory/changelog.md` after writes.

## Per-goal wiki

```
memory/wiki/goal-<goal-id>.md   # runbook for the goal
memory/wiki/index.md            # link under "Goals"
```

Link from Progress Log: `Memory: memory/wiki/goal-<id>.md`.

On **COMPLETE**: "Outcome" section in wiki; demote HOT items that apply only to this goal.

## Config (goal.config.yml)

```yaml
memory:
  skill: memo-session-skill
  checkpoints:
    enabled: true
    on_phase_complete: full
    on_blocked: full
    on_complete: full
    on_session_limit: light
    every_n_iterations: 10
  wiki:
    per_goal_page: true
```

Disable: `memory.checkpoints.enabled: false`.

## Manual trigger

```
wrap up the goal
save what we learned after goal-mode
```

The parent goal-mode agent runs checkpoints automatically; the user does not need to remember memo.
