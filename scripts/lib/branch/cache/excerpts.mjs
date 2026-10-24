import fs from 'node:fs';
import { config } from '../platform/config.mjs';
import { writeJSON, noSymlinks } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { readJSON, parseJSON } from '../../leaf/json.mjs';
import { at, ROOT } from '../../leaf/paths.mjs';

export function storeExcerpt(file, receipt) {
  const index = readJSON(at('.state/lookup-cache.json'), { schemaVersion: 1, files: {} }),
    name = file.slice(at('.state/lookup/').length);
  if (!/^[a-f0-9]{64}\.json$/.test(name)) throw new Error('Invalid managed excerpt-cache path');
  noSymlinks(ROOT, file);
  if (
    fs.existsSync(file) &&
    (!index.files[name] || sha(fs.readFileSync(file)) !== index.files[name].sha256)
  )
    throw new Error('Modified or unmanaged excerpt preserved; refusing replacement');
  writeJSON(file, receipt, 0o600);
  index.files[name] = { sha256: sha(fs.readFileSync(file)), fetchedAt: receipt.fetchedAt };
  writeJSON(at('.state/lookup-cache.json'), index, 0o600);
}

export function readExcerpt(file) {
  if (!fs.existsSync(file)) return null;
  noSymlinks(ROOT, file);
  const name = file.slice(at('.state/lookup/').length),
    record = readJSON(at('.state/lookup-cache.json'), { files: {} }).files[name];
  const bytes = fs.readFileSync(file);
  if (!record || sha(bytes) !== record.sha256)
    throw new Error('Modified or unmanaged excerpt preserved; cache integrity is unconfirmed');
  return parseJSON(bytes);
}

export function cleanExcerptCache({ yes = false } = {}) {
  const index = readJSON(at('.state/lookup-cache.json'), { schemaVersion: 1, files: {} }),
    records = Object.entries(index.files).sort((a, b) =>
      a[1].fetchedAt.localeCompare(b[1].fetchedAt),
    );
  const maxFiles = config().lookup?.maxCacheFiles ?? 1000,
    maxBytes = config().lookup?.maxCacheBytes ?? 8 * 1024 * 1024,
    ttl = (config().lookup?.cacheHours ?? 24) * 3600000;
  if (
    !Number.isInteger(maxFiles) ||
    maxFiles < 1 ||
    !Number.isInteger(maxBytes) ||
    maxBytes < 4096 ||
    records.length > 10000
  )
    throw new Error('Invalid excerpt-cache retention bounds');
  const owned = [];
  let preserved = 0,
    missing = 0;
  for (const [name, record] of records) {
    if (!/^[a-f0-9]{64}\.json$/.test(name)) {
      preserved++;
      continue;
    }
    const file = at('.state/lookup/' + name);
    try {
      noSymlinks(ROOT, file);
    } catch {
      preserved++;
      continue;
    }
    if (!fs.existsSync(file)) {
      missing++;
      if (yes) delete index.files[name];
      continue;
    }
    if (!fs.statSync(file).isFile() || fs.statSync(file).size > 65536) {
      preserved++;
      continue;
    }
    const bytes = fs.readFileSync(file);
    if (sha(bytes) !== record.sha256) {
      preserved++;
      continue;
    }
    let receipt;
    try {
      receipt = parseJSON(bytes);
    } catch {
      preserved++;
      continue;
    }
    if (
      receipt.bodyStored !== false ||
      typeof receipt.excerpt !== 'string' ||
      !Number.isFinite(Date.parse(receipt.fetchedAt)) ||
      receipt.fetchedAt !== record.fetchedAt
    ) {
      preserved++;
      continue;
    }
    owned.push({ name, file, bytes: bytes.length, fetchedAt: receipt.fetchedAt });
  }
  let remaining = owned.length,
    totalBytes = owned.reduce((sum, record) => sum + record.bytes, 0),
    removed = 0,
    freedBytes = 0;
  for (const record of owned) {
    if (
      Date.now() - Date.parse(record.fetchedAt) < ttl &&
      remaining <= maxFiles &&
      totalBytes <= maxBytes
    )
      continue;
    if (yes) {
      fs.rmSync(record.file);
      delete index.files[record.name];
    }
    removed++;
    remaining--;
    totalBytes -= record.bytes;
    freedBytes += record.bytes;
  }
  if (yes) writeJSON(at('.state/lookup-cache.json'), index, 0o600);
  return {
    dryRun: !yes,
    removed,
    freedBytes,
    remaining,
    managedBytes: totalBytes,
    preservedModifiedOrInvalid: preserved,
    missing,
    notice:
      'Only unchanged managed excerpt receipts are eligible. Legacy/unmanaged files, candidates, publication receipts, source objects, and snapshots are preserved.',
  };
}
