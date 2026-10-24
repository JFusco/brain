// Local safeguards for the supported nightly publication flow. Receipts are private.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { config } from './branch/platform/config.mjs';
import { writeJSON, safePath, noSymlinks } from './leaf/fs-safe.mjs';
import { sha } from './leaf/hash.mjs';
import { readJSON } from './leaf/json.mjs';
import { ROOT, at } from './leaf/paths.mjs';
import { now } from './leaf/time.mjs';

export const CHECKS = [
  'node scripts/brain.mjs check',
  'node scripts/brain.mjs official check',
  'node scripts/wiki/check.cjs',
];
const HOUR = 3600000,
  OFFICIAL = /<!-- brain:official:start -->[\s\S]*?<!-- brain:official:end -->/;
const CURATED = /<!-- brain:curated:start -->[\s\S]*?<!-- brain:curated:end -->/;
function execute(command, argv, cwd = ROOT) {
  const r = spawnSync(command, argv, { cwd, maxBuffer: 32 * 1024 * 1024, timeout: 180000 });
  if (r.status !== 0)
    throw new Error(
      `Required ${path.basename(command)} operation failed (exit ${r.status ?? 'unavailable'}); preserve local diagnostics`,
    );
  return r.stdout;
}
export const git = (cwd, ...argv) => execute('git', argv, cwd);
export function coordinator() {
  return path.dirname(
    git(ROOT, 'rev-parse', '--path-format=absolute', '--git-common-dir').toString().trim(),
  );
}
const privateFile = relative => path.join(coordinator(), '.state/nightly', relative);
const branchFile = branch => privateFile(`branches/${sha(branch)}.json`);
const approvalFile = (runId, head) => privateFile(`approvals/${runId}/${head}.json`);
export function activeRun(runId) {
  const attempt = readJSON(path.join(coordinator(), '.state/nightly.json'), {}).active;
  if (!attempt || attempt.id !== runId || attempt.protocolVersion !== 2)
    throw new Error('The original active version 2 nightly run is required');
  return attempt;
}
function primary() {
  if (fs.realpathSync(ROOT) !== fs.realpathSync(coordinator()))
    throw new Error('Run nightly publication commands from the primary checkout');
}
function gh(...argv) {
  return execute(config().toolchain.gh, argv, coordinator()).toString().trim();
}
function repository() {
  const origin = git(coordinator(), 'remote', 'get-url', 'origin').toString().trim();
  const repo = origin.match(
    /^(?:https:\/\/github\.com\/|git@github\.com:)([\w.-]+\/[\w.-]+?)(?:\.git)?$/,
  )?.[1];
  if (!repo) throw new Error('Cannot establish Brain repository identity');
  return repo;
}
function registered(worktree, runId) {
  const cwd = fs.realpathSync(worktree),
    branch = git(cwd, 'symbolic-ref', '--short', 'HEAD').toString().trim();
  const entry = readJSON(branchFile(branch), null);
  if (!entry || entry.runId !== runId || entry.worktree !== cwd)
    throw new Error('Use the temporary checkout registered for this run');
  activeRun(runId);
  return entry;
}
function cleanHead(cwd) {
  if (git(cwd, 'status', '--porcelain', '--untracked-files=all').length)
    throw new Error('Uncommitted changes invalidate nightly publication approval');
  return git(cwd, 'rev-parse', 'HEAD').toString().trim();
}
function remoteBase() {
  return git(coordinator(), 'ls-remote', 'origin', 'refs/heads/main')
    .toString()
    .trim()
    .split(/\s+/)[0];
}
function blob(cwd, ref, file) {
  const exists = spawnSync('git', ['cat-file', '-e', `${ref}:${file}`], { cwd, stdio: 'ignore' });
  if (exists.status === 1 || exists.status === 128) return null;
  if (exists.status !== 0) throw new Error('Cannot read reviewed content');
  const mode = git(cwd, 'ls-tree', ref, '--', file).toString().split(' ')[0];
  if (mode !== '100644' && mode !== '100755')
    throw new Error('Nightly publication cannot contain symlinks or submodules');
  return git(cwd, 'show', `${ref}:${file}`);
}
function snapshot(entry, head) {
  const { worktree: cwd, baseSha, kind } = entry;
  git(cwd, 'merge-base', '--is-ancestor', baseSha, head);
  const paths = git(cwd, 'diff', '--name-only', '--no-renames', '-z', baseSha, head)
    .toString()
    .split('\0')
    .filter(Boolean)
    .sort();
  const notes = [],
    files = paths.map(file => {
      safePath(file);
      const hub = /^knowledge\/(?:[^/]+\/)+INDEX\.md$/.test(file);
      const permitted =
        kind === 'catalog'
          ? /^(official\/catalogs\/|official\/sources\.lock\.json$)/.test(file) || hub
          : /^(knowledge\/|wiki\/|scripts\/wiki\/graph\/data\/)/.test(file) &&
            !file.includes('/_templates/');
      if (!permitted) throw new Error('Changed path is outside this nightly publication scope');
      const before = blob(cwd, baseSha, file),
        after = blob(cwd, head, file);
      if (
        hub &&
        kind === 'catalog' &&
        (!before ||
          !after ||
          before.toString().replace(OFFICIAL, '') !== after.toString().replace(OFFICIAL, ''))
      )
        throw new Error('Catalog refresh may change only the official section of existing hubs');
      if (
        file.startsWith('knowledge/') &&
        (!hub ||
          !before ||
          !after ||
          before.toString().replace(OFFICIAL, '').replace(CURATED, '') !==
            after.toString().replace(OFFICIAL, '').replace(CURATED, ''))
      )
        notes.push(file);
      return { path: file, sha256: after === null ? null : sha(after) };
    });
  if (!files.length) throw new Error('No committed publication changes');
  return { files, notes };
}
function text(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
function validateReview(review, entry, head, notes) {
  const author = activeRun(entry.runId).authorId,
    t = Date.parse(review?.reviewedAt);
  if (
    review?.runId !== entry.runId ||
    review.headSha !== head ||
    review.baseSha !== entry.baseSha ||
    review.authorId !== author ||
    review.verdict !== 'approved' ||
    !text(review.summary) ||
    !text(review.reviewerId) ||
    !Number.isFinite(t) ||
    t < Date.parse(entry.createdAt) ||
    t > Date.now() ||
    Date.now() - t > HOUR
  )
    throw new Error('A fresh approved review of the exact run, base and head is required');
  if (notes.length && (review.reviewerId === author || review.role !== 'content-reviewer'))
    throw new Error('Changed knowledge requires a separate content reviewer');
  if (!notes.length && review.role !== 'author' && review.role !== 'content-reviewer')
    throw new Error('Record the actual review role');
  if (review.role === 'author' && review.reviewerId !== author)
    throw new Error('An author review must identify the actual run author');
  if (
    !Array.isArray(review.notes) ||
    JSON.stringify(review.notes.map(n => n.path).sort()) !== JSON.stringify(notes)
  )
    throw new Error('Review must cover every changed knowledge note or hub prose');
  for (const note of review.notes) {
    if (
      note.verdict !== 'approved' ||
      !['official', 'observation'].includes(note.evidenceKind) ||
      !['evidence', 'applicability', 'overlap', 'privacy'].every(k => text(note[k])) ||
      !Array.isArray(note.sources)
    )
      throw new Error('Record source, applicability, overlap and privacy decisions for every note');
    if (note.evidenceKind === 'official' && !note.sources.length)
      throw new Error('Documented claims require checked official sources');
    for (const source of note.sources) {
      const url = new URL(source);
      if (url.protocol !== 'https:' || url.username || url.password)
        throw new Error('Use sanitized HTTPS source URLs');
    }
  }
}
function checks(worktree, head) {
  const results = [];
  for (const command of CHECKS) {
    const startedAt = now(),
      r = spawnSync(process.execPath, command.split(' ').slice(1), {
        cwd: worktree,
        maxBuffer: 32 * 1024 * 1024,
        timeout: 180000,
      });
    const record = {
      command,
      headSha: head,
      startedAt,
      completedAt: now(),
      exitCode: r.status,
      output: Buffer.concat([r.stdout || Buffer.alloc(0), r.stderr || Buffer.alloc(0)]).toString(),
    };
    results.push(record);
    writeJSON(privateFile(`checks/${sha(worktree)}/${head}-${process.pid}.json`), results, 0o600);
    if (r.status !== 0)
      throw new Error(`Local check failed: ${command}; diagnostics retained privately`);
    if (cleanHead(worktree) !== head)
      throw new Error('Checked content changed during verification');
  }
  return results;
}
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
export function prepare({ runId, worktree, file }) {
  primary();
  const entry = registered(worktree, runId),
    head = cleanHead(entry.worktree);
  if (entry.baseSha !== remoteBase())
    throw new Error('Main changed; update the branch and register a fresh base before reviewing');
  const { files, notes } = snapshot(entry, head),
    review = readJSON(file, null);
  // Preserve even rejected or malformed review evidence without publishing it.
  writeJSON(privateFile(`reviews/${runId}/${head}-${Date.now()}.json`), review, 0o600);
  validateReview(review, entry, head, notes);
  const results = checks(entry.worktree, head),
    preparedAt = now();
  const receipt = {
    ...entry,
    headSha: head,
    files,
    notes,
    review,
    checks: results,
    preparedAt,
    expiresAt: new Date(
      Math.min(Date.parse(review.reviewedAt), Date.parse(preparedAt)) + HOUR,
    ).toISOString(),
  };
  writeJSON(approvalFile(runId, head), receipt, 0o600);
  return { runId, headSha: head, files, notes, preparedAt, expiresAt: receipt.expiresAt };
}
export function rebase({ runId, worktree }) {
  primary();
  const entry = registered(worktree, runId);
  cleanHead(entry.worktree);
  git(ROOT, 'fetch', 'origin', 'main');
  const baseSha = git(ROOT, 'rev-parse', 'origin/main').toString().trim();
  git(entry.worktree, 'rebase', baseSha);
  entry.baseSha = baseSha;
  writeJSON(branchFile(entry.branch), entry, 0o600);
  return { ...entry, notice: 'Review the resulting head and run prepare again before publication' };
}
export function approved(worktree, runId, head) {
  const entry = registered(worktree, runId);
  if (cleanHead(entry.worktree) !== head)
    throw new Error('The publication head differs from the approved commit');
  const receipt = readJSON(approvalFile(runId, head), null);
  if (
    !receipt ||
    receipt.branch !== entry.branch ||
    receipt.baseSha !== entry.baseSha ||
    Date.parse(receipt.expiresAt) <= Date.now()
  )
    throw new Error(
      'Run prepare with a fresh exact-head review and executed checks before publication',
    );
  if (receipt.baseSha !== remoteBase())
    throw new Error('Main changed; fresh review and checks are required');
  if (JSON.stringify(snapshot(entry, head).files) !== JSON.stringify(receipt.files))
    throw new Error('Approved file scope differs from the publication');
  return receipt;
}
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
export function merge({ runId, worktree, pr }) {
  primary();
  if (!/^[1-9]\d*$/.test(pr || '')) throw new Error('Provide the exact PR number');
  const entry = registered(worktree, runId),
    head = cleanHead(entry.worktree),
    repo = repository();
  const saved = JSON.parse(gh('api', `repos/${repo}/pulls/${pr}`));
  // An interrupted successful merge reconciles its existing receipt rather than merging again.
  if (saved.merged_at) {
    verifyApproval(
      runId,
      {
        number: Number(pr),
        headSha: saved.head.sha,
        files: readJSON(approvalFile(runId, saved.head.sha), {}).files,
      },
      saved,
    );
    return {
      number: Number(pr),
      headSha: saved.head.sha,
      mergedAt: saved.merged_at,
      reconciled: true,
    };
  }
  approved(entry.worktree, runId, head);
  if (
    saved.state !== 'open' ||
    saved.draft ||
    saved.head.sha !== head ||
    saved.head.ref !== entry.branch ||
    saved.head.repo?.full_name !== repo ||
    saved.base.ref !== 'main' ||
    saved.base.sha !== entry.baseSha
  )
    throw new Error('Saved PR does not match the approved head, branch, repository and base');
  const runs = JSON.parse(
    gh(
      'api',
      `repos/${repo}/actions/workflows/wiki-check.yml/runs?head_sha=${head}&event=pull_request&per_page=100`,
    ),
  ).workflow_runs;
  // GitHub may omit PR associations, even on successful pull_request runs.
  const latest = runs
    ?.filter(
      r =>
        r.head_sha === head &&
        r.head_branch === entry.branch &&
        r.head_repository?.full_name === repo &&
        r.event === 'pull_request',
    )
    .sort((a, b) => b.run_number - a.run_number || b.run_attempt - a.run_attempt)[0];
  if (!latest || latest.status !== 'completed' || latest.conclusion !== 'success')
    throw new Error('Wiki integrity must pass on the exact PR head before merge');
  // Check again immediately before invoking GitHub; do not bypass branch protection.
  const receipt = approved(entry.worktree, runId, head);
  writeJSON(
    privateFile(`merges/${runId}/${pr}.json`),
    {
      runId,
      number: Number(pr),
      headSha: head,
      baseSha: entry.baseSha,
      preparedAt: receipt.preparedAt,
      checkedAt: now(),
      wikiRun: { id: latest.id, headSha: latest.head_sha, conclusion: latest.conclusion },
    },
    0o600,
  );
  gh('pr', 'merge', pr, '--repo', repo, '--squash', '--match-head-commit', head);
  const merged = JSON.parse(gh('api', `repos/${repo}/pulls/${pr}`));
  verifyApproval(
    runId,
    { number: Number(pr), headSha: head, files: readJSON(approvalFile(runId, head)).files },
    merged,
  );
  return { number: Number(pr), headSha: head, mergedAt: merged.merged_at };
}
export function verifyApproval(runId, item, pr) {
  const receipt = readJSON(approvalFile(runId, item.headSha), null),
    intent = readJSON(privateFile(`merges/${runId}/${item.number}.json`), null),
    mergedAt = Date.parse(pr.merged_at);
  // GitHub's merge timestamp has second precision; compare start times at that precision.
  const second = value => Math.floor(Date.parse(value) / 1000);
  if (
    !receipt ||
    !Number.isFinite(mergedAt) ||
    pr.head.sha !== receipt.headSha ||
    pr.head.ref !== receipt.branch ||
    pr.base.ref !== 'main' ||
    pr.base.sha !== receipt.baseSha ||
    second(receipt.preparedAt) > second(pr.merged_at) ||
    Date.parse(receipt.expiresAt) < mergedAt ||
    JSON.stringify(receipt.files) !== JSON.stringify(item.files)
  )
    throw new Error('Merged PR lacks a matching fresh prepublication approval and check receipt');
  if (
    intent?.headSha !== receipt.headSha ||
    intent.preparedAt !== receipt.preparedAt ||
    intent.wikiRun?.conclusion !== 'success' ||
    intent.wikiRun.headSha !== receipt.headSha ||
    second(intent.checkedAt) > second(pr.merged_at)
  )
    throw new Error('Reconcile the guarded merge and its exact-head Wiki evidence');
  return receipt;
}
export function verify({ runId, worktree }) {
  primary();
  activeRun(runId);
  const cwd = fs.realpathSync(worktree);
  if (
    path.dirname(
      git(cwd, 'rev-parse', '--path-format=absolute', '--git-common-dir').toString().trim(),
    ) !== coordinator()
  )
    throw new Error('Verification must use a Brain checkout');
  const headSha = cleanHead(cwd);
  if (headSha !== remoteBase())
    throw new Error('Final verification requires the current committed main state');
  const record = { runId, headSha, checks: checks(cwd, headSha), completedAt: now() };
  writeJSON(privateFile(`verification/${runId}.json`), record, 0o600);
  return {
    runId,
    headSha,
    completedAt: record.completedAt,
    checks: record.checks.map(({ output, ...c }) => c),
  };
}
export function completionChecks(runId, merged) {
  const receipt = readJSON(privateFile(`verification/${runId}.json`), null);
  if (
    !receipt ||
    !CHECKS.every(command =>
      receipt.checks?.some(
        c => c.command === command && c.exitCode === 0 && c.headSha === receipt.headSha,
      ),
    ) ||
    Date.now() - Date.parse(receipt.completedAt) > HOUR
  )
    throw new Error('Run verify to execute fresh local checks on the final committed state');
  for (const pr of merged)
    git(coordinator(), 'merge-base', '--is-ancestor', pr.mergeCommit, receipt.headSha);
  return receipt;
}
