import { snapshot } from '../visual/snapshot/snapshot.mjs';
import {
  committedBlobs,
  decodeNote,
  NOTE_BYTE_LIMIT,
  readCommittedNote,
} from '../visual/snapshot/blobs.mjs';
import { sha } from '../../leaf/hash.mjs';
import { projectContext } from '../project/context.mjs';
import { compareCurrentNote } from './current-status.mjs';

export function publishedSnapshot(revision, load = snapshot) {
  if (revision !== undefined && !/^[a-f0-9]{40}$/.test(revision))
    throw new Error('Invalid committed snapshot');
  return load(revision);
}
export function publishedRead(
  revision,
  path,
  {
    load = snapshot,
    blobs = committedBlobs,
    read = readCommittedNote,
    compare = compareCurrentNote,
    includeWithdrawn = false,
    currentStatus = false,
    versions,
  } = {},
) {
  if (!revision || typeof path !== 'string' || path.length > 500)
    throw new Error('Snapshot and published path are required');
  if (versions !== undefined && !currentStatus)
    throw new Error('--versions requires --current-status');
  if (versions !== undefined && (typeof versions !== 'string' || versions.length > 2000))
    throw new Error('Version context must be at most 2,000 characters');
  const context = versions === undefined ? undefined : projectContext(undefined, { versions });
  const graph = publishedSnapshot(revision, load);
  const note = graph.entries.find(n => n.kind === 'curated-note' && n.path === path);
  const response = {
    version: 1,
    snapshot: graph.revision,
    path,
  };
  if (note) {
    const bytes = blobs(revision).get(path);
    if (!bytes || sha(bytes) !== note.sha256) throw new Error('Committed note hash mismatch');
    if (bytes.length > NOTE_BYTE_LIMIT) throw new Error('Published note exceeds 256 KiB');
    Object.assign(response, { contentSha256: note.sha256, text: decodeNote(bytes) });
  } else {
    const withdrawn = includeWithdrawn && read(revision, path);
    if (withdrawn?.state !== 'valid' || withdrawn.status === 'current')
      throw new Error('Published note is unavailable at this snapshot');
    Object.assign(response, {
      contentSha256: withdrawn.contentSha256,
      text: withdrawn.text,
      statusAtSnapshot: withdrawn.status,
      eligible: false,
    });
  }
  if (currentStatus) response.currentStatus = compare(response, context);
  return response;
}
