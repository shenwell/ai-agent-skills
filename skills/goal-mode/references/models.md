# Model Routing

Two ways to set the model. You can combine them.

## Method 1 — dropdown in `.cursor/agents/*.md` (recommended)

Cursor shows a **model picker** in the UI when editing a subagent file.

Open, for example, [goal-planner.md](../../agents/goal-planner.md) and pick a model in the `model:` field:

```yaml
---
name: goal-planner
description: ...
model: gpt-5.3-codex-high   # ← click → dropdown of available models
---
```

| Agent file | Role | Default model |
|------------|------|---------------|
| `goal-intake.md` | Criteria from repo | Codex 5.3 High |
| `goal-planner.md` | Master plan | Codex 5.3 High |
| `goal-phase-planner.md` | Phase plan | Codex 5.3 High |
| `goal-worker.md` | Code | Composer 2.5 |
| `goal-verifier.md` | Verify | Composer 2.5 |

When calling `mcp_task(subagent_type="goal-planner", ...)`, Cursor **automatically** uses `model` from the agent frontmatter.

## Method 2 — pool and defaults in config

File [goal.models.yml](../../goal.models.yml) (or `models` section in `goal.config.yml`):

```yaml
models:
  available:          # catalog: which models for which roles
    - id: gpt-5.3-codex-high
      label: Codex 5.3 High
      for: [master_plan, phase_plan]
    - id: composer-2.5[fast=false]
      label: Composer 2.5
      for: [execute, verify]
  planning: gpt-5.3-codex-high
  coding: composer-2.5[fast=false]
```

Verify:

```bash
node .cursor/skills/goal-mode/scripts/goal-models.js
node .cursor/skills/goal-mode/scripts/goal-models.js --json master_plan
```

## Priority

```
1. model in agent frontmatter (.cursor/agents/*.md)  ← UI dropdown
2. models.<step> in goal.models.yml / goal.config.yml
3. models.planning / models.coding (group)
4. inherit (parent session model)
```

## Multiple models to choose from

- In **available**, list all models allowed in the project
- In each agent, use the **dropdown** to pick one from the pool
- For A/B: duplicate an agent, e.g. `goal-worker-fast.md` with `composer-2.5-fast`

## Model parameters (bracket syntax)

```yaml
model: composer-2.5[fast=false]     # non-fast variant
model: claude-opus-4-8[effort=high]
```

## mcp_task model (optional)

If frontmatter is set — **do not duplicate** `model` in mcp_task.

To override once:

```
mcp_task(subagent_type="goal-worker", model="composer-2.5-fast", ...)
```

## Cursor limitations

- On legacy plans subagents may be forced to Composer — Max Mode required
- Bugs: frontmatter sometimes ignored — see troubleshooting.md
- Cloud Agent: model chosen in UI when launching the VM
