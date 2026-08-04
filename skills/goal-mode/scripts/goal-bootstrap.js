#!/usr/bin/env node
/**
 * goal-bootstrap.js — ensure current project has Goal Mode project files
 * Works from global skill (~/.cursor/skills/goal-mode) or project-local skill.
 *
 * Usage:
 *   node goal-bootstrap.js [project-root] [--force] [--json]
 *
 * Copies into project (if missing, or --force):
 *   .cursor/goal.config.yml, hooks.json, hooks/goal-*.js
 *   .cursor/skills/goal-mode/ (synced from this skill)
 *   .cursor/agents/goal-*.md, .cursor/commands/goal.md
 *   templates/, goals/
 */

const fs = require('fs');
const path = require('path');

const SKILL_ROOT = path.resolve(__dirname, '..');
const SCAFFOLD = path.join(SKILL_ROOT, 'project-scaffold');

function copyFile(src, dst, force) {
  if (!fs.existsSync(src)) return { path: dst, status: 'skip_missing_src' };
  if (fs.existsSync(dst) && !force) return { path: dst, status: 'exists' };
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  return { path: dst, status: force && fs.existsSync(dst) ? 'updated' : 'created' };
}

function copyDirRecursive(src, dst, force, results, filter) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (filter && !filter(name)) continue;
    const s = path.join(src, name);
    const d = path.join(dst, name);
    const st = fs.statSync(s);
    if (st.isDirectory()) {
      if (name === 'project-scaffold' || name === 'node_modules') continue;
      copyDirRecursive(s, d, force, results, null);
    } else {
      results.push(copyFile(s, d, force));
    }
  }
}

function resolveProjectRoot(arg) {
  if (arg && !arg.startsWith('--')) return path.resolve(arg);
  return process.cwd();
}

function isBootstrapped(root) {
  return (
    fs.existsSync(path.join(root, '.cursor', 'goal.config.yml')) &&
    fs.existsSync(path.join(root, '.cursor', 'skills', 'goal-mode', 'scripts', 'goal-init.js'))
  );
}

function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const jsonOut = args.includes('--json');
  const projectRoot = resolveProjectRoot(args.find((a) => !a.startsWith('--')));

  if (!fs.existsSync(SCAFFOLD)) {
    console.error(`Scaffold not found: ${SCAFFOLD}`);
    process.exit(1);
  }

  const results = [];
  const cursor = path.join(projectRoot, '.cursor');

  // Config / hooks (project-local — required for Cursor hooks)
  results.push(
    copyFile(
      path.join(SCAFFOLD, 'goal.config.yml'),
      path.join(cursor, 'goal.config.yml'),
      force
    )
  );
  results.push(
    copyFile(path.join(SCAFFOLD, 'hooks.json'), path.join(cursor, 'hooks.json'), force)
  );
  if (fs.existsSync(path.join(SCAFFOLD, 'goal.models.yml'))) {
    results.push(
      copyFile(
        path.join(SCAFFOLD, 'goal.models.yml'),
        path.join(cursor, 'goal.models.yml'),
        force
      )
    );
  }

  const hooksSrc = path.join(SCAFFOLD, 'hooks');
  const hooksDst = path.join(cursor, 'hooks');
  if (fs.existsSync(hooksSrc)) {
    for (const name of fs.readdirSync(hooksSrc)) {
      results.push(copyFile(path.join(hooksSrc, name), path.join(hooksDst, name), force));
    }
  }

  // Sync skill into project so relative paths (hooks, commands) keep working
  const skillDst = path.join(cursor, 'skills', 'goal-mode');
  copyDirRecursive(SKILL_ROOT, skillDst, true, results, null);

  // Agents + command into project (bundled in skill package for skills.sh installs)
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const agentNames = [
    'goal-intake.md',
    'goal-planner.md',
    'goal-phase-planner.md',
    'goal-worker.md',
    'goal-verifier.md',
  ];
  const agentSearchRoots = [
    path.join(SKILL_ROOT, 'agents'),
    path.join(path.dirname(path.dirname(SKILL_ROOT)), 'agents'),
    path.join(home, '.cursor', 'agents'),
  ];
  const agentsDst = path.join(cursor, 'agents');
  for (const name of agentNames) {
    let src = null;
    for (const root of agentSearchRoots) {
      const candidate = path.join(root, name);
      if (fs.existsSync(candidate)) {
        src = candidate;
        break;
      }
    }
    if (src) {
      results.push(copyFile(src, path.join(agentsDst, name), force));
    }
  }

  const cmdSrcCandidates = [
    path.join(SKILL_ROOT, 'commands', 'goal.md'),
    path.join(path.dirname(path.dirname(SKILL_ROOT)), 'commands', 'goal.md'),
    path.join(home, '.cursor', 'commands', 'goal.md'),
  ];
  for (const cmdSrc of cmdSrcCandidates) {
    if (fs.existsSync(cmdSrc)) {
      results.push(copyFile(cmdSrc, path.join(cursor, 'commands', 'goal.md'), force));
      break;
    }
  }

  // Templates
  const tplSrc = path.join(SCAFFOLD, 'templates');
  const tplDst = path.join(projectRoot, 'templates');
  if (fs.existsSync(tplSrc)) {
    for (const name of fs.readdirSync(tplSrc)) {
      results.push(copyFile(path.join(tplSrc, name), path.join(tplDst, name), force));
    }
  }

  // goals/
  const goalsDir = path.join(projectRoot, 'goals');
  if (!fs.existsSync(goalsDir)) {
    fs.mkdirSync(goalsDir, { recursive: true });
    fs.writeFileSync(
      path.join(goalsDir, '.gitkeep'),
      '# Active goals — one folder per goal with GOAL.md\n',
      'utf8'
    );
    results.push({ path: 'goals/', status: 'created' });
  } else {
    results.push({ path: 'goals/', status: 'exists' });
  }

  const summary = {
    ok: true,
    project_root: projectRoot,
    skill_root: SKILL_ROOT,
    was_bootstrapped: isBootstrapped(projectRoot),
    force,
    results: results.map((r) => ({
      path: path.isAbsolute(r.path) ? path.relative(projectRoot, r.path).replace(/\\/g, '/') : r.path,
      status: r.status,
    })),
  };

  if (jsonOut) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`Goal Mode bootstrap → ${projectRoot}`);
    console.log(`Skill source: ${SKILL_ROOT}`);
    const created = summary.results.filter((r) => r.status === 'created' || r.status === 'updated');
    console.log(`Files touched: ${created.length}`);
    for (const r of created.slice(0, 20)) console.log(`  ${r.status}: ${r.path}`);
    if (created.length > 20) console.log(`  ... +${created.length - 20} more`);
  }
}

main();
