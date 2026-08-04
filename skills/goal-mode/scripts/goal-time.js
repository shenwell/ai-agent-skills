#!/usr/bin/env node
/**
 * goal-time.js — wall-clock time tracking for Goal Mode sessions
 *
 * Usage:
 *   node goal-time.js session-start goals/my-goal
 *   node goal-time.js session-end goals/my-goal [--reason continue|terminal|budget]
 *   node goal-time.js log goals/my-goal --activity worker --detail "phase-0 step 3"
 *   node goal-time.js report goals/my-goal [--format md|json]
 *   node goal-time.js status goals/my-goal [--json]
 */

const fs = require('fs');
const path = require('path');
const { loadConfig } = require('./goal-config');

const ROOT = process.cwd();

const ACTIVITY_TYPES = [
  'intake',
  'master_plan',
  'phase_plan',
  'worker',
  'verifier',
  'verify_commands',
  'memory_checkpoint',
  'orchestration',
  'other',
];

function resolveGoalDir(goalArg) {
  const p = path.isAbsolute(goalArg)
    ? goalArg
    : path.join(ROOT, goalArg.replace(/\/GOAL\.md$/, ''));
  if (p.endsWith('GOAL.md')) return path.dirname(p);
  const goalFile = path.join(p, 'GOAL.md');
  if (!fs.existsSync(goalFile) && !fs.existsSync(p)) {
    console.error(`Goal not found: ${goalArg}`);
    process.exit(1);
  }
  return fs.existsSync(goalFile) ? p : p;
}

function timeLogPath(goalDir) {
  return path.join(goalDir, 'time-log.json');
}

function emptyLog(goalId) {
  return {
    goal_id: goalId,
    started_at: null,
    updated_at: null,
    total_wall_ms: 0,
    sessions: [],
    activities: [],
    by_activity_ms: Object.fromEntries(ACTIVITY_TYPES.map((t) => [t, 0])),
  };
}

function loadTimeLog(goalDir) {
  const file = timeLogPath(goalDir);
  const goalId = path.basename(goalDir);
  if (!fs.existsSync(file)) return emptyLog(goalId);
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    data.by_activity_ms = { ...emptyLog(goalId).by_activity_ms, ...(data.by_activity_ms || {}) };
    return data;
  } catch {
    return emptyLog(goalId);
  }
}

function saveTimeLog(goalDir, log) {
  log.updated_at = new Date().toISOString();
  fs.mkdirSync(goalDir, { recursive: true });
  fs.writeFileSync(timeLogPath(goalDir), JSON.stringify(log, null, 2), 'utf8');
}

