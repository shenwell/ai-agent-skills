#!/usr/bin/env node

/**
 * stop hook — auto-continue goal iterations via followup_message
 * Ends time session, writes report on terminal, respects time + iteration budget
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadConfig, buildStopHookTail, getRecommendedLoopLimit } = require('../skills/goal-mode/scripts/goal-config');

const ROOT = process.cwd();

function runNodeCapture(script, args) {
  try {
    return execSync(`node "${script}" ${args}`, { cwd: ROOT, encoding: 'utf8', timeout: 15000 });
  } catch (e) {
    const out = (e.stdout || '').toString();
    if (out) return out;
    process.stderr.write(`[goal-stop-continue] ${path.basename(script)}: ${e.message}\n`);
    return null;
  }
}

function formatDuration(ms) {
  if (!ms) return '0s';
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function buildTimeSummary(status) {
  const lines = [
    '## Session time summary',
    `Elapsed: ${status.elapsed_hours ?? '?'}h / ${status.max_hours ?? '?'}h (remaining ${status.remaining_hours ?? '?'}h)`,
    `Sessions recorded: ${status.time_sessions_count ?? 0}`,
  ];

  const byAct = status.time_by_activity_ms;
  if (byAct) {
    const entries = Object.entries(byAct)
      .filter(([, ms]) => ms > 0)
      .sort((a, b) => b[1] - a[1]);
    if (entries.length > 0) {
      lines.push('By activity:');
      for (const [act, ms] of entries) {
        lines.push(`  - ${act}: ${formatDuration(ms)}`);
      }
    }
  }

  return lines.join('\n');
}

function main() {
  try {
    fs.readFileSync(0, 'utf8');

    const config = loadConfig();
    const timeScript = path.join(ROOT, '.cursor/skills/goal-mode/scripts/goal-time.js');

    if (!config.hooks.auto_continue_on_stop || !config.active_goal) {
      if (config.time_tracking?.enabled !== false && config.active_goal && fs.existsSync(timeScript)) {
        runNodeCapture(timeScript, `session-end "${config.active_goal}" --reason terminal`);
        if (config.time_tracking?.report_on_session_end !== false) {
          runNodeCapture(timeScript, `report "${config.active_goal}"`);
        }
      }
      process.stdout.write('{}');
      return;
    }

    const script = path.join(ROOT, '.cursor/skills/goal-mode/scripts/goal-status.js');
    if (!fs.existsSync(script)) {
      process.stderr.write('[goal-stop-continue] goal-status.js not found\n');
      process.stdout.write('{}');
      return;
    }

    let status;
    try {
      const out = execSync(`node "${script}" "${config.active_goal}" --json`, {
        cwd: ROOT,
        encoding: 'utf8',
        timeout: 10000,
      });
      status = JSON.parse(out);
    } catch (e) {
      const out = (e.stdout || '').toString();
      if (out) {
        try {
          status = JSON.parse(out);
        } catch (parseErr) {
          process.stderr.write(`[goal-stop-continue] Failed to parse goal-status output: ${parseErr.message}\n`);
        }
      } else {
        process.stderr.write(`[goal-stop-continue] goal-status failed: ${e.message}\n`);
      }
    }

    const endReason = status?.should_continue ? 'continue' : status?.over_time_budget ? 'budget' : 'terminal';

    if (config.time_tracking?.enabled !== false && fs.existsSync(timeScript)) {
      runNodeCapture(timeScript, `session-end "${config.active_goal}" --reason ${endReason}`);
    }

    const isTerminal = !status || !status.should_continue;

    if (isTerminal && config.time_tracking?.report_on_terminal !== false && fs.existsSync(timeScript)) {
      const reportOut = runNodeCapture(timeScript, `report "${config.active_goal}"`);
      if (reportOut) {
        try {
          const parsed = JSON.parse(reportOut);
          if (parsed.path) {
            process.stderr.write(`[goal-stop-continue] Time report: ${parsed.path}\n`);
          }
        } catch {
          /* ignore */
        }
      }
    }

    if (!status || !status.should_continue || !status.resume_prompt) {
      if (status) {
        const summary = buildTimeSummary(status);
        process.stderr.write(`[goal-stop-continue] Session ended.\n${summary}\n`);
        process.stderr.write('[goal-stop-continue] Full report: goals/{id}/SESSION_TIME_REPORT.md\n');
      }
      process.stdout.write('{}');
      return;
    }

    const tail = buildStopHookTail(status);
    const timeNote = buildTimeSummary(status);
    const msg = [
      '[Goal Mode auto-continue]',
      status.resume_prompt,
      tail,
      timeNote,
      `Time budget remaining: ${status.remaining_hours ?? '?'}h — continue until COMPLETE, BLOCKED, FAILED, or budget exhausted.`,
    ].join('\n');

    const recommendedLoops = getRecommendedLoopLimit(config);
    if (recommendedLoops > 50) {
      process.stderr.write(
        `[goal-stop-continue] Tip: raise hooks.json loop_limit to at least ${recommendedLoops} for ${config.budget?.max_hours ?? 6}h budget\n`
      );
    }

    process.stdout.write(JSON.stringify({ followup_message: msg }));
  } catch (err) {
    process.stderr.write(`[goal-stop-continue] Unexpected error: ${err.message}\n`);
    process.stdout.write('{}');
  }
}

main();
