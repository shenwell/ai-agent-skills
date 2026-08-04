#!/usr/bin/env node
/**
 * goal-status.js — parse GOAL.md frontmatter for automation/hooks
 * Usage: node goal-status.js goals/my-goal [--json]
 */

const fs = require('fs');
const path = require('path');
const {
  loadConfig,
  getExecutionMode,
  getMaxStepsPerSession,
  getMaxHours,
  buildSessionLoopPrompt,
} = require('./goal-config');
const { getTimeStatus } = require('./goal-time');

const ROOT = process.cwd();

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const yaml = match[1];
  const out = {};
  for (const line of yaml.split('\n').map((l) => l.replace(/\r$/, ''))) {
    const m = line.match(/^([\w_]+):\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (val === 'null') val = null;
    else if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (/^\d+$/.test(val)) val = parseInt(val, 10);
    else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[m[1]] = val;
  }
  return out;
}

function countPhaseSteps(phaseContent) {
  const lines = phaseContent.split('\n');
  let inPlan = false;
  let unchecked = 0;
  let checked = 0;

  for (const line of lines) {
    if (/^##\s+Plan\b/i.test(line)) {
      inPlan = true;
      continue;
    }
    if (inPlan && /^##\s+/.test(line)) break;
    if (!inPlan) continue;

    if (/^- \[ \]/.test(line)) unchecked++;
    else if (/^- \[[xX]\]/.test(line)) checked++;
  }

  return { unchecked, checked, total: unchecked + checked };
}

function countUncheckedCriteria(content) {
  const criteria = [];
  const lines = content.split('\n');
  let inCriteria = false;

  for (const line of lines) {
    if (/^##\s+Completion Criteria/i.test(line)) {
      inCriteria = true;
      continue;
    }
    if (inCriteria && /^##\s+/.test(line)) break;
    if (!inCriteria) continue;

    const m = line.match(/^- \[ \]\s*(C\d+):/);
    if (m) criteria.push(m[1]);
  }

  return criteria;
}

function countPhasesRemaining(content, currentPhase, phasesTotal) {
  if (phasesTotal == null || phasesTotal === 0) return null;
  const phase = currentPhase ?? 0;
  return Math.max(0, phasesTotal - phase);
}

function resolveGoalFile(goalArg) {
  const goalPath = path.isAbsolute(goalArg)
    ? goalArg
    : path.join(ROOT, goalArg, goalArg.endsWith('GOAL.md') ? '' : 'GOAL.md');
  return goalPath.endsWith('GOAL.md') ? goalPath : path.join(goalPath, 'GOAL.md');
}

function resolveExecutionMode(meta, config) {
  if (meta.execution_mode && meta.execution_mode !== 'null') {
    return meta.execution_mode === 'single_iteration' ? 'single_iteration' : 'run_until_complete';
  }
  return getExecutionMode(config);
}

function main() {
  const args = process.argv.slice(2);
  const jsonOut = args.includes('--json');
  const goalArg = args.find((a) => !a.startsWith('--')) || loadActiveGoal();

  if (!goalArg) {
    console.error('Usage: node goal-status.js goals/<id> [--json]');
    process.exit(1);
  }

  const file = resolveGoalFile(goalArg);

  if (!fs.existsSync(file)) {
    console.error(`Not found: ${file}`);
    process.exit(1);
  }

  const content = fs.readFileSync(file, 'utf8');
  const meta = parseFrontmatter(content);
  const config = loadConfig();
  const maxIter = meta.max_iterations || config.budget.max_iterations;
  const maxHours = meta.max_hours || getMaxHours(config);
  const status = meta.status || 'UNKNOWN';
  const iteration = meta.iteration || 0;
  const executionMode = resolveExecutionMode(meta, config);
  const maxStepsPerSession = getMaxStepsPerSession(config);

  const goalDir = path.dirname(file);
  let timeStatus = null;
  try {
    timeStatus = getTimeStatus(goalDir, config);
  } catch {
    timeStatus = null;
  }

  const terminal = ['COMPLETE', 'FAILED', 'PAUSED'].includes(status);
  const blocked = status === 'BLOCKED';
  const overIterationBudget = iteration >= maxIter;
  const overTimeBudget = timeStatus?.over_time_budget === true;
  const overBudget = overIterationBudget || overTimeBudget;
  const planning = ['DRAFT', 'INTAKE', 'PLANNING'].includes(status);
  const readyToExecute =
    status === 'PLANNED' &&
    ['phase', 'executing'].includes(meta.planning_level || '');
  const shouldContinue =
    !terminal && !blocked && !overBudget &&
    (['ACTIVE', 'CONTINUE'].includes(status) || planning || readyToExecute);

  const relGoalDir = path.relative(ROOT, goalDir).replace(/\\/g, '/');
  const currentPhase = meta.current_phase;
  let stepsRemainingInPhase = null;

  if (currentPhase != null) {
    const phaseFile = path.join(goalDir, 'phases', `phase-${currentPhase}.md`);
    if (fs.existsSync(phaseFile)) {
      const phaseContent = fs.readFileSync(phaseFile, 'utf8');
      stepsRemainingInPhase = countPhaseSteps(phaseContent).unchecked;
    }
  }

  const criteriaRemaining = countUncheckedCriteria(content);
  const phasesRemaining = countPhasesRemaining(content, currentPhase, meta.phases_total);
  const lastMemoryCheckpoint = meta.last_memory_checkpoint ?? 0;
  const memoryEveryN =
    config.memory?.checkpoints?.every_n_iterations ??
    maxStepsPerSession;
  const memoryEnabled = config.memory?.checkpoints?.enabled !== false;
  const iterationsSinceMemory = iteration - lastMemoryCheckpoint;
  const memoryCheckpointDue =
    memoryEnabled && shouldContinue && iterationsSinceMemory >= memoryEveryN;
  const sessionShouldLoop =
    shouldContinue &&
    executionMode === 'run_until_complete' &&
    iteration < maxIter;

  const relPath = path.relative(ROOT, file).replace(/\\/g, '/');
  const resumePrompt = shouldContinue
    ? buildSessionLoopPrompt(relPath, meta, config)
    : null;

  const result = {
    goal_id: meta.goal_id || path.basename(path.dirname(file)),
    path: relPath,
    status,
    planning_level: meta.planning_level || 'none',
    current_phase: currentPhase ?? null,
    phases_total: meta.phases_total ?? 0,
    iteration,
    max_iterations: maxIter,
    blocker: meta.blocker || null,
    active_step: meta.active_step || null,
    should_continue: shouldContinue,
    resume_prompt: resumePrompt,
    execution_mode: executionMode,
    max_steps_per_session: maxStepsPerSession,
    steps_remaining_in_phase: stepsRemainingInPhase,
    phases_remaining: phasesRemaining,
    criteria_remaining: criteriaRemaining,
    terminal,
    session_should_loop: sessionShouldLoop,
    last_memory_checkpoint: lastMemoryCheckpoint,
    memory_checkpoint_due: memoryCheckpointDue,
    memory_every_n_iterations: memoryEveryN,
    max_hours: maxHours,
    elapsed_hours: timeStatus?.elapsed_hours ?? null,
    remaining_hours: timeStatus?.remaining_hours ?? null,
    over_time_budget: overTimeBudget,
    over_iteration_budget: overIterationBudget,
    time_sessions_count: timeStatus?.sessions_count ?? 0,
    time_by_activity_ms: timeStatus?.by_activity_ms ?? null,
  };

  if (jsonOut) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Goal: ${result.goal_id}`);
    console.log(`Status: ${status} | Iteration: ${iteration}/${maxIter}`);
    console.log(`Time: ${result.elapsed_hours ?? '?'}h / ${maxHours}h (remaining ${result.remaining_hours ?? '?'}h)`);
    console.log(`Execution mode: ${executionMode}`);
    console.log(`Should continue: ${shouldContinue}`);
    console.log(`Session should loop: ${sessionShouldLoop}`);
    if (stepsRemainingInPhase != null) {
      console.log(`Steps remaining in phase: ${stepsRemainingInPhase}`);
    }
    if (result.blocker) console.log(`Blocker: ${result.blocker}`);
  }

  process.exit(shouldContinue ? 0 : 2);
}

function loadActiveGoal() {
  const config = loadConfig();
  return config.active_goal;
}

main();
