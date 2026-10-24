import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { readJSON } from '../../leaf/json.mjs';
import { ROOT } from '../../leaf/paths.mjs';
import { branchFile } from '../../branch/nightly/paths.mjs';
import { approved } from '../../branch/nightly/receipts.mjs';

export function validatePush(input) {
  const cwd = fs.realpathSync(ROOT),
    branch = spawnSync('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], {
      cwd: ROOT,
      encoding: 'utf8',
    }).stdout?.trim(),
    current = branch ? readJSON(branchFile(branch), null) : null;
  for (const line of input.trim().split('\n').filter(Boolean)) {
    const [localRef, head, remoteRef] = line.split(/\s+/);
    if (/^0+$/.test(head)) continue; // Deleting a merged branch is cleanup, not publication.
    const entry = readJSON(branchFile(localRef.replace(/^refs\/heads\//, '')), null);
    if (!entry) {
      if (current?.worktree === cwd)
        throw new Error('A nightly checkout may push only its registered branch');
      continue;
    }
    if (remoteRef !== `refs/heads/${entry.branch}`)
      throw new Error('A nightly branch must publish to its registered remote branch');
    approved(entry.worktree, entry.runId, head);
  }
}
