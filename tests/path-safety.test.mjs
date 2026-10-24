import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { inside, noSymlinks, safePath } from '../scripts/lib/leaf/fs-safe.mjs';
import { temporary } from './helpers.mjs';

test('safePath accepts plain relative paths', () => {
  assert.equal(safePath('knowledge/react/note.md'), 'knowledge/react/note.md');
});

test('safePath rejects traversal, absolute, backslash, control and empty segments', () => {
  for (const value of [
    '../x',
    'a/../b',
    '/etc/passwd',
    'a\\b',
    'a/./b',
    'a//b',
    'a/\x00b',
    '',
    null,
  ]) {
    assert.throws(() => safePath(value), /Unsafe relative path/, String(value));
  }
});

test('inside contains descendants and the root itself, never siblings or parents', () => {
  assert.equal(inside('/r/root', '/r/root'), true);
  assert.equal(inside('/r/root', '/r/root/a/b'), true);
  assert.equal(inside('/r/root', '/r/root-other'), false);
  assert.equal(inside('/r/root', '/r'), false);
  assert.equal(inside('/r/root', '/r/root/../escape'), false);
});

test('noSymlinks refuses escapes and symlinked components, including dangling links', t => {
  const root = temporary(t);
  fs.mkdirSync(path.join(root, 'real'));
  fs.symlinkSync(path.join(root, 'real'), path.join(root, 'linked'));
  fs.symlinkSync(path.join(root, 'missing'), path.join(root, 'dangling'));
  assert.doesNotThrow(() => noSymlinks(root, path.join(root, 'real', 'new-file')));
  assert.throws(() => noSymlinks(root, path.join(root, 'linked', 'x')), /symlink/);
  assert.throws(() => noSymlinks(root, path.join(root, 'dangling')), /symlink/);
  assert.throws(() => noSymlinks(root, path.dirname(root)), /escapes/);
});

test('noSymlinks refuses a symlinked managed root', t => {
  const base = temporary(t);
  fs.mkdirSync(path.join(base, 'target'));
  fs.symlinkSync(path.join(base, 'target'), path.join(base, 'root'));
  assert.throws(
    () => noSymlinks(path.join(base, 'root'), path.join(base, 'root', 'a')),
    /Managed root is a symlink/,
  );
});
