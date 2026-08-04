#!/usr/bin/env node
/**
 * goal-models.js — resolve model per pipeline step
 * Reads .cursor/goal.models.yml first, then goal.config.yml models section
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FILES = [
  path.join(ROOT, '.cursor', 'goal.models.yml'),
  path.join(ROOT, '.cursor', 'goal.config.yml'),
];

const STEPS = ['intake', 'master_plan', 'phase_plan', 'execute', 'verify'];
const PLANNING = new Set(['intake', 'master_plan', 'phase_plan']);
const CODING = new Set(['execute', 'verify']);

function parseYamlModels(raw) {
  const models = {};
  const available = [];
  let section = null;
  let currentItem = null;

  for (const line of raw.split('\n').map((l) => l.replace(/\r$/, ''))) {
    if (/^models:\s*$/.test(line)) {
      section = 'models';
      continue;
    }
    if (section === 'models' && /^  available:\s*$/.test(line)) {
      section = 'available';
      continue;
    }
    if (section !== 'available' && /^[a-z_]+:\s*$/.test(line) && !line.startsWith(' ')) {
      section = 'models';
    }
    if (section === 'available') {
      const idM = line.match(/^    - id:\s*(\S+)/);
      if (idM) {
        currentItem = { id: idM[1] };
        available.push(currentItem);
        continue;
      }
      const labelM = line.match(/^      label:\s*(.+)/);
      if (currentItem && labelM) {
        currentItem.label = labelM[1];
        continue;
      }
      const forM = line.match(/^      for:\s*\[(.*)\]/);
      if (currentItem && forM) {
        currentItem.for = forM[1].split(',').map((s) => s.trim());
        continue;
      }
      // End of available list — fall through to models keys
      const keyM = line.match(/^  (\w+):\s*(\S+)/);
      if (keyM && keyM[1] !== 'available') {
        section = 'models';
        models[keyM[1]] = keyM[2];
      }
      continue;
    }
    if (section === 'models') {
      const m = line.match(/^  (\w+):\s*(\S+)/);
      if (m && !m[2].startsWith('#')) models[m[1]] = m[2];
    }
  }

  return { models, available };
}

function load() {
  let merged = { models: {}, available: [] };
  for (const f of FILES) {
    if (!fs.existsSync(f)) continue;
    const p = parseYamlModels(fs.readFileSync(f, 'utf8'));
    merged.models = { ...merged.models, ...p.models };
    if (p.available.length) merged.available = p.available;
  }
  return merged;
}

function resolve(step, models) {
  if (models[step]) return models[step];
  if (PLANNING.has(step) && models.planning) return models.planning;
  if (CODING.has(step) && models.coding) return models.coding;
  return null;
}

function main() {
  const { models, available } = load();
  const resolved = {};
  for (const s of STEPS) resolved[s] = resolve(s, models);

  const args = process.argv.slice(2);
  const jsonOut = args.includes('--json');
  const listAvail = args.includes('--available');
  const stepArg = args.find((a) => !a.startsWith('--'));

  if (listAvail) {
    const out = available.length ? available : STEPS.map((s) => ({ step: s, id: resolved[s] }));
    console.log(jsonOut ? JSON.stringify(out, null, 2) : out.map((a) => `${a.id || a.step}: ${a.label || ''}`).join('\n'));
    return;
  }

  if (stepArg) {
    const m = resolve(stepArg, models);
    if (jsonOut) console.log(JSON.stringify({ step: stepArg, model: m }, null, 2));
    else console.log(m || '(inherit / session default)');
    return;
  }

  const out = { resolved, available, raw: models };
  if (jsonOut) console.log(JSON.stringify(out, null, 2));
  else {
    console.log('Resolved models:');
    for (const s of STEPS) console.log(`  ${s}: ${resolved[s] || '(inherit)'}`);
    if (available.length) {
      console.log('\nAvailable pool:');
      for (const a of available) console.log(`  ${a.id} — ${a.label || ''} [${(a.for || []).join(', ')}]`);
    }
    console.log('\nTip: set model in .cursor/agents/*.md frontmatter for UI dropdown.');
  }
}

main();
