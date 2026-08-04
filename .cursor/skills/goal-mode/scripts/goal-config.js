#!/usr/bin/env node
/**
 * goal-config.js — single source for goal.config.yml parsing
 * Usage: require('./goal-config') or node goal-config.js [--json]
 */

const fs = require('fs');
const path = require('path');

const DEFAULTS = {
  active_goal: null,
  budget: {
    max_iterations: 50,
    max_hours: 6,
    max_tokens_hint: 2000000,
  },
  execution: {
    mode: 'run_until_complete',
    max_steps_per_session: 10,
    stop_on: ['COMPLETE', 'BLOCKED', 'FAILED', 'PAUSED'],
  },
  hooks: {
    auto_continue_on_stop: true,
    inject_goal_on_session_start: true,
    max_continue_loops: 50,
  },
  memory: {
    skill: 'memo-session-skill',
    checkpoints: {
      enabled: true,
      on_phase_complete: 'full',
      on_blocked: 'full',
      on_complete: 'full',
      on_session_limit: 'light',
      every_n_iterations: 10,
    },
    wiki: { per_goal_page: true },
  },
  time_tracking: {
    enabled: true,
    report_on_terminal: true,
    report_on_session_end: true,
    log_activities: true,
  },
};

function parseScalar(val) {
  const trimmed = val.split('#')[0].trim();
  if (trimmed === 'null') return null;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseInlineArray(val) {
  const inner = val.replace(/^\[/, '').replace(/\]$/, '').trim();
  if (!inner) return [];
  return inner.split(',').map((s) => parseScalar(s.trim()));
}

function parseYamlBlock(raw) {
  const out = {};
  let currentSection = null;

  for (const line of raw.split('\n').map((l) => l.replace(/\r$/, ''))) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const sectionMatch = line.match(/^([\w_]+):\s*$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      out[currentSection] = {};
      continue;
    }

    const kvMatch = line.match(/^\s{0,2}([\w_]+):\s*(.*)$/);
    if (!kvMatch) continue;

    const key = kvMatch[1];
    let val = kvMatch[2].trim();

    if (val.startsWith('[') && val.endsWith(']')) {
      val = parseInlineArray(val);
    } else if (val.length > 0) {
      val = parseScalar(val);
    } else {
      val = null;
    }

    if (currentSection) {
      out[currentSection][key] = val;
    } else {
      out[key] = val;
    }
  }

  return out;
}

function mergeSection(target, source) {
  if (!source || typeof source !== 'object') return target;
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (v === null || v === undefined) continue;
    if (
      typeof v === 'object' &&
      !Array.isArray(v) &&
      target[k] &&
      typeof target[k] === 'object' &&
      !Array.isArray(target[k])
    ) {
      out[k] = mergeSection(target[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function loadConfig(root = process.cwd()) {
  const cfgPath = path.join(root, '.cursor', 'goal.config.yml');
  if (!fs.existsSync(cfgPath)) {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }

  const raw = fs.readFileSync(cfgPath, 'utf8');
  const parsed = parseYamlBlock(raw);

  return {
    active_goal: parsed.active_goal ?? DEFAULTS.active_goal,
    budget: mergeSection(DEFAULTS.budget, parsed.budget),
    execution: mergeSection(DEFAULTS.execution, parsed.execution),
    hooks: mergeSection(DEFAULTS.hooks, parsed.hooks),
    memory: mergeSection(DEFAULTS.memory, parsed.memory),
    verify: parsed.verify || {},
    drift: parsed.drift || {},
    cloud_agent: mergeSection(
      { long_running: true, auto_run: true, max_duration_hours: 8, branch_prefix: 'goal/' },
      parsed.cloud_agent || {}
    ),
    time_tracking: mergeSection(DEFAULTS.time_tracking, parsed.time_tracking),
  };
}

function getMaxHours(config) {
  const cfg = config || loadConfig();
  return cfg.budget?.max_hours ?? DEFAULTS.budget.max_hours;
}

function getRecommendedLoopLimit(config) {
  const cfg = config || loadConfig();
  const maxIter = cfg.budget?.max_iterations ?? DEFAULTS.budget.max_iterations;
  const maxHours = getMaxHours(cfg);
  // ~1 stop-hook loop per 15 min of budget, min = max_iterations
  const hourBased = Math.ceil(maxHours * 4);
  return Math.max(maxIter, hourBased, DEFAULTS.hooks.max_continue_loops);
}

function getExecutionMode(config) {
  const cfg = config || loadConfig();
  const mode = cfg.execution?.mode || DEFAULTS.execution.mode;
  return mode === 'single_iteration' ? 'single_iteration' : 'run_until_complete';
}

function getMaxStepsPerSession(config) {
  const cfg = config || loadConfig();
  return cfg.execution?.max_steps_per_session ?? DEFAULTS.execution.max_steps_per_session;
}

function getMaxContinueLoops(config) {
  const cfg = config || loadConfig();
  return cfg.hooks?.max_continue_loops ?? cfg.budget?.max_iterations ?? DEFAULTS.hooks.max_continue_loops;
}

function buildSessionLoopPrompt(goalPath, meta, config) {
  const cfg = config || loadConfig();
  const mode = getExecutionMode(cfg);
  const maxSteps = getMaxStepsPerSession(cfg);
  const rel = goalPath.replace(/\\/g, '/');
  const n = meta.iteration || 0;

  if (mode !== 'run_until_complete') {
    return [
      `Read ${rel} completely.`,
      `Last completed iteration: #${n}.`,
      `Status: ${meta.status}.`,
      'Execute one iteration: goal-worker then goal-verifier. Update GOAL.md.',
      'Follow goal-mode skill exactly.',
    ].join(' ');
  }

  return [
    `Read ${rel} completely.`,
    `Execution mode: run_until_complete. Session step budget: ${maxSteps}.`,
    `Last completed iteration: #${n}. Status: ${meta.status}.`,
    `Run up to ${maxSteps} iterations (worker → verifier → GOAL.md) in THIS session.`,
    'Do NOT stop after one step while status is ACTIVE or CONTINUE.',
    'Stop only on COMPLETE, BLOCKED, FAILED, PAUSED, or session step limit.',
    'Follow goal-mode skill exactly.',
  ].join(' ');
}

function buildStopHookTail(status) {
  const mode = status.execution_mode || 'single_iteration';
  const maxSteps = status.max_steps_per_session || 10;

  if (mode === 'run_until_complete') {
    return [
      `Execution mode: run_until_complete.`,
      `Run up to ${maxSteps} iterations (worker → verifier → GOAL.md) in THIS session.`,
      'Do NOT stop after the first step while status is ACTIVE or CONTINUE.',
      'Stop only on: COMPLETE, BLOCKED, FAILED, PAUSED, or session step limit.',
    ].join(' ');
  }

  return 'Execute one iteration: goal-worker then goal-verifier. Update GOAL.md.';
}

if (require.main === module) {
  const jsonOut = process.argv.includes('--json');
  const config = loadConfig();
  if (jsonOut) {
    console.log(JSON.stringify(config, null, 2));
  } else {
    console.log(`execution.mode: ${getExecutionMode(config)}`);
    console.log(`execution.max_steps_per_session: ${getMaxStepsPerSession(config)}`);
    console.log(`hooks.max_continue_loops: ${getMaxContinueLoops(config)}`);
  }
}

module.exports = {
  DEFAULTS,
  loadConfig,
  getExecutionMode,
  getMaxStepsPerSession,
  getMaxContinueLoops,
  getMaxHours,
  getRecommendedLoopLimit,
  buildSessionLoopPrompt,
  buildStopHookTail,
};
