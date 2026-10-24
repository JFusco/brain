import assert from 'node:assert/strict';
import test from 'node:test';
import { args } from '../scripts/lib/leaf/cli-args.mjs';

test('separates positionals, valued flags, inline values and booleans', () => {
  assert.deepEqual(args(['lookup', '--query', 'cache', '--limit=3', '--fetch', 'extra']), {
    positional: ['lookup', 'extra'],
    flags: { query: 'cache', limit: '3', fetch: true },
  });
});

test('keeps "=" inside inline values', () => {
  assert.equal(args(['--query=a=b']).flags.query, 'a=b');
});

test('rejects duplicate options and missing values', () => {
  assert.throws(() => args(['--query', 'a', '--query', 'b']), /Duplicate option --query/);
  assert.throws(() => args(['--query']), /Missing value for --query/);
  assert.throws(() => args(['--query', '--fetch']), /Missing value for --query/);
});
