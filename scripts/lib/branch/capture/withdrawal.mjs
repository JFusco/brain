import { git, readCommittedNote } from '../visual/snapshot/blobs.mjs';

export function verifyWithdrawal(resultCommit, path, contentSha256, { run = git } = {}) {
  if (!/^[a-f0-9]{40}$/.test(resultCommit)) throw new Error('Unsupported withdrawal lineage');
  let lineage;
  try {
    lineage = run('rev-list', '--parents', '-n', '1', resultCommit).toString().trim();
  } catch (error) {
    throw new Error('Unsupported withdrawal lineage: the merged commit is unavailable', {
      cause: error,
    });
  }
  const [result, parent, ...otherParents] = lineage.split(' ');
  if (result !== resultCommit || !/^[a-f0-9]{40}$/.test(parent) || otherParents.length)
    throw new Error('Unsupported withdrawal lineage: the merged commit must have one local parent');

  const after = readCommittedNote(resultCommit, path, { run });
  const changed = run(
    '--literal-pathspecs',
    'diff',
    '--name-only',
    '--no-renames',
    '-z',
    parent,
    resultCommit,
    '--',
    path,
  )
    .toString()
    .split('\0');
  if (!changed.includes(path))
    throw new Error('Withdrawal path did not change in the merged commit');
  const before = readCommittedNote(parent, path, { run });
  if (before.status !== 'current' || !['retired', 'superseded'].includes(after.status))
    throw new Error('Withdrawal must change an eligible note to retired or superseded');
  if (after.contentSha256 !== contentSha256)
    throw new Error('Withdrawal mapping does not match the merged note');
}
