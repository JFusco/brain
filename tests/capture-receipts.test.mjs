import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import test from 'node:test';
import { ROOT, temporary } from './helpers.mjs';
import { plan } from '../scripts/lib/tree/cli/commands.mjs';

async function fixture(t) {
  const root = temporary(t);
  fs.cpSync(path.join(ROOT, 'scripts/lib'), path.join(root, 'scripts/lib'), { recursive: true });
  const binary = path.join(root, 'scanner');
  const body = '#!/bin/sh\nif [ "$1" = version ]; then echo fixture; fi\nexit 0\n';
  fs.writeFileSync(binary, body, { mode: 0o700 });
  const settings = {
    domains: ['tooling', 'react'],
    keywords: { tooling: ['tooling'] },
    capture: { candidateBytes: 16384 },
    toolchain: {
      gitleaks: binary,
      gitleaksVersion: 'fixture',
      gitleaksBinarySha256: createHash('sha256').update(body).digest('hex'),
    },
  };
  fs.writeFileSync(path.join(root, 'brain.config.json'), JSON.stringify(settings));
  const api = await import(pathToFileURL(path.join(root, 'scripts/lib/tree/capture/capture.mjs')));
  const inbox = await import(pathToFileURL(path.join(root, 'scripts/lib/tree/inbox/commands.mjs')));
  const indexPath = path.join(root, '.state/harvest.json');
  return {
    root,
    ...api,
    inbox,
    index: () => JSON.parse(fs.readFileSync(indexPath)),
    save: index => fs.writeFileSync(indexPath, JSON.stringify(index)),
  };
}

test('request bytes and domain bind one receipt, including duplicates and changed privacy policy', async t => {
  const f = await fixture(t),
    requestId = randomUUID();
  const first = f.capture('Useful tooling guidance.\n', { requestId, domain: 'tooling' });
  assert.equal(first.found, true);
  assert.deepEqual(f.capture('Useful tooling guidance.\n', { requestId, domain: 'tooling' }), {
    ...first,
    replayed: true,
  });
  for (const [text, domain] of [
    ['Useful tooling guidance.', 'tooling'],
    ['Useful tooling guidance.\n', 'react'],
  ])
    assert.throws(() => f.capture(text, { requestId, domain }), /different input or domain/);
  const duplicate = f.capture('Useful tooling guidance.\n', {
    requestId: randomUUID(),
    domain: 'tooling',
  });
  assert.equal(duplicate.id, first.id);
  assert.equal(duplicate.duplicate, true);
  assert.equal(Object.keys(f.index().candidates).length, 1);
  const state = f.index();
  state.candidates[first.id].policy = 'changed-policy';
  state.candidates[first.id].disposition = { as: 'rejected', at: 'fixture' };
  f.save(state);
  assert.equal(f.captureReceipt(requestId).policy, first.policy);
  assert.equal(f.captureReceipt(requestId).disposition.as, 'rejected');
  assert.equal(
    f.capture('Useful tooling guidance.\n', { requestId, domain: 'tooling' }).id,
    first.id,
  );
  const mixed = '0F8FAD5B-D9CB-469F-A165-70867728950E';
  f.capture('Useful tooling guidance.\n', { requestId: mixed, domain: 'tooling' });
  assert.equal(f.captureReceipt(mixed.toLowerCase()).found, true);
  assert.throws(
    () => f.capture('Other guidance.\n', { requestId: mixed.toLowerCase(), domain: 'tooling' }),
    /different input or domain/,
  );
});

test('receipt lookup is non-mutating, unknown is explicit, invalid bytes and IDs fail', async t => {
  const f = await fixture(t),
    requestId = randomUUID();
  assert.equal(plan(['capture', 'receipt'], { 'request-id': requestId }).mutating, false);
  assert.equal(plan(['capture'], { stdin: true, 'request-id': requestId }).mutating, true);
  assert.deepEqual(f.captureReceipt(requestId), { version: 1, requestId, found: false });
  assert.equal(fs.existsSync(path.join(f.root, '.state')), false);
  const malformed = Buffer.from([0x55, 0xff, 0x0a]);
  assert.throws(() => f.capture(malformed, { requestId, domain: 'tooling' }));
  assert.throws(() => f.capture('Text', { requestId }), /requires --domain/);
  assert.throws(() => f.captureReceipt('../bad'), /UUID/);
  const legacy = f.capture(malformed);
  const file = path.join(f.root, f.index().candidates[legacy.id].file);
  assert.equal(fs.readFileSync(file, 'utf8').includes('U�'), true);
});

test('quarantine receipts never read bodies and remain resolvable after disposition', async t => {
  const f = await fixture(t),
    requestId = randomUUID();
  const result = f.capture('Example ' + ['-----BEGIN', 'PRIVATE', 'KEY-----'].join(' '), {
    requestId,
    domain: 'tooling',
  });
  assert.equal(result.status, 'quarantined');
  const state = f.index(),
    file = path.join(f.root, state.candidates[result.id].file);
  fs.unlinkSync(file);
  assert.equal(f.captureReceipt(requestId).currentStatus, 'quarantined');
  assert.equal(JSON.stringify(f.captureReceipt(requestId)).includes('BEGIN'), false);
});

test('pre-index interruption leaves no candidate; post-index failure still has its receipt', async t => {
  const f = await fixture(t),
    requestId = randomUUID();
  const rename = fs.renameSync;
  const failure = t.mock.method(fs, 'renameSync', (from, to) => {
    if (to === path.join(f.root, '.state/harvest.json'))
      throw new Error('fixture index interruption');
    return rename(from, to);
  });
  assert.throws(
    () => f.capture('Useful guidance', { requestId, domain: 'tooling' }),
    /fixture index interruption/,
  );
  failure.mock.restore();
  assert.equal(fs.existsSync(path.join(f.root, '.state/harvest.json')), false);
  assert.equal(f.captureReceipt(requestId).found, false);
  fs.mkdirSync(path.join(f.root, 'inbox/_summary.md'), { recursive: true });
  assert.throws(() => f.capture('Useful guidance', { requestId, domain: 'tooling' }));
  const receipt = f.captureReceipt(requestId);
  assert.equal(receipt.found, true);
  assert.equal(Object.keys(f.index().candidates).length, 1);
  assert.equal(f.capture('Useful guidance', { requestId, domain: 'tooling' }).id, receipt.id);
});
