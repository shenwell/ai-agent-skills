#!/usr/bin/env node
/**
 * goal-verify.js — run verify commands from goal.config.yml
 * Usage: node goal-verify.js [goals/my-goal] [--json]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();

function parseVerifyConfig(raw) {
  const verify = {};
  const lines = raw.split('\n');
  let current = null;
  let inVerify = false;

  for (const line of lines) {
    if (/^verify:\s*$/.test(line)) {
      inVerify = true;
      continue;
    }
    if (inVerify && /^[a-z_]+:\s*$/.test(line) && !line.startsWith(' ')) {
      inVerify = false;
    }
    if (!inVerify) continue;

    const keyMatch = line.match(/^  (\w+):\s*$/);
    if (keyMatch) {
      current = keyMatch[1];
      verify[current] = { required: true };
      continue;
    }
    if (current && line.match(/^    command:/)) {
      verify[current].command = line.split(':').slice(1).join(':').trim().replace(/^["']|["']$/g, '');
    }
    if (current && line.match(/^    required:/)) {
      verify[current].required = /true/.test(line);
    }
  }

  // Simple fallback: command: "npm test" at top level under keys
  if (Object.keys(verify).length === 0) {
    const block = raw.match(/verify:([\s\S]*?)(?=\n[a-z_]+:|$)/);
    if (block) {
      const re = /(\w+):\s*\n\s+command:\s*["']?([^"'\n]+)["']?/g;
      let m;
      while ((m = re.exec(block[1])) !== null) {
        verify[m[1]] = { command: m[2].trim(), required: true };
      }
    }
  }

  return verify;
}

function runCommand(name, cmd, timeoutMs) {
  const started = Date.now();
  try {
    const output = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: timeoutMs,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });
    return {
      name,
      command: cmd,
      ok: true,
      exit_code: 0,
      duration_ms: Date.now() - started,
      output_tail: output.split('\n').slice(-30).join('\n'),
    };
  } catch (e) {
    const out = (e.stdout || '') + (e.stderr || '');
    return {
      name,
      command: cmd,
      ok: false,
      exit_code: e.status ?? 1,
      duration_ms: Date.now() - started,
      output_tail: out.split('\n').slice(-30).join('\n'),
    };
  }
}

function main() {
  const args = process.argv.slice(2);
  const jsonOut = args.includes('--json');
  const cfgPath = path.join(ROOT, '.cursor', 'goal.config.yml');

  if (!fs.existsSync(cfgPath)) {
    console.error('Missing .cursor/goal.config.yml');
    process.exit(1);
  }

  const raw = fs.readFileSync(cfgPath, 'utf8');
  const verify = parseVerifyConfig(raw);
  const results = [];
  let allRequiredOk = true;

  for (const [name, spec] of Object.entries(verify)) {
    if (!spec.command) continue;
    const timeout = (spec.timeout_seconds || 600) * 1000;
    const r = runCommand(name, spec.command, timeout);
    results.push(r);
    if (spec.required !== false && !r.ok) allRequiredOk = false;
  }

  const payload = {
    ok: allRequiredOk,
    timestamp: new Date().toISOString(),
    results,
  };

  if (jsonOut) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    for (const r of results) {
      console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}: ${r.command}`);
    }
    console.log(allRequiredOk ? '\nAll required checks passed.' : '\nSome checks failed.');
  }

  process.exit(allRequiredOk ? 0 : 1);
}

main();
