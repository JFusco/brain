import assert from 'node:assert/strict';
import test from 'node:test';
import { classify, retryDelay } from '../scripts/lib/branch/links/classify.mjs';
import { dueBuckets, roundRobin } from '../scripts/lib/branch/links/schedule.mjs';
import { sha } from '../scripts/lib/leaf/hash.mjs';
import { DAY, HOUR } from '../scripts/lib/leaf/time.mjs';

const state = (observed = {}) => ({
  links: Object.fromEntries(Object.entries(observed).map(([url, record]) => [sha(url), record])),
});
const pool = (...items) =>
  new Map(items.map(([url, source, priority = 0]) => [url, { url, source, priority }]));
const NOW = Date.parse('2026-10-24T12:00:00Z');
const ago = ms => new Date(NOW - ms).toISOString();

test('only due links are scheduled: failures after their backoff, healthy and 404s daily', () => {
  const all = pool(
    ['https://a.test/new', 's'],
    ['https://a.test/fresh', 's'],
    ['https://a.test/stale', 's'],
    ['https://a.test/flaky', 's'],
    ['https://a.test/waiting', 's'],
    ['https://a.test/missing', 's'],
  );
  const s = state({
    'https://a.test/fresh': { state: 'healthy', checkedAt: ago(HOUR) },
    'https://a.test/stale': { state: 'healthy', checkedAt: ago(2 * DAY) },
    'https://a.test/flaky': { state: 'transient-error', checkedAt: ago(2 * HOUR), retryAt: ago(1) },
    'https://a.test/waiting': { state: 'rate-limited', checkedAt: ago(HOUR), retryAt: ago(-HOUR) },
    'https://a.test/missing': {
      state: 'suspected-dead',
      status: 404,
      checkedAt: ago(2 * HOUR),
      retryAt: ago(1),
    },
  });
  const due = dueBuckets(all, s, { now: NOW })
    .get('s')
    .map(item => item.url);
  assert.deepEqual(due, ['https://a.test/flaky', 'https://a.test/new', 'https://a.test/stale']);
  const retries = dueBuckets(all, s, { now: NOW, retryFailures: true })
    .get('s')
    .map(item => item.url);
  assert.deepEqual(retries, ['https://a.test/flaky']);
});

test('due failures come first, then cited links, then the oldest check', () => {
  const all = pool(
    ['https://a.test/plain', 's'],
    ['https://a.test/cited', 's', 2],
    ['https://a.test/old', 's'],
    ['https://a.test/failed', 's'],
  );
  const s = state({
    'https://a.test/old': { state: 'healthy', checkedAt: ago(3 * DAY) },
    'https://a.test/plain': { state: 'healthy', checkedAt: ago(2 * DAY) },
    'https://a.test/failed': { state: 'unavailable', checkedAt: ago(DAY), retryAt: ago(1) },
  });
  assert.deepEqual(
    dueBuckets(all, s, { now: NOW })
      .get('s')
      .map(item => item.url),
    ['https://a.test/failed', 'https://a.test/cited', 'https://a.test/old', 'https://a.test/plain'],
  );
});

test('round-robin takes one link per source in turn from the saved cursor', () => {
  const buckets = new Map([
    ['a', ['a1', 'a2', 'a3']],
    ['b', ['b1']],
    ['c', ['c1', 'c2']],
  ]);
  assert.deepEqual(roundRobin(buckets, 5, 1), {
    selected: ['b1', 'c1', 'a1', 'c2', 'a2'],
    cursor: 1,
  });
  assert.deepEqual(roundRobin(new Map([['a', []]]), 3, 0), { selected: [], cursor: 0 });
});

test('probe results classify into health states; repeated 404s and 410s are dead', () => {
  const kind = (observed, previous = {}) =>
    classify({ redirects: [], ...observed }, previous).classification;
  assert.equal(kind({ status: 200 }), 'healthy');
  assert.equal(kind({ status: 200, redirects: ['https://a.test/x'] }), 'redirected');
  assert.equal(kind({ status: 404 }), 'suspected-dead');
  assert.equal(kind({ status: 404 }, { status: 404 }), 'dead');
  assert.equal(kind({ status: 410 }), 'dead');
  assert.equal(kind({ status: 403 }), 'restricted');
  assert.equal(kind({ status: 429 }), 'rate-limited');
  assert.equal(kind({ status: 503 }), 'transient-error');
  assert.equal(kind({ status: 302 }), 'unavailable');
  assert.equal(kind({ state: 'transient-error', status: null }), 'transient-error');
  assert.equal(
    classify({ status: 404, redirects: [] }, { status: 404, notFoundStreak: 2 }).streak,
    3,
  );
});

test('retry delays honor Retry-After within one hour and one day', () => {
  assert.equal(retryDelay({}, NOW), HOUR);
  assert.equal(retryDelay({ retryAfter: '7200' }, NOW), 2 * HOUR);
  assert.equal(retryDelay({ retryAfter: '5' }, NOW), HOUR);
  assert.equal(retryDelay({ retryAfter: String(3 * 24 * 3600) }, NOW), DAY);
  assert.equal(retryDelay({ retryAfter: new Date(NOW + 3 * HOUR).toUTCString() }, NOW), 3 * HOUR);
  assert.equal(retryDelay({ retryAfter: new Date(NOW - HOUR).toUTCString() }, NOW), HOUR);
  assert.equal(retryDelay({ retryAfter: 'soon' }, NOW), HOUR);
});
