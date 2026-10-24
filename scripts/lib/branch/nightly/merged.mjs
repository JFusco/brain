import { spawnSync } from 'node:child_process';
import { safePath } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { ROOT } from '../../leaf/paths.mjs';
import { mergedBrainPR } from '../publication/merged-pr.mjs';
import { verifyApproval } from './receipts.mjs';

function git(...argv) {
  const r = spawnSync('git', argv, { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
  if (r.status !== 0) throw new Error('Required Git evidence is unavailable');
  return r.stdout;
}
export async function verifyMerged(item, attempt) {
  const pr = await mergedBrainPR(item.number);
  if (attempt.protocolVersion === 2) verifyApproval(attempt.id, item, pr);
  if (pr.head.sha !== item.headSha || !Array.isArray(item.files) || !item.files.length)
    throw new Error('Review must identify the exact PR head and every changed file');
  git('merge-base', '--is-ancestor', pr.merge_commit_sha, 'origin/main');
  const paths = git(
    'diff',
    '--name-only',
    '--no-renames',
    `${pr.merge_commit_sha}^`,
    pr.merge_commit_sha,
  )
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean)
    .sort();
  if (JSON.stringify(paths) !== JSON.stringify(item.files.map(f => f.path).sort()))
    throw new Error('Reviewed files do not cover the merged change');
  for (const f of item.files) {
    safePath(f.path);
    if (
      !/^(knowledge\/|official\/catalogs\/|official\/sources.lock.json$|wiki\/|scripts\/wiki\/graph\/data\/)/.test(
        f.path,
      )
    )
      throw new Error('Nightly publication contains a path outside routine maintenance');
    if (f.sha256 === null) {
      const exists = spawnSync('git', ['cat-file', '-e', `${pr.merge_commit_sha}:${f.path}`], {
        cwd: ROOT,
        stdio: 'ignore',
      });
      if (exists.status !== 1 && exists.status !== 128)
        throw new Error('Reviewed deletion differs from the merged content');
    } else if (
      !/^[a-f0-9]{64}$/.test(f.sha256 || '') ||
      sha(git('show', `${pr.merge_commit_sha}:${f.path}`)) !== f.sha256
    )
      throw new Error('Reviewed bytes differ from the merged content');
  }
  return {
    number: item.number,
    headSha: item.headSha,
    mergeCommit: pr.merge_commit_sha,
    files: item.files,
  };
}
