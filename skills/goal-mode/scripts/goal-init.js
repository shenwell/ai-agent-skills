#!/usr/bin/env node
/**
 * goal-init.js — scaffold a new goal from template
 * Usage: node goal-init.js "Fix all ESLint errors in frontend"
 *        node goal-init.js --id fix-eslint "Fix all ESLint errors"
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SKILL_ROOT = path.resolve(__dirname, '..');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48) || 'goal-' + Date.now();
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let id = null;
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--id' && args[i + 1]) {
      id = args[++i];
    } else {
      rest.push(args[i]);
    }
  }
  const title = rest.join(' ').trim();
  if (!title) {
    console.error('Usage: node goal-init.js [--id slug] "Goal title and objective"');
    process.exit(1);
  }
  return { id: id || slugify(title), title };
}

function findTemplate() {
  const candidates = [
    path.join(ROOT, 'templates', 'GOAL.template.md'),
    path.join(ROOT, '.cursor', 'skills', 'goal-mode', 'templates', 'GOAL.template.md'),
    path.join(SKILL_ROOT, 'templates', 'GOAL.template.md'),
    path.join(SKILL_ROOT, 'project-scaffold', 'templates', 'GOAL.template.md'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  console.error('GOAL.template.md not found. Run: node .../goal-bootstrap.js');
  process.exit(1);
}

function main() {
  const { id, title } = parseArgs(process.argv);
  const goalDir = path.join(ROOT, 'goals', id);
  const goalFile = path.join(goalDir, 'GOAL.md');

  if (fs.existsSync(goalFile)) {
    console.error(`Goal already exists: ${goalFile}`);
    process.exit(1);
  }

  const tplPath = findTemplate();
  let body = fs.readFileSync(tplPath, 'utf8');
  body = body
    .replace(/\{\{GOAL_ID\}\}/g, id)
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{OBJECTIVE\}\}/g, title);

  fs.mkdirSync(goalDir, { recursive: true });
  fs.writeFileSync(goalFile, body, 'utf8');

  console.log(JSON.stringify({ ok: true, goal_id: id, path: `goals/${id}/GOAL.md` }, null, 2));
}

main();
