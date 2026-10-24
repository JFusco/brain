import { sha } from '../../leaf/hash.mjs';
import { DAY } from '../../leaf/time.mjs';

const HEALTHY = ['healthy', 'redirected'];

// Due links grouped by source: due failures first, then priority, then the oldest check.
// Healthy samples and 404/410 observations stay daily; other failures follow their own backoff.
export function dueBuckets(all, state, { source, retryFailures = false, now = Date.now() } = {}) {
  const buckets = new Map(),
    cutoff = now - DAY;
  for (const item of all.values()) {
    if (source && item.source !== source) continue;
    const previous = state.links[sha(item.url)],
      failed = !!previous && !HEALTHY.includes(previous.state);
    if (retryFailures && !failed) continue;
    if (previous) {
      if (Date.parse(previous.retryAt) > now) continue;
      if (
        (!failed || [404, 410].includes(previous.status)) &&
        Date.parse(previous.checkedAt) > cutoff
      )
        continue;
    }
    item.retryDue = failed;
    if (!buckets.has(item.source)) buckets.set(item.source, []);
    buckets.get(item.source).push(item);
  }
  for (const bucket of buckets.values())
    bucket.sort(
      (a, b) =>
        Number(b.retryDue) - Number(a.retryDue) ||
        b.priority - a.priority ||
        (state.links[sha(a.url)]?.checkedAt || '').localeCompare(
          state.links[sha(b.url)]?.checkedAt || '',
        ) ||
        sha(a.url).localeCompare(sha(b.url)),
    );
  return buckets;
}

// Takes one link per source in turn from a persisted cursor, so no source starves.
export function roundRobin(buckets, limit, cursor = 0) {
  const names = [...buckets.keys()].sort(),
    selected = [];
  while (names.length && selected.length < limit) {
    let found = false;
    for (let index = 0; index < names.length; index++) {
      const position = (cursor + index) % names.length,
        bucket = buckets.get(names[position]);
      if (!bucket.length) continue;
      selected.push(bucket.shift());
      cursor = (position + 1) % names.length;
      found = true;
      break;
    }
    if (!found) break;
  }
  return { selected, cursor };
}
