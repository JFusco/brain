import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { COMMANDS, HELP, plan } from '../scripts/lib/tree/cli/commands.mjs';
import { ROOT } from './helpers.mjs';

const brain = (...argv) =>
  spawnSync(process.execPath, [path.join(ROOT, 'scripts/brain.mjs'), ...argv], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 30000,
  });

test('help is generated from the command table and lists every command', () => {
  const result = brain('--help');
  assert.equal(result.status, 0);
  assert.equal(result.stdout, HELP + '\n');
  for (const [name, command] of Object.entries(COMMANDS)) {
    assert.ok(command.usage.length, name);
    assert.match(HELP, new RegExp(`brain\\.mjs ${name}\\b`), name);
  }
});

test('the README documents every command', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  for (const name of Object.keys(COMMANDS))
    assert.match(readme, new RegExp(`(brain\\.mjs|pnpm brain) ${name}\\b`), name);
});

test('commands that mutate private state take the lock; read-only ones do not', () => {
  const locks = (argv, flags = {}) => plan(argv, flags).mutating;
  assert.equal(locks(['lookup'], { query: 'x' }), false);
  assert.equal(locks(['lookup'], { query: 'x', fetch: true }), true);
  assert.equal(locks(['curation', 'stale']), true);
  assert.equal(locks(['inbox', 'list']), false);
  assert.equal(locks(['inbox', 'resolve']), true);
  assert.equal(locks(['maintenance', 'cleanup']), false);
  assert.equal(locks(['maintenance', 'cleanup'], { yes: true }), true);
  assert.equal(locks(['official', 'sync']), true);
  assert.equal(locks(['check']), false);
});

test('unknown commands and unsupported options fail without side effects', async () => {
  const unknown = brain('nope');
  assert.equal(unknown.status, 1);
  assert.match(unknown.stderr, /^brain: Unknown command/);
  const option = brain('lookup', '--query', 'x', '--bogus', 'y');
  assert.equal(option.status, 1);
  assert.match(option.stderr, /Unsupported option --bogus for lookup/);
  await assert.rejects(plan(['activity', 'constructor'], {}).execute(), /Unknown subcommand/);
});