function newSessionId() {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getOpenSession(log) {
  return log.sessions.find((s) => s.ended_at == null) || null;
}

function formatDuration(ms) {
  if (ms == null || ms < 0) return '0s';
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatHours(ms) {
  return (ms / 3600000).toFixed(2);
}

function recalcTotals(log) {
  log.total_wall_ms = log.sessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
  const byActivity = Object.fromEntries(ACTIVITY_TYPES.map((t) => [t, 0]));
  for (const a of log.activities) {
    const key = ACTIVITY_TYPES.includes(a.activity) ? a.activity : 'other';
    byActivity[key] += a.duration_ms || 0;
  }
  log.by_activity_ms = byActivity;
}

function sessionStart(goalArg) {
  const goalDir = resolveGoalDir(goalArg);
  const log = loadTimeLog(goalDir);
  const now = new Date().toISOString();

  if (!log.started_at) log.started_at = now;

  const open = getOpenSession(log);
  if (open) {
    console.log(JSON.stringify({ ok: true, action: 'session_already_open', session_id: open.session_id }));
    return;
  }

  const session = {
    session_id: newSessionId(),
    started_at: now,
    ended_at: null,
    duration_ms: 0,
    end_reason: null,
  };
  log.sessions.push(session);
  saveTimeLog(goalDir, log);
  console.log(JSON.stringify({ ok: true, action: 'session_started', session_id: session.session_id }));
}

function sessionEnd(goalArg, reason) {
  const goalDir = resolveGoalDir(goalArg);
  const log = loadTimeLog(goalDir);
  const open = getOpenSession(log);
  if (!open) {
    console.log(JSON.stringify({ ok: true, action: 'no_open_session' }));
    return;
  }

  const now = Date.now();
  const started = new Date(open.started_at).getTime();
  open.ended_at = new Date(now).toISOString();
  open.duration_ms = Math.max(0, now - started);
  open.end_reason = reason || 'continue';
  recalcTotals(log);
  saveTimeLog(goalDir, log);
  console.log(
    JSON.stringify({
      ok: true,
      action: 'session_ended',
      session_id: open.session_id,
      duration_ms: open.duration_ms,
      end_reason: open.end_reason,
    })
  );
}

function logActivity(goalArg, activity, detail, durationMs) {
  const goalDir = resolveGoalDir(goalArg);
  const log = loadTimeLog(goalDir);
  const act = ACTIVITY_TYPES.includes(activity) ? activity : 'other';
  const now = new Date().toISOString();
  const open = getOpenSession(log);

  const entry = {
    activity: act,
    detail: detail || '',
    started_at: now,
    ended_at: now,
    duration_ms: durationMs != null ? durationMs : 0,
    session_id: open ? open.session_id : null,
  };
  log.activities.push(entry);
  recalcTotals(log);
  saveTimeLog(goalDir, log);
  console.log(JSON.stringify({ ok: true, action: 'logged', entry }));
}

function getTimeStatus(goalArg, config) {
  const goalDir = resolveGoalDir(goalArg);
  const log = loadTimeLog(goalDir);
  const cfg = config || loadConfig();
  const maxHours = cfg.budget?.max_hours ?? 6;
  const maxMs = maxHours * 3600000;
  const elapsedMs = log.total_wall_ms;
  const open = getOpenSession(log);
  let liveElapsedMs = elapsedMs;
  if (open) {
    liveElapsedMs += Math.max(0, Date.now() - new Date(open.started_at).getTime());
  }
  const remainingMs = Math.max(0, maxMs - liveElapsedMs);
  const overBudget = liveElapsedMs >= maxMs;

  return {
    goal_id: path.basename(goalDir),
    started_at: log.started_at,
    total_wall_ms: elapsedMs,
    live_elapsed_ms: liveElapsedMs,
    max_hours: maxHours,
    max_ms: maxMs,
    remaining_ms: remainingMs,
    remaining_hours: (remainingMs / 3600000).toFixed(2),
    elapsed_hours: (liveElapsedMs / 3600000).toFixed(2),
    over_time_budget: overBudget,
    sessions_count: log.sessions.length,
    open_session: open ? { session_id: open.session_id, started_at: open.started_at } : null,
    by_activity_ms: log.by_activity_ms,
  };
}

function buildMarkdownReport(goalArg, meta) {
  const goalDir = resolveGoalDir(goalArg);
  const log = loadTimeLog(goalDir);
  const status = getTimeStatus(goalArg);
  const goalId = path.basename(goalDir);
  const now = new Date().toISOString();

  const activityRows = ACTIVITY_TYPES.map((act) => ({
    activity: act,
    ms: log.by_activity_ms[act] || 0,
  }))
    .filter((r) => r.ms > 0)
    .sort((a, b) => b.ms - a.ms);

  const recentActivities = log.activities.slice(-30).reverse();

  const lines = [
    `# Session Time Report — ${goalId}`,
    '',
    `Generated: ${now}`,
    '',
    '## Summary',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Goal status | ${meta?.status || 'unknown'} |`,
    `| Iteration | ${meta?.iteration ?? '—'} / ${meta?.max_iterations ?? '—'} |`,
    `| Wall-clock (completed sessions) | ${formatDuration(status.total_wall_ms)} (${status.elapsed_hours}h) |`,
    `| Time budget | ${status.max_hours}h |`,
    `| Budget remaining | ${formatDuration(status.remaining_ms)} (${status.remaining_hours}h) |`,
    `| Sessions | ${status.sessions_count} |`,
    `| Over time budget | ${status.over_time_budget ? 'yes' : 'no'} |`,
    '',
    '## Time by activity',
    '',
    '| Activity | Duration | Share |',
    '|----------|----------|-------|',
  ];

  const totalActMs = activityRows.reduce((s, r) => s + r.ms, 0) || status.total_wall_ms || 1;
  for (const row of activityRows) {
    const share = ((row.ms / totalActMs) * 100).toFixed(1);
    lines.push(`| ${row.activity} | ${formatDuration(row.ms)} | ${share}% |`);
  }
  if (activityRows.length === 0) {
    lines.push('| _(no activity logs — wall-clock only)_ | — | — |');
  }

  lines.push('', '## Sessions', '', '| # | Started | Duration | End reason |', '|---|---------|----------|------------|');
  log.sessions.forEach((s, i) => {
    lines.push(
      `| ${i + 1} | ${s.started_at} | ${formatDuration(s.duration_ms)} | ${s.end_reason || '—'} |`
    );
  });

  if (recentActivities.length > 0) {
    lines.push('', '## Recent activities (last 30)', '', '| Activity | Detail | Duration |', '|----------|--------|----------|');
    for (const a of recentActivities) {
      lines.push(`| ${a.activity} | ${a.detail || '—'} | ${formatDuration(a.duration_ms)} |`);
    }
  }

  lines.push(
    '',
    '## Notes',
    '',
    '- **Wall-clock** — время между session-start и session-end (хуки Cursor).',
    '- **Activities** — детализация, если parent agent вызывал `goal-time.js log` после шагов.',
    '- Для продолжения после лимита Cloud Agent (6h) используйте automation — см. automation-setup.md.',
    ''
  );

  return lines.join('\n');
}

function writeReport(goalArg, meta) {
  const goalDir = resolveGoalDir(goalArg);
  const md = buildMarkdownReport(goalArg, meta);
  const reportPath = path.join(goalDir, 'SESSION_TIME_REPORT.md');
  fs.writeFileSync(reportPath, md, 'utf8');
  return reportPath;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const cmd = args[0];
  const jsonOut = args.includes('--json');
  const formatIdx = args.indexOf('--format');
  const format = formatIdx >= 0 ? args[formatIdx + 1] : 'md';
  const reasonIdx = args.indexOf('--reason');
  const reason = reasonIdx >= 0 ? args[reasonIdx + 1] : 'continue';
  const activityIdx = args.indexOf('--activity');
  const activity = activityIdx >= 0 ? args[activityIdx + 1] : null;
  const detailIdx = args.indexOf('--detail');
  const detail = detailIdx >= 0 ? args.slice(detailIdx + 1).join(' ') : '';
  const durationIdx = args.indexOf('--duration-ms');
  const durationMs = durationIdx >= 0 ? parseInt(args[durationIdx + 1], 10) : null;
  const goalArg = args.find((a, i) => i > 0 && !a.startsWith('--') && (i === 1 || !['--format', '--reason', '--activity', '--detail', '--duration-ms'].includes(args[i - 1])));
  return { cmd, goalArg, jsonOut, format, reason, activity, detail, durationMs };
}

function main() {
  const { cmd, goalArg, jsonOut, format, reason, activity, detail, durationMs } = parseArgs(process.argv);

  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log(`Usage:
  node goal-time.js session-start <goal>
  node goal-time.js session-end <goal> [--reason continue|terminal|budget]
  node goal-time.js log <goal> --activity <type> --detail "<text>" [--duration-ms N]
  node goal-time.js report <goal> [--format md|json]
  node goal-time.js status <goal> [--json]`);
    process.exit(0);
  }

  if (!goalArg && cmd !== 'help') {
    const config = loadConfig();
    if (!config.active_goal) {
      console.error('Goal path required (or set active_goal in goal.config.yml)');
      process.exit(1);
    }
  }

  const goal = goalArg || loadConfig().active_goal;

  switch (cmd) {
    case 'session-start':
      sessionStart(goal);
      break;
    case 'session-end':
      sessionEnd(goal, reason);
      break;
    case 'log':
      if (!activity) {
        console.error('--activity required');
        process.exit(1);
      }
      logActivity(goal, activity, detail, durationMs);
      break;
    case 'status': {
      const status = getTimeStatus(goal);
      if (jsonOut) console.log(JSON.stringify(status, null, 2));
      else {
        console.log(`Elapsed: ${formatDuration(status.live_elapsed_ms)} / ${status.max_hours}h`);
        console.log(`Remaining: ${formatDuration(status.remaining_ms)}`);
        console.log(`Sessions: ${status.sessions_count}`);
        console.log(`Over budget: ${status.over_time_budget}`);
      }
      break;
    }
    case 'report': {
      let meta = {};
      const goalDir = resolveGoalDir(goal);
      const goalFile = path.join(goalDir, 'GOAL.md');
      if (fs.existsSync(goalFile)) {
        const content = fs.readFileSync(goalFile, 'utf8');
        const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (match) {
          for (const line of match[1].split('\n')) {
            const m = line.match(/^([\w_]+):\s*(.*)$/);
            if (m) {
              let v = m[2].trim();
              if (/^\d+$/.test(v)) v = parseInt(v, 10);
              meta[m[1]] = v;
            }
          }
        }
      }
      if (format === 'json') {
        const status = getTimeStatus(goal);
        console.log(JSON.stringify({ ...status, report_md: buildMarkdownReport(goal, meta) }, null, 2));
      } else {
        const reportPath = writeReport(goal, meta);
        console.log(JSON.stringify({ ok: true, path: path.relative(ROOT, reportPath).replace(/\\/g, '/') }));
      }
      break;
    }
    default:
      console.error(`Unknown command: ${cmd}`);
      process.exit(1);
  }
}

module.exports = {
  ACTIVITY_TYPES,
  loadTimeLog,
  getTimeStatus,
  buildMarkdownReport,
  writeReport,
  formatDuration,
  formatHours,
  sessionStart,
  sessionEnd,
  logActivity,
  timeLogPath,
};

if (require.main === module) {
  main();
}
