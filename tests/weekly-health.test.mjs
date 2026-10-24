import assert from 'node:assert/strict';
import test from 'node:test';
import { body, driftLine, localLine, MARKER } from '../scripts/lib/branch/hosted/issue-body.mjs';
import { keepLink } from '../scripts/lib/branch/hosted/previous-state.mjs';
import { checksumFor } from '../scripts/lib/branch/platform/gitleaks.mjs';
import { sha } from '../scripts/lib/leaf/hash.mjs';

const run = {
  repository: 'JFusco/brain',
  runId: '42',
  runURL: 'https://github.com/JFusco/brain/actions/runs/42',
};
const context = (extra = {}) => ({
  fingerprint: 'abc',
  links: { checked: 3, poolSize: 10 },
  runs: {},
  drift: [],
  local: [],
  ...extra,
});
const empty = { notes: [], failures: [], warnings: [], issues: [] };

test('the weekly issue body carries its marker, run link, counts and fingerprint', () => {
  const text = body({ ...empty, issues: ['x'] }, context(), run);
  assert.ok(text.startsWith(MARKER));
  assert.match(
    text,
    /0 notes citing changed sources, 0 source refresh failures, 0 link warnings and 1 check failures/,
  );
  assert.match(text, /\[run 42\]\(https:\/\/github\.com\/JFusco\/brain\/actions\/runs\/42\)/);
  assert.match(text, /Fingerprint: abc\./);
  assert.match(text, /## Notes citing changed sources\n\nNone\./);
});

test('link warnings beyond 50 are summarized', () => {
  const warnings = Array.from({ length: 52 }, (_, i) => ({
    source: 's',
    state: 'dead',
    status: 404,
    url: `https://x.test/${i}`,
  }));
  const text = body({ ...empty, warnings }, context(), run);
  assert.equal(text.match(/^- `s`: dead \(HTTP 404\)/gm).length, 50);
  assert.match(text, /- …and 2 more\./);
});

test('drift and runner-blocked lines read correctly', () => {
  assert.equal(
    driftLine({ id: 'a', from: null, to: '0123456789abcdef' }),
    '`a`: new catalog at `0123456789ab`',
  );
  assert.equal(driftLine({ id: 'a', from: 'x', to: null }), '`a`: source no longer registered');
  assert.equal(driftLine({ id: 'a', from: 'same', to: 'same' }), '`a`: catalog metadata changed');
  assert.match(
    localLine(['one']),
    /`one` is refreshed only by the local weekly sync, because its host refuses/,
  );
  assert.match(localLine(['a', 'b']), /`a`, `b` are refreshed only .* their hosts refuse/);
  assert.equal(localLine([]), '');
});

test('previous link state keeps only well-formed records on registered hosts', () => {
  const hosts = new Set(['docs.example.com']);
  const record = (extra = {}) => ({
    url: 'https://docs.example.com/a',
    state: 'healthy',
    ...extra,
  });
  const keep = r => keepLink(sha(r.url), r, hosts);
  assert.equal(keep(record()), true);
  assert.equal(keepLink('wrong-key', record(), hosts), false);
  assert.equal(keep(record({ state: 'mystery' })), false);
  assert.equal(keep(record({ url: 'http://docs.example.com/a' })), false);
  assert.equal(keep(record({ url: 'https://user@docs.example.com/a' })), false);
  assert.equal(keep(record({ url: 'https://evil.example.net/a' })), false);
  assert.equal(keep(record({ finalUrl: 'http://docs.example.com/b' })), false);
  assert.equal(keep(record({ url: 'not a url' })), false);
});

test('release checksums are matched by exact asset name', () => {
  const text = 'aaa  gitleaks_1.0.0_darwin_arm64.tar.gz\nbbb *gitleaks_1.0.0_linux_x64.tar.gz\n';
  assert.equal(checksumFor(text, 'gitleaks_1.0.0_darwin_arm64.tar.gz'), 'aaa');
  assert.equal(checksumFor(text, 'gitleaks_1.0.0_linux_x64.tar.gz'), 'bbb');
  assert.equal(checksumFor(text, 'gitleaks_1.0.0_darwin_x64.tar.gz'), undefined);
});
