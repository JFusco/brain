import fs from 'node:fs';
import { writeJSON } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { json } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';
import { registry } from '../official/registry.mjs';
import { assertClean } from '../privacy/scanner.mjs';

const maxBytes = 32 * 1024 * 1024;
export const STATES = [
  'healthy',
  'redirected',
  'dead',
  'suspected-dead',
  'restricted',
  'rate-limited',
  'transient-error',
  'unavailable',
  'blocked-redirect',
  'redirect-loop',
  'invalid-redirect',
];
function officialHosts() {
  const hosts = new Set(['github.com', 'raw.githubusercontent.com']),
    add = value => {
      try {
        hosts.add(new URL(value).hostname);
      } catch {
        /* not a URL: no host to allow */
      }
    };
  for (const s of registry().sources) {
    for (const h of s.allowedHosts || []) hosts.add(h);
    add(s.documentationBase);
    add(s.url);
    add(s.indexUrl);
  }
  for (const p of registry().pointers) add(p.url);
  return hosts;
}
function bounded(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > maxBytes)
    throw new Error('Invalid previous weekly artifact');
  assertClean([{ id: 'previous-weekly-state', bytes: fs.readFileSync(file) }], { clients: false });
  return json(file);
}

// A link record survives only with its own key, a known state and HTTPS URLs on registered hosts.
export function keepLink(key, record, hosts) {
  try {
    const url = new URL(record.url),
      final = new URL(record.finalUrl || record.url);
    return (
      sha(record.url) === key &&
      STATES.includes(record.state) &&
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      hosts.has(url.hostname) &&
      final.protocol === 'https:' &&
      !final.username &&
      !final.password
    );
  } catch {
    return false; // Malformed URL: drop the entry.
  }
}

// The previous run's observations carry the two-strike 404 rule, backoff and rotation between weekly runs.
export function restorePrevious() {
  const links = at('.state/previous/link-health.json'),
    runs = at('.state/previous/official-runs.json');
  if (fs.existsSync(links)) {
    const saved = bounded(links),
      hosts = officialHosts();
    if (!saved.links || typeof saved.links !== 'object' || Object.keys(saved.links).length > 10000)
      throw new Error('Invalid previous link state');
    for (const [key, record] of Object.entries(saved.links))
      if (!keepLink(key, record, hosts)) delete saved.links[key];
    writeJSON(at('.state/link-health.json'), saved, 0o600);
  }
  if (fs.existsSync(runs)) {
    const saved = bounded(runs),
      kept = {};
    for (const spec of registry().sources) {
      const run = saved[spec.id];
      if (!run || typeof run !== 'object') continue;
      kept[spec.id] = {};
      for (const key of ['lastAttempt', 'lastSuccess', 'failures', 'nextAttemptAt', 'error'])
        if (Object.hasOwn(run, key)) kept[spec.id][key] = run[key];
    }
    writeJSON(at('.state/official-runs.json'), kept, 0o600);
  }
}
