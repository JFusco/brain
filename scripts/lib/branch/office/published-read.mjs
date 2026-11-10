import { snapshot } from '../visual/snapshot/snapshot.mjs';
import { committedBlobs } from '../visual/snapshot/blobs.mjs';
import { sha } from '../../leaf/hash.mjs';
export function publishedSnapshot(revision, load = snapshot) {
  if (revision !== undefined && !/^[a-f0-9]{40}$/.test(revision))
    throw new Error('Invalid committed snapshot');
  return load(revision);
}
export function publishedRead(revision, path, { load = snapshot, blobs = committedBlobs } = {}) {
  if (!revision || typeof path !== 'string' || path.length > 500)
    throw new Error('Snapshot and published path are required');
  const graph = publishedSnapshot(revision, load);
  const note = graph.entries.find(n => n.kind === 'curated-note' && n.path === path);
  if (!note) throw new Error('Published note is unavailable at this snapshot');
  const bytes = blobs(revision).get(path);
  if (!bytes || sha(bytes) !== note.sha256) throw new Error('Committed note hash mismatch');
  if (bytes.length > 256 * 1024) throw new Error('Published note exceeds 256 KiB');
  return {
    version: 1,
    snapshot: graph.revision,
    path,
    contentSha256: sha(bytes),
    text: new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes),
  };
}
