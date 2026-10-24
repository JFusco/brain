import fs from 'node:fs';
import { writeJSON, noSymlinks } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { json, readJSON, parseJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';
import { httpsURL } from '../../leaf/url.mjs';

// official/ holds the registry, a slim lock and generated link catalogs; page bodies are fetched on demand.
export const registry = () => json(at('official/sources.json'));
export const lock = () =>
  readJSON(at('official/sources.lock.json'), { schemaVersion: 2, sources: {}, toolchain: {} });
export const SOURCE_ID = /^[a-z0-9][a-z0-9-]*$/;
export function catalogPath(id) {
  if (!SOURCE_ID.test(id)) throw new Error('Invalid source ID');
  return `official/catalogs/${id}.json`;
}
export const catalogBytes = doc => Buffer.from(JSON.stringify(doc, null, 2) + '\n');
export function readCatalog(id, entry = lock().sources[id]) {
  const file = at(catalogPath(id));
  noSymlinks(at('official'), file);
  const bytes = fs.readFileSync(file);
  if (!entry || sha(bytes) !== entry.catalogSha256)
    throw new Error(`Catalog differs from its lock entry: ${id}`);
  const doc = parseJSON(bytes);
  if (doc.source !== id || doc.revision !== entry.revision)
    throw new Error(`Invalid official catalog: ${id}`);
  return doc;
}
export const catalogHosts = spec => [
  ...(spec.kind === 'repository' ? ['github.com', 'raw.githubusercontent.com'] : []),
  ...(httpsURL(spec.documentationBase) ? [httpsURL(spec.documentationBase).hostname] : []),
  ...(spec.allowedHosts || []),
];
export function writeLock(reg, current) {
  const sources = {};
  for (const spec of reg.sources)
    if (current.sources[spec.id]) sources[spec.id] = current.sources[spec.id];
  for (const [id, entry] of Object.entries(current.sources)) sources[id] ??= entry;
  writeJSON(at('official/sources.lock.json'), {
    schemaVersion: 2,
    sources,
    toolchain: current.toolchain || {},
  });
}
// Hosted runs skip sources on hosts that refuse GitHub-hosted runners; a local sync refreshes them.
export const runnerBlocked = (spec, reg = registry()) =>
  catalogHosts(spec).some(host => (reg.runnerBlockedHosts || []).includes(host));
