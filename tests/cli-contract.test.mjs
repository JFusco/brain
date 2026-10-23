import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { ROOT } from './helpers.mjs';

const brain = (...argv) =>
  spawnSync(process.execPath, [path.join(ROOT, 'scripts/brain.mjs'), ...argv], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 30000,
  });

// The documented command surface (README, skills, nightly). Removing one is a breaking change.
const COMMANDS = [
  'visual',
  'route',
  'brief',
  'playbooks',
  'explain',
  'compare',
  'feedback',
  'activity',
  'lookup',
  'vocabulary',
  'ui',
  'capture',
  'inbox',
  'curation',
  'links',
  'maintenance',
  'official',
  'skills',
  'check',
];

test('help documents every command', () => {
  const result = brain('--help');
  assert.equal(result.status, 0);
  for (const command of COMMANDS) {
    assert.match(result.stdout, new RegExp(`brain\\.mjs ${command}\\b`), command);
  }
});

test('unknown commands and unsupported options fail without side effects', () => {
  const unknown = brain('nope');
  assert.equal(unknown.status, 1);
  assert.match(unknown.stderr, /^brain: Unknown command/);
  const option = brain('lookup', '--query', 'x', '--bogus', 'y');
  assert.equal(option.status, 1);
  assert.match(option.stderr, /Unsupported option --bogus for lookup/);
});
