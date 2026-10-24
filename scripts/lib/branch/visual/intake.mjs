import { at } from '../../leaf/paths.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { snapshot } from './snapshot/snapshot.mjs';

export function pendingIntake() {
  const index = readJSON(at('.state/harvest.json'), { candidates: {} }),
    domains = {},
    knownDomains = new Set(snapshot().domains);
  for (const candidate of Object.values(index.candidates || {})) {
    if (candidate.class !== 'capture' || candidate.status !== 'pending' || candidate.disposition)
      continue;
    const domain = knownDomains.has(candidate.domain) ? candidate.domain : '_unsorted';
    domains[domain] = (domains[domain] || 0) + 1;
  }
  return {
    pending: Object.values(domains).reduce((sum, count) => sum + count, 0),
    domains,
    notice:
      'Private pending capture counts only; not published knowledge. No capture bodies, titles or source paths are exposed.',
  };
}
