import { config } from '../../branch/platform/config.mjs';
import { writeJSON } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';
import { now } from '../../leaf/time.mjs';
import { classify, retryDelay } from '../../branch/links/classify.mjs';
import { linkPool } from '../../branch/links/pool.mjs';
import { dueBuckets, roundRobin } from '../../branch/links/schedule.mjs';
import { registry } from '../../branch/official/registry.mjs';
import { probe } from '../../branch/platform/network/probe.mjs';

const CONCURRENCY = 3;

export async function checkLinks({
  limit = config().maintenance?.linkLimit ?? 24,
  source,
  retryFailures = false,
  skipHosts = [],
} = {}) {
  limit = Number(limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100)
    throw new Error('Link limit must be between 1 and 100');
  const registered = registry(),
    specs = registered.sources;
  if (
    source &&
    !specs.some(spec => spec.id === source) &&
    !(source === 'website-pointers' && registered.pointers.length)
  )
    throw new Error('Unknown registered link source');
  const all = linkPool(specs, { skipHosts });
  const state = readJSON(at('.state/link-health.json'), { schemaVersion: 1, links: {} });
  for (const record of Object.values(state.links)) record.active = all.has(record.url);
  const buckets = dueBuckets(all, state, { source, retryFailures });
  const { selected, cursor } = roundRobin(buckets, limit, state.cursor || 0);
  const prior = selected.map(item => state.links[sha(item.url)]).filter(Boolean);
  if (prior.length) {
    const archivedAt = now();
    writeJSON(
      at(
        `.state/link-health-history/${archivedAt.replace(/[:.]/g, '-')}-${sha(JSON.stringify(prior)).slice(0, 12)}.json`,
      ),
      { archivedAt, observations: prior },
      0o600,
    );
  }
  const results = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, selected.length) }, async () => {
      while (next < selected.length) {
        const item = selected[next++],
          key = sha(item.url),
          previous = state.links[key] || {};
        let observed;
        try {
          observed = await probe(item.url, { hosts: item.hosts });
        } catch {
          observed = { state: 'transient-error', status: null, finalUrl: item.url, redirects: [] };
        }
        const { streak, classification } = classify(observed, previous);
        const retryMs = retryDelay(observed);
        const record = {
          url: item.url,
          source: item.source,
          active: true,
          checkedAt: now(),
          status: observed.status,
          ...(observed.method ? { method: observed.method } : {}),
          ...(observed.headStatus ? { headStatus: observed.headStatus } : {}),
          state: classification,
          finalUrl: observed.finalUrl,
          redirects: observed.redirects,
          notFoundStreak: streak,
          ...(classification === 'healthy' || classification === 'redirected'
            ? { lastHealthyAt: now() }
            : { lastHealthyAt: previous.lastHealthyAt || null }),
          retryAt: new Date(Date.now() + retryMs).toISOString(),
        };
        state.links[key] = record;
        results.push(record);
      }
    }),
  );
  const problems = results.filter(record => !['healthy', 'redirected'].includes(record.state));
  state.lastRun = now();
  state.cursor = cursor;
  state.poolSize = all.size;
  state.lastBatch = { checked: results.length, problems: problems.length };
  if (results.length && !problems.length) state.lastSuccess = now();
  writeJSON(at('.state/link-health.json'), state, 0o600);
  return {
    checked: results.length,
    retryFailures,
    archivedPrevious: prior.length,
    poolSize: all.size,
    observed: Object.keys(state.links).length,
    completeCoverage: [...all.keys()].every(url => state.links[sha(url)]),
    problems: problems.map(({ source, state, status, url, finalUrl }) => ({
      source,
      state,
      status,
      url,
      finalUrl,
    })),
    results,
    notice:
      'Bounded sampling or due failure retries; healthy and 404/410 observations remain daily. Previous observations are preserved before rechecking. Access/rate limits remain separate; redirects never rewrite the registry. No page bodies are stored.',
  };
}
