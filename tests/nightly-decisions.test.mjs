import assert from 'node:assert/strict';
import test from 'node:test';
import { claimRefusal } from '../scripts/lib/branch/nightly/ledger.mjs';
import { validateReport } from '../scripts/lib/branch/nightly/report.mjs';
import { validateReview } from '../scripts/lib/branch/nightly/review.mjs';
import { dueDate } from '../scripts/lib/branch/nightly/schedule.mjs';

test('work becomes due at 03:15 New York time, across both daylight-saving changes', () => {
  // EDT (UTC-4): 03:14 belongs to the previous date, 03:15 to the current one.
  assert.equal(dueDate(new Date('2026-07-10T07:14:00Z')), '2026-07-09');
  assert.equal(dueDate(new Date('2026-07-10T07:15:00Z')), '2026-07-10');
  // EST (UTC-5).
  assert.equal(dueDate(new Date('2026-01-10T08:14:00Z')), '2026-01-09');
  assert.equal(dueDate(new Date('2026-01-10T08:15:00Z')), '2026-01-10');
  // Spring forward (2026-03-08) and fall back (2026-11-01) days.
  assert.equal(dueDate(new Date('2026-03-08T07:14:00Z')), '2026-03-07');
  assert.equal(dueDate(new Date('2026-03-08T07:15:00Z')), '2026-03-08');
  assert.equal(dueDate(new Date('2026-11-01T08:14:00Z')), '2026-10-31');
  assert.equal(dueDate(new Date('2026-11-01T08:15:00Z')), '2026-11-01');
});

const day = '2026-10-23';
const ledger = (extra = {}) => ({ completed: {}, attempts: {}, ...extra });

test('claims are refused while a run is active, after completion, at the retry limit and during backoff', () => {
  const active = { id: 'run' };
  assert.equal(
    claimRefusal({ ...ledger(), active }, ledger(), day).reason,
    'active-run-needs-reconciliation',
  );
  const done = ledger({ completed: { [day]: {} } });
  assert.equal(claimRefusal(done, done, day).reason, 'completed');
  assert.equal(
    claimRefusal(done, ledger(), day, { rerun: true }),
    null,
    'a rerun ignores the daily completion',
  );
  const spent = ledger({ attempts: { [day]: 3 } });
  assert.equal(claimRefusal(spent, spent, day).reason, 'daily-retry-limit');
  assert.equal(claimRefusal(ledger(), spent, day, { rerun: true }).reason, 'manual-retry-limit');
  const waiting = ledger({ retryAfter: '2026-10-23T12:00:00Z' });
  assert.equal(
    claimRefusal(waiting, waiting, day, { now: Date.parse('2026-10-23T11:59:00Z') }).reason,
    'backoff',
  );
  assert.equal(
    claimRefusal(waiting, waiting, day, { now: Date.parse('2026-10-23T12:01:00Z') }),
    null,
  );
  assert.equal(
    claimRefusal(ledger({ attempts: { [day]: 2 } }), ledger({ attempts: { [day]: 2 } }), day),
    null,
  );
});

const stage = outcome => ({ outcome, summary: 'actual evidence' });
const report = (extra = {}) => ({
  runId: 'run',
  outcome: 'unchanged',
  prs: [],
  stages: {
    refresh: stage('completed'),
    links: stage('unnecessary'),
    curation: stage('completed'),
    review: stage('completed'),
    verification: stage('completed'),
  },
  ...extra,
});
const attempt = { id: 'run', protocolVersion: 2 };

test('run reports need actual evidence for every stage and a consistent outcome', () => {
  assert.doesNotThrow(() => validateReport(report(), attempt));
  assert.throws(() => validateReport(report({ runId: 'other' }), attempt), /actual run report/);
  const skipped = report();
  skipped.stages.review = stage('unnecessary');
  assert.throws(() => validateReport(skipped, attempt), /cannot be skipped/);
  const empty = report();
  empty.stages.links = { outcome: 'completed', summary: '  ' };
  assert.throws(() => validateReport(empty, attempt), /Missing actual links evidence/);
  assert.throws(
    () => validateReport(report({ prs: [{}] }), attempt),
    /differs from the recorded PRs/,
  );
  assert.throws(
    () => validateReport(report({ outcome: 'published' }), attempt),
    /differs from the recorded PRs/,
  );
  assert.throws(
    () => validateReport(report(), { id: 'run', protocolVersion: 1 }),
    /local checks did not pass/,
  );
});

const entry = { runId: 'run', baseSha: 'base', createdAt: '2000-01-01T00:00:00Z' };
const note = (extra = {}) => ({
  path: 'knowledge/react/a.md',
  verdict: 'approved',
  evidenceKind: 'official',
  evidence: 'e',
  applicability: 'a',
  overlap: 'o',
  privacy: 'p',
  sources: ['https://react.dev/reference'],
  ...extra,
});
const review = (extra = {}) => ({
  runId: 'run',
  headSha: 'head',
  baseSha: 'base',
  authorId: 'author',
  verdict: 'approved',
  summary: 'checked',
  reviewerId: 'reviewer',
  role: 'content-reviewer',
  reviewedAt: new Date().toISOString(),
  notes: [note()],
  ...extra,
});
const check =
  (r, notes = ['knowledge/react/a.md']) =>
  () =>
    validateReview(r, entry, 'head', notes, 'author');

test('knowledge changes need a fresh, separate content review of the exact head', () => {
  assert.doesNotThrow(check(review()));
  assert.throws(check(review({ headSha: 'other' })), /fresh approved review/);
  assert.throws(check(review({ reviewedAt: '2001-01-01T00:00:00Z' })), /fresh approved review/);
  assert.throws(check(review({ reviewerId: 'author' })), /separate content reviewer/);
  assert.throws(check(review({ role: 'author' })), /separate content reviewer/);
  assert.throws(check(review({ notes: [] })), /every changed knowledge note/);
  assert.throws(check(review({ notes: [note({ sources: [] })] })), /checked official sources/);
  assert.throws(
    check(review({ notes: [note({ sources: ['http://x.test/'] })] })),
    /sanitized HTTPS/,
  );
});

test('catalog-only changes may be reviewed by the run author', () => {
  const own = review({ role: 'author', reviewerId: 'author', notes: [] });
  assert.doesNotThrow(check(own, []));
  assert.throws(check(review({ role: 'author', notes: [] }), []), /actual run author/);
  assert.throws(check(review({ role: 'bystander', notes: [] }), []), /actual review role/);
});
