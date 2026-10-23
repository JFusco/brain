import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fixture, run } from './support.mjs';

const stage = ({ root, env }, name) => {
  fs.writeFileSync(path.join(root, name), `${Date.now()}\n`);
  assert.equal(run('git', ['add', name], { cwd: root, env }).status, 0);
};
const commit = (repo, extra = {}) =>
  run('git', ['commit', '-m', 'docs(test): change note'], {
    cwd: repo.root,
    env: { ...repo.env, ...extra },
  });

test('a failing privacy check blocks the commit before the wiki lifecycle', t => {
  const repo = fixture(t);
  stage(repo, 'note.md');
  const result = commit(repo, { BRAIN_EXIT: '1' });
  assert.notEqual(result.status, 0);
  assert.deepEqual(repo.calls(), ['brain']);
});

test('a failing wiki lifecycle stays advisory', t => {
  const repo = fixture(t);
  stage(repo, 'note.md');
  const result = commit(repo, { WIKI_EXIT: '1' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /wiki lifecycle failed; continuing/);
  assert.deepEqual(repo.calls(), ['brain', 'wiki']);
});

test('pre-push runs the nightly guard first and propagates its failure', t => {
  const repo = fixture(t);
  const hook = path.join(repo.root, '.githooks/pre-push');
  const guard = run('sh', [hook], {
    cwd: repo.root,
    env: { ...repo.env, PUSH_GUARD_EXIT: '3' },
    input: '',
  });
  assert.equal(guard.status, 3);
  assert.deepEqual(repo.calls(), ['push guard']);
});

test('pre-push runs verify:push without inherited Git variables and propagates its exit code', t => {
  const repo = fixture(t);
  const hook = path.join(repo.root, '.githooks/pre-push');
  const env = { ...repo.env, GIT_DIR: path.join(repo.root, '.git'), VERIFY_EXIT: '7' };
  const result = run('sh', [hook], { cwd: repo.root, env, input: '' });
  assert.equal(result.status, 7, result.stderr);
});

test('commit-msg rejects messages outside the commit standard', t => {
  const repo = fixture(t);
  stage(repo, 'note.md');
  const result = run('git', ['commit', '-m', 'updated stuff'], { cwd: repo.root, env: repo.env });
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /type-empty|subject-empty/);
});
