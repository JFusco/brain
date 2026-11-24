import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { repositoryProblems } from '../scripts/lib/branch/check/repository-rules.mjs';
import { temporary } from './helpers.mjs';

function privateWorktree(t) {
  const root = temporary(t);
  fs.mkdirSync(path.join(root, '.state'), { mode: 0o700 });
  fs.mkdirSync(path.join(root, 'inbox'), { mode: 0o700 });
  fs.writeFileSync(path.join(root, 'brain.config.local.json'), '{}\n', { mode: 0o600 });
  for (const name of ['.state', 'inbox']) fs.chmodSync(path.join(root, name), 0o700);
  fs.chmodSync(path.join(root, 'brain.config.local.json'), 0o600);
  return root;
}

test('owner-only private storage copied into a worktree passes', t => {
  assert.deepEqual(repositoryProblems(privateWorktree(t)), []);
});

test('group or other access to each private path is rejected with its required mode', t => {
  for (const [name, broad, mode] of [
    ['.state', 0o750, '0700'],
    ['inbox', 0o705, '0700'],
    ['brain.config.local.json', 0o640, '0600'],
    ['brain.config.local.json', 0o604, '0600'],
  ]) {
    const root = privateWorktree(t);
    fs.chmodSync(path.join(root, name), broad);
    assert.deepEqual(
      repositoryProblems(root),
      [`Private storage permissions are too broad: ${name} must be ${mode}`],
      `${name} ${broad.toString(8)}`,
    );
  }
});
