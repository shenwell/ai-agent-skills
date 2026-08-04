# goal

**Single entry point for Goal Mode** — keep working until the goal is verifiably done (not after one attempt). Open alternative to Claude Code `/goal`.

## For users (after install)

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -g -a cursor -y
```

Other agents: `-a claude-code`, `-a codex`, … Then in any project:

```
/goal <objective text>
```

Example: `/goal Fix all ESLint errors in src; tests and build must pass`

**First run:** Step 0 below runs automatically — no separate bootstrap command for the happy path.

---

Works from the **global** skill (`~/.cursor/skills/goal-mode` or via `npx skills add`) in any project.

The user provides only the objective text. Everything else is automatic.

### Automatic pipeline

```
0. BOOTSTRAP → hooks/config/templates into the project (if missing)
1. INTAKE    → criteria from repo + goal.config.yml
2. MASTER    → phase table in GOAL.md (goal-planner)
3. PHASE×N   → expanded plan per phase (goal-phase-planner)
4. EXECUTE   → worker → verifier iterations
```

The user does **not** hand-write GOAL.md, plans, or `/goal plan`.

**Autonomy rule:** after `/goal <text>`, the parent agent must **not** end the reply until the goal reaches a terminal status (`COMPLETE`, `BLOCKED`, `FAILED`) or the global budget is exhausted. Intermediate statuses are not a reason to stop.

## Algorithm

### Step 0 — Bootstrap (always first; automatic on first `/goal`)

If the project lacks `.cursor/goal.config.yml` or `.cursor/skills/goal-mode/scripts/goal-init.js`, run bootstrap **yourself** (do not ask the user to run a second install command):

```bash
node "$HOME/.cursor/skills/goal-mode/scripts/goal-bootstrap.js" --json
# Windows: node "$env:USERPROFILE\.cursor\skills\goal-mode\scripts\goal-bootstrap.js" --json
# After skills CLI (alternate path):
node "$HOME/.agents/skills/goal-mode/scripts/goal-bootstrap.js" --json
```

Or from a project-local skill copy:

```bash
node .cursor/skills/goal-mode/scripts/goal-bootstrap.js --json
```

Further scripts use the **project** path: `.cursor/skills/goal-mode/scripts/...`

### Step 1 — Scaffold

```bash
node .cursor/skills/goal-mode/scripts/goal-init.js "<text>"
```

### Step 2 — Intake

1. **mcp_task** → `goal-intake` (or follow intake-protocol inline)
2. Skill → references/intake-protocol.md
3. `status: INTAKE`, `planning_level: intake`

### Step 3 — Master plan

1. references/hierarchical-plan-protocol.md Level 2
2. **mcp_task** → `goal-planner`
3. Create `goals/{id}/phases/`

### Step 4 — Phase plans

For each phase 0…N-1:

1. **mcp_task** → `goal-phase-planner` with `phase_id: N`
2. Writes `goals/{id}/phases/phase-N.md`
3. Master row → `planned`

When all planned: `status: PLANNED` → go to Execute immediately.

### Step 5 — Execute

1. Set `active_goal` in goal.config.yml
2. `current_phase: 0`, `planning_level: executing`, `status: ACTIVE`
3. Loop until COMPLETE | BLOCKED | FAILED:
   - `run_until_complete`: up to `max_steps_per_session` per turn
   - **goal-worker** then **goal-verifier**
   - Update GOAL.md + phase file
   - On phase complete → `current_phase++`
4. Do not stop on CONTINUE while session step budget remains

### Time tracking

After each subagent step:

```bash
node .cursor/skills/goal-mode/scripts/goal-time.js log goals/{id} --activity worker --detail "phase-0 step 3"
```

On terminal status:

```bash
node .cursor/skills/goal-mode/scripts/goal-time.js report goals/{id}
```

→ `goals/{id}/SESSION_TIME_REPORT.md`

## Optional subcommands

| Command | When |
|---------|------|
| `/goal status [id]` | Inspect state (+ time) |
| `/goal resume [id]` | Continue execution |
| `/goal verify [id]` | Run verify commands |
| `/goal plan [id]` | Rebuild master + phase plans |
| `/goal run [id]` | Execute only (already PLANNED) |

## Delegation

Always prefer **mcp_task** subagents when available:

| Stage | subagent_type |
|-------|---------------|
| Intake | goal-intake |
| Master | goal-planner |
| Phase | goal-phase-planner |
| Work | goal-worker |
| Verify | goal-verifier |
