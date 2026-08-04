#!/usr/bin/env node

/**
 * sessionStart hook — inject active goal context + start time tracking
 * stdin: Cursor hook JSON
 * stdout: { "additional_context": "..." } or empty
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadConfig } = require('../skills/goal-mode/scripts/goal-config');

const ROOT = process.cwd();

function runNode(script, args) {
  try {
    execSync(`node "${script}" ${args}`, { cwd: ROOT, encoding: 'utf8', timeout: 10000 });
  } catch (e) {
    process.stderr.write(`[goal-session-start] ${path.basename(script)}: ${e.message}\n`);
  }
}

function main() {
  try {
    const input = fs.readFileSync(0, 'utf8');
    JSON.parse(input);

    const config = loadConfig();
    if (!config.hooks.inject_goal_on_session_start || !config.active_goal) {
      process.stdout.write('{}');
      return;
    }

    const timeScript = path.join(ROOT, '.cursor/skills/goal-mode/scripts/goal-time.js');
    if (config.time_tracking?.enabled !== false && fs.existsSync(timeScript)) {
      runNode(timeScript, `session-start "${config.active_goal}"`);
    }

    const script = path.join(ROOT, '.cursor/skills/goal-mode/scripts/goal-status.js');
    if (!fs.existsSync(script)) {
      process.stderr.write('[goal-session-start] goal-status.js not found\n');
      process.stdout.write('{}');
      return;
    }

    let statusJson;
    try {
      const out = execSync(`node "${script}" "${config.active_goal}" --json`, {
        cwd: ROOT,
        encoding: 'utf8',
        timeout: 10000,
      });
      statusJson = JSON.parse(out);
    } catch (e) {
      const out = (e.stdout || '').toString();
      if (out) {
        try {
          statusJson = JSON.parse(out);
        } catch (parseErr) {
          process.stderr.write(`[goal-session-start] Failed to parse goal-status: ${parseErr.message}\n`);
        }
      } else {
        process.stderr.write(`[goal-session-start] goal-status failed: ${e.message}\n`);
      }
    }

    if (!statusJson) {
      process.stdout.write('{}');
      return;
    }

    const policyLines = [
      '## Goal Execution Policy',
      `Mode: ${statusJson.execution_mode}`,
      `Session step budget: ${statusJson.max_steps_per_session}`,
      `Time budget: ${statusJson.elapsed_hours ?? '?'}h / ${statusJson.max_hours ?? '?'}h elapsed (remaining ${statusJson.remaining_hours ?? '?'}h)`,
    ];

    if (statusJson.execution_mode === 'run_until_complete') {
      policyLines.push(
        'Rule: While should_continue=true AND time budget remains, parent agent MUST loop worker→verifier without ending the turn after one step.'
      );
    }

    if (config.time_tracking?.log_activities !== false) {
      policyLines.push(
        'Time logging: after each subagent step run `node .cursor/skills/goal-mode/scripts/goal-time.js log <goal> --activity <type> --detail "<step>"`.'
      );
    }

    const ctx = [
      '## Active Goal Mode Session',
      `Goal: ${statusJson.goal_id} (${statusJson.path})`,
      `Status: ${statusJson.status} | Iteration: ${statusJson.iteration}/${statusJson.max_iterations}`,
      statusJson.steps_remaining_in_phase != null
        ? `Steps remaining in phase: ${statusJson.steps_remaining_in_phase}`
        : '',
      statusJson.blocker ? `Blocker: ${statusJson.blocker}` : '',
      statusJson.over_time_budget ? 'WARNING: time budget exhausted — session should stop or user must extend max_hours.' : '',
      'Follow skill goal-mode. Read GOAL.md before any work.',
      statusJson.should_continue && statusJson.resume_prompt ? `Resume: ${statusJson.resume_prompt}` : '',
      ...policyLines,
    ]
      .filter(Boolean)
      .join('\n');

    process.stdout.write(JSON.stringify({ additional_context: ctx }));
  } catch (err) {
    process.stderr.write(`[goal-session-start] Unexpected error: ${err.message}\n`);
    process.stdout.write('{}');
  }
}

main();
