# Drift Prevention

Long runs fail when the agent fixes unrelated code. Enforce before **every** file modification.

## Three Questions

1. Is this file mentioned in the **current phase plan step** (`phases/phase-N.md`)?
2. Does this change **directly advance** the current phase exit criterion or goal criterion?
3. Am I fixing a **documented blocker** — not gold-plating?

If **NO** to all three → **STOP**. Do not edit. Log in Progress Log:

```markdown
- **Drift attempt blocked**: {file} — reason: not in plan step {active_step}
```

## Allowed Paths

If `.cursor/goal.config.yml` has `drift.allowed_paths` non-empty, edits outside those prefixes are blocked unless in plan.

## Scope Creep Signals

- New dependencies not in plan
- Refactoring unrelated modules
- "While I'm here" improvements
- Changing API contracts not in objective

When detected → status BLOCKED or log drift and revert change.

## Plan Step Focus

`active_step` in frontmatter must match current work. Update when moving to next step.
