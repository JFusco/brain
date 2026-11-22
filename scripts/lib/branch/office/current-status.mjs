import { compareCorrections } from '../../leaf/correction-section.mjs';
import { list, scalar } from '../../leaf/frontmatter.mjs';
import { parseJSON } from '../../leaf/json.mjs';
import { guidanceState } from '../guidance/freshness.mjs';
import { versionFit } from '../project/versions.mjs';
import { committedBlobs, mainRevision, readCommittedNote } from '../visual/snapshot/blobs.mjs';

const MAX_REPLACEMENTS = 8;

export function compareCurrentNote(
  historical,
  context,
  { main = mainRevision, load = committedBlobs, read = readCommittedNote } = {},
) {
  const result = {
    mainRevision: null,
    outcome: 'unavailable',
    statusAtPath: null,
    bytesChanged: null,
    target: null,
    correctionsChanged: null,
    corrections: null,
  };
  try {
    result.mainRevision = main();
    const blobs = load(result.mainRevision);
    const readNote = path => read(result.mainRevision, path, { blobs });
    let note = readNote(historical.path);
    if (note.state === 'missing') return { ...result, outcome: 'deleted' };
    if (note.state === 'invalid') return { ...result, outcome: 'invalid' };
    result.statusAtPath = note.status;
    result.bytesChanged = note.contentSha256 !== historical.contentSha256;
    Object.assign(result, compareCorrections(historical.text, note.text));

    const visited = new Set([note.path]);
    while (note.status === 'superseded') {
      const next = scalar(note.raw, 'superseded_by');
      if (visited.has(next)) return { ...result, outcome: 'cycle' };
      if (visited.size > MAX_REPLACEMENTS) return { ...result, outcome: 'depth-exceeded' };
      visited.add(next);
      note = readNote(next);
      if (note.state === 'missing') return { ...result, outcome: 'missing-replacement' };
      if (note.state === 'invalid') return { ...result, outcome: 'invalid' };
    }
    if (note.status === 'retired') return { ...result, outcome: 'retired' };
    const lock = parseJSON(blobs.get('official/sources.lock.json')?.toString() || 'null');
    if (!lock?.sources) return result;
    return {
      ...result,
      outcome: visited.size > 1 ? 'superseded' : result.bytesChanged ? 'updated' : 'unchanged',
      target: {
        path: note.path,
        contentSha256: note.contentSha256,
        applicability: scalar(note.raw, 'applicability'),
        freshness: guidanceState(note.raw, lock),
        ...(context ? { versionFit: versionFit(list(note.raw, 'versions'), context) } : {}),
      },
    };
  } catch {
    // An unavailable comparison does not invalidate an already verified historical read.
    return result;
  }
}
