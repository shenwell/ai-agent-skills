# Intake Protocol

**Trigger:** start of `/goal <text>` — after goal-init, before planning. **No user brief.**

## Purpose

Derive **Completion Criteria** and **Evidence Required** from the repo, not from user forms.

## Read Order

1. `.cursor/goal.config.yml` → `intake.docs` list (if present)
2. Else scan: `AGENTS.md`, `README.md`, `MEMORY.md`, `docs/`, `memory/wiki/`
3. User's goal text — interpret intent (e.g. "все фазы" → use documented phases)

## For "пройди все фазы реализации проекта"

1. Find phase definitions in project wiki (e.g. `memory/wiki/*-plan.md`, `ROADMAP.md`)
2. Create **one completion criterion per phase** (C1…Cn) with exit criteria from docs
3. Map each criterion to verify command from `goal.config.yml` or phase-specific check
4. Fill **Evidence Required** table in GOAL.md
5. Set frontmatter: `planning_level: intake`, `phases_total: N`

## For Generic Goals

If no phased docs exist:

1. Break objective into 3–7 **logical milestones** (will become master-plan rows)
2. One criterion per milestone
3. Derive verify commands from `goal.config.yml`

## Output

Update GOAL.md only (no production code):

- Completion Criteria filled
- Evidence Required filled
- `status: INTAKE` → ready for master plan

## Do NOT

- Ask user to fill a brief
- Leave placeholder `_опиши критерий_`
- Skip criteria — minimum 1, typical 3–8
