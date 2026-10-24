import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, temporary } from '../helpers.mjs';

// Strip Git-local variables so a hook-invoked run cannot redirect the fixture repository.
export function environment(extra = {}) {
  const env = { ...process.env, ...extra };
  const local = spawnSync('git', ['rev-parse', '--local-env-vars'], { encoding: 'utf8' }).stdout;
  for (const name of local.split('\n').filter(Boolean)) delete env[name];
  return env;
}

export function run(command, args, options = {}) {
  return spawnSync(command, args, { encoding: 'utf8', timeout: 30000, ...options });
}

export function must(command, args, options) {
  const result = run(command, args, options);
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`,
  );
  return result;
}

const STUB = (name, file) => `#!/usr/bin/env node
${file.endsWith('.cjs') ? "const fs = require('node:fs');" : "import fs from 'node:fs';"}
fs.appendFileSync(process.env.HOOK_LOG, '${name}\\n');
process.exit(Number(process.env.${name.toUpperCase().replace(/[^A-Z]/g, '_')}_EXIT || 0));
`;

// A temporary repository with the real hooks and stubbed Brain entry points.
export function fixture(t) {
  const root = temporary(t);
  const log = path.join(root, '.hook-log');
  const env = environment({ HOOK_LOG: log });
  must('git', ['init', '--initial-branch=main', root], { env });
  for (const [key, value] of [
    ['user.name', 'Test'],
    ['user.email', 'test@example.com'],
    ['commit.gpgsign', 'false'],
  ]) {
    must('git', ['config', key, value], { cwd: root, env });
  }
  fs.cpSync(path.join(ROOT, '.githooks'), path.join(root, '.githooks'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts/wiki'), { recursive: true });
  const stubs = {
    'scripts/brain.mjs': 'brain',
    'scripts/nightly-push.mjs': 'push guard',
    'scripts/wiki/pre-commit.cjs': 'wiki',
  };
  for (const [file, name] of Object.entries(stubs))
    fs.writeFileSync(path.join(root, file), STUB(name, file));
  // Real commitlint, ESLint and Prettier, resolved from the repository's dependencies.
  for (const config of ['commitlint.config.cjs', 'eslint.config.js', '.prettierrc.json']) {
    fs.copyFileSync(path.join(ROOT, config), path.join(root, config));
  }
  fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(root, 'node_modules'));
  fs.writeFileSync(path.join(root, '.gitignore'), 'node_modules\n.hook-log\n');
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify({
      private: true,
      type: 'module',
      // Fails with 9 if Git-local variables leak into the gate.
      scripts: {
        'verify:push':
          'node -e "process.exit(process.env.GIT_DIR ? 9 : Number(process.env.VERIFY_EXIT || 0))"',
      },
    }),
  );
  fs.writeFileSync(path.join(root, 'README'), 'fixture\n');
  must('git', ['add', '.'], { cwd: root, env });
  must('git', ['commit', '-m', 'chore(test): seed fixture'], { cwd: root, env });
  must('git', ['config', 'core.hooksPath', '.githooks'], { cwd: root, env });
  const calls = () => (fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n') : []);
  return { root, env, calls };
}
