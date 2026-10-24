import fs from 'node:fs';
import path from 'node:path';
import { writeJSON, noSymlinks } from '../../leaf/fs-safe.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { ROOT, at } from '../../leaf/paths.mjs';
import { now } from '../../leaf/time.mjs';
import { git } from '../../branch/platform/git.mjs';
import { gh, repository } from '../../branch/platform/github-cli.mjs';
import { privateFile, branchFile } from '../../branch/nightly/paths.mjs';
import { activeRun, primary } from '../../branch/nightly/run.mjs';

export function checkout({ runId, issue, slug, kind }) {
  primary();
  activeRun(runId);
  if (
    !/^[1-9]\d*$/.test(issue || '') ||
    !/^[a-z][a-z0-9-]{0,48}$/.test(slug || '') ||
    !['catalog', 'knowledge'].includes(kind)
  )
    throw new Error('Provide an issue, short slug and catalog|knowledge kind');
  const saved = JSON.parse(
    gh('issue', 'view', issue, '--repo', repository(), '--json', 'number,state,url'),
  );
  if (saved.state !== 'OPEN' || saved.number !== Number(issue))
    throw new Error('The saved open issue must be verified before checkout');
  const branch = `codex/${issue}-${slug}`,
    file = branchFile(branch),
    existing = readJSON(file, null);
  if (existing) {
    if (existing.runId !== runId) throw new Error('Branch belongs to another run');
    return {
      ...existing,
      notice: 'Reconcile the existing registered checkout; do not recreate it',
    };
  }
  git(ROOT, 'fetch', 'origin', 'main');
  const baseSha = git(ROOT, 'rev-parse', 'origin/main').toString().trim(),
    worktree = privateFile(`worktrees/${runId}-${issue}`);
  noSymlinks(ROOT, worktree);
  const entry = { runId, branch, baseSha, worktree, kind, issue: Number(issue), createdAt: now() };
  // Register before Git creates the branch: interrupted creation cannot publish unguarded.
  writeJSON(file, entry, 0o600);
  fs.mkdirSync(path.dirname(worktree), { recursive: true, mode: 0o700 });
  git(ROOT, 'worktree', 'add', '-b', branch, worktree, baseSha);
  if (fs.existsSync(at('brain.config.local.json'))) {
    noSymlinks(ROOT, at('brain.config.local.json'));
    fs.copyFileSync(at('brain.config.local.json'), path.join(worktree, 'brain.config.local.json'));
    fs.chmodSync(path.join(worktree, 'brain.config.local.json'), 0o600);
  }
  return entry;
}
