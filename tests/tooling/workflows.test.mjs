import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { ROOT } from '../helpers.mjs';

const workflow = name => fs.readFileSync(path.join(ROOT, '.github/workflows', name), 'utf8');

test('quality runs the full read-only gate with the pinned scanner profile', () => {
  const quality = workflow('quality.yml');
  assert.match(quality, /permissions:\n\s+contents: read/);
  assert.match(quality, /pnpm install --frozen-lockfile/);
  assert.match(quality, /node scripts\/hosted\/setup\.mjs/);
  assert.match(quality, /run: pnpm run verify:ci/);
});

test('the new gates never run hosted reference maintenance', () => {
  for (const name of ['quality.yml', 'commitlint.yml']) {
    assert.doesNotMatch(
      workflow(name),
      /--hosted|official sync|brain-weekly|brain-sync|workflow_run/,
    );
  }
});
