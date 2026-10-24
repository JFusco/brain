import fs from 'node:fs';
import { log } from '../../branch/platform/log.mjs';
import { writeJSON, atomic } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';
import { now } from '../../leaf/time.mjs';
import { assertClean } from '../../privacy.mjs';
import { indexLimit } from '../../branch/official/documentation/limits.mjs';
import {
  registry,
  lock,
  catalogPath,
  catalogBytes,
  writeLock,
  runnerBlocked,
} from '../../branch/official/registry.mjs';
import { fetchCatalog } from '../../branch/official/fetch.mjs';
import { generateHubs } from './generate-hubs.mjs';

export async function sync({ ids = null, hosted = false } = {}) {
  const reg = registry(),
    specs = reg.sources.filter(s => !ids || ids.includes(s.id));
  if (ids?.some(id => !specs.some(s => s.id === id))) throw new Error('Unknown official source ID');
  const current = lock(),
    state = readJSON(at('.state/official-runs.json'));
  const changed = [],
    failed = [],
    unchanged = [],
    crawls = [],
    skipped = hosted ? specs.filter(s => runnerBlocked(s, reg)).map(s => s.id) : [];
  for (const spec of specs) {
    if (skipped.includes(spec.id)) continue;
    const previous = current.sources[spec.id],
      run = state[spec.id] || {},
      track = spec.track || 'rolling-url';
    let crawl;
    try {
      if (spec.kind === 'collection')
        crawl = { id: spec.id, indexesFetched: 0, maxIndexes: indexLimit(spec) };
      const doc = await fetchCatalog(spec, { onIndex: counts => Object.assign(crawl, counts) }),
        bytes = catalogBytes(doc);
      if (bytes.length > 1024 * 1024)
        throw new Error('Catalog exceeds 1 MiB; narrow the source before committing it');
      assertClean([{ id: catalogPath(spec.id), bytes }], { clients: false });
      const digest = sha(bytes);
      if (previous?.catalogSha256 === digest && previous.track === track) unchanged.push(spec.id);
      else {
        atomic(at(catalogPath(spec.id)), bytes);
        current.sources[spec.id] = {
          revision: doc.revision,
          fetchedAt: previous?.catalogSha256 === digest ? previous.fetchedAt : now(),
          track,
          catalogSha256: digest,
        };
        changed.push({ id: spec.id, from: previous?.revision || null, to: doc.revision });
        writeLock(reg, current);
      }
      state[spec.id] = {
        lastAttempt: now(),
        lastSuccess: now(),
        failures: 0,
        ...(crawl ? { crawl } : {}),
      };
      log('official-source', {
        id: spec.id,
        status: changed.some(c => c.id === spec.id) ? 'changed' : 'unchanged',
        ...(crawl ? { crawl } : {}),
      });
    } catch (error) {
      // A failed source keeps its last good catalog.
      const failures = (run.failures || 0) + 1;
      state[spec.id] = {
        ...run,
        lastAttempt: now(),
        failures,
        nextAttemptAt: new Date(
          Date.now() + Math.min(24, 2 ** Math.min(failures, 4)) * 3600000,
        ).toISOString(),
        error: error.message,
        ...(crawl ? { crawl } : {}),
      };
      delete state[spec.id].policySha256;
      failed.push({ id: spec.id, error: error.message });
      log('official-source', {
        id: spec.id,
        status: 'failed',
        reason: error.message,
        ...(crawl ? { crawl } : {}),
      });
    }
    if (crawl)
      crawls.push({ ...crawl, status: failed.some(f => f.id === spec.id) ? 'failed' : 'success' });
    writeJSON(at('.state/official-runs.json'), state, 0o600);
  }
  if (!ids)
    for (const id of Object.keys(current.sources))
      if (!reg.sources.some(s => s.id === id)) {
        changed.push({ id, from: current.sources[id].revision, to: null });
        delete current.sources[id];
        fs.rmSync(at(catalogPath(id)), { force: true });
        writeLock(reg, current);
      }
  generateHubs();
  return { changed, unchanged, failed, skipped, crawls };
}
