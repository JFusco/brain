#!/usr/bin/env node
// Local due-time bookkeeping. The scheduled agent performs the work and review.
import crypto from 'node:crypto';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { withLock } from './lib/branch/platform/lock.mjs';
import { args } from './lib/leaf/cli-args.mjs';
import { writeJSON, safePath } from './lib/leaf/fs-safe.mjs';
import { sha } from './lib/leaf/hash.mjs';
import { readJSON } from './lib/leaf/json.mjs';
import { at, ROOT } from './lib/leaf/paths.mjs';
import { now } from './lib/leaf/time.mjs';
import { recordPublication, mergedBrainPR } from './lib/maintenance.mjs';
import * as gates from './lib/nightly-publication.mjs';
import { checkVocabularyRelease } from './lib/vocabulary.mjs';
import { checkUiPatternsRelease } from './lib/ui-patterns.mjs';

const file = at('.state/nightly.json'),
  zone = 'America/New_York';
function dueDate() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map(p => [p.type, p.value]),
  );
  const date = `${p.year}-${p.month}-${p.day}`;
  return Number(p.hour) * 60 + Number(p.minute) >= 195
    ? date
    : new Date(Date.parse(date) - 86400000).toISOString().slice(0, 10);
}
function load() {
  return readJSON(file, { schemaVersion: 1, completed: {}, attempts: {} });
}
function save(state, attempt) {
  if (attempt) writeJSON(at(`.state/nightly/runs/${attempt.id}.json`), attempt, 0o600);
  writeJSON(file, state, 0o600);
}
function git(...argv) {
  const r = spawnSync('git', argv, { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
  if (r.status !== 0) throw new Error('Required Git evidence is unavailable');
  return r.stdout;
}
async function verifyMerged(item, attempt) {
  const pr = await mergedBrainPR(item.number);
  if (attempt.protocolVersion === 2) gates.verifyApproval(attempt.id, item, pr);
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
const {
  positional: [operation],
  flags,
} = args(process.argv.slice(2));
try {
  const allowed = {
    status: [],
    claim: ['trigger', 'author-id', 'rerun'],
    checkout: ['run-id', 'issue', 'slug', 'kind'],
    rebase: ['run-id', 'worktree'],
    prepare: ['run-id', 'worktree', 'file'],
    merge: ['run-id', 'worktree', 'pr'],
    verify: ['run-id', 'worktree'],
    complete: ['run-id', 'file'],
    failed: ['run-id', 'reason'],
  };
  if (!allowed[operation] || Object.keys(flags).some(k => !allowed[operation].includes(k)))
    throw new Error(
      'Use nightly.mjs status|claim|checkout|rebase|prepare|merge|verify|complete|failed; see README for options',
    );
  if (operation !== 'status' && ROOT !== gates.coordinator())
    throw new Error('Run nightly mutation commands from the primary checkout');
  const run = async () => {
    if (['checkout', 'rebase', 'prepare', 'merge', 'verify'].includes(operation))
      return gates[operation]({
        runId: flags['run-id'],
        worktree: flags.worktree,
        file: flags.file,
        issue: flags.issue,
        slug: flags.slug,
        kind: flags.kind,
        pr: flags.pr,
      });
    const state = load(),
      slotDate = dueDate();
    if (operation === 'status')
      return {
        timezone: zone,
        window: '03:15',
        slotDate,
        completed: state.completed[slotDate] || null,
        active: state.active || null,
        attempts: state.attempts[slotDate] || 0,
        retryAfter: state.retryAfter || null,
        lastFailure: state.lastFailure || null,
        manualReruns: state.manual || null,
        notice:
          'Local execution requires an awake Mac and running app. Missed dates coalesce. Publication receipts bind review and executed checks to exact commits; reviewer identity is agent-reported.',
      };
    if (operation === 'claim') {
      if (!['manual', 'scheduled-agent'].includes(flags.trigger))
        throw new Error('Record the actual invocation trigger');
      const rerun = flags.rerun !== undefined;
      if (rerun && (flags.trigger !== 'manual' || !/^[a-z][a-z0-9-]{0,63}$/.test(flags.rerun)))
        throw new Error('A rerun requires --trigger manual and --rerun <short-reason-code>');
      const ledger = rerun ? (state.manual ||= { completed: {}, attempts: {} }) : state;
      if (state.active)
        return { claimed: false, reason: 'active-run-needs-reconciliation', active: state.active };
      if (!rerun && state.completed[slotDate])
        return { claimed: false, reason: 'completed', slotDate };
      if ((ledger.attempts[slotDate] || 0) >= 3)
        return {
          claimed: false,
          reason: rerun ? 'manual-retry-limit' : 'daily-retry-limit',
          slotDate,
          lastFailure: ledger.lastFailure,
        };
      if (Date.parse(ledger.retryAfter) > Date.now())
        return { claimed: false, reason: 'backoff', retryAfter: ledger.retryAfter };
      const previous = readJSON(at('.state/publication.json'), {});
      if (previous.activeRun)
        return {
          claimed: false,
          reason: 'publication-needs-reconciliation',
          active: previous.activeRun,
        };
      if (
        typeof flags['author-id'] !== 'string' ||
        !flags['author-id'].trim() ||
        flags['author-id'].length > 200
      )
        throw new Error('Record the actual author agent identity with --author-id');
      const publication = await recordPublication({ phase: 'started', trigger: flags.trigger });
      const attempt = {
        id: crypto.randomUUID(),
        slotDate,
        startedAt: now(),
        trigger: flags.trigger,
        publicationRunId: publication.runId,
        phase: 'started',
        protocolVersion: 2,
        authorId: flags['author-id'],
        ...(rerun ? { mode: 'manual-rerun', rerunReason: flags.rerun } : {}),
      };
      state.active = attempt;
      ledger.attempts[slotDate] = (ledger.attempts[slotDate] || 0) + 1;
      save(state, attempt);
      // Advisory metadata only: preserve the claimed run and routine catalog scope.
      try {
        attempt.vocabulary = await checkVocabularyRelease();
      } catch (error) {
        attempt.vocabulary = { ok: false, error: error.message };
      }
      try {
        attempt.uiPatterns = await checkUiPatternsRelease();
      } catch (error) {
        attempt.uiPatterns = { ok: false, error: error.message };
      }
      save(state, attempt);
      return { claimed: true, ...attempt };
    }
    const attempt = state.active;
    if (!attempt || attempt.id !== flags['run-id'])
      throw new Error('The exact active nightly run ID is required');
    const ledger = attempt.mode === 'manual-rerun' ? state.manual : state;
    if (operation === 'failed') {
      if (!/^[a-z][a-z0-9-]{0,63}$/.test(flags.reason || ''))
        throw new Error('Use a short failure code; keep private diagnostics in the run report');
      const publication = readJSON(at('.state/publication.json'), {});
      if (
        publication.lastRun?.id === attempt.publicationRunId &&
        publication.lastRun.outcome === 'published'
      )
        throw new Error('Reconcile successful publication; do not mark it failed to clear a run');
      if (
        publication.lastRun?.id !== attempt.publicationRunId ||
        publication.lastRun.outcome !== 'failed'
      )
        await recordPublication({
          phase: 'failed',
          runId: attempt.publicationRunId,
          trigger: attempt.trigger,
        });
      attempt.phase = 'failed';
      attempt.reason = flags.reason;
      attempt.completedAt = now();
      ledger.lastFailure = { id: attempt.id, at: attempt.completedAt, reason: flags.reason };
      ledger.retryAfter = new Date(Date.now() + 3600000).toISOString();
      delete state.active;
      save(state, attempt);
      return attempt;
    }
    const report = readJSON(flags.file, null);
    if (report?.runId !== attempt.id || !['published', 'unchanged'].includes(report.outcome))
      throw new Error('Provide the actual run report and outcome');
    for (const name of ['refresh', 'links', 'curation', 'review', 'verification'])
      if (
        !['completed', 'unnecessary'].includes(report.stages?.[name]?.outcome) ||
        !report.stages[name].summary?.trim()
      )
        throw new Error(`Missing actual ${name} evidence`);
    if (
      report.stages.review.outcome !== 'completed' ||
      report.stages.verification.outcome !== 'completed'
    )
      throw new Error('Review and verification cannot be skipped');
    if (attempt.protocolVersion !== 2)
      for (const command of gates.CHECKS)
        if (!report.checks?.some(c => c.command === command && c.exitCode === 0))
          throw new Error('Required local checks did not pass');
    if (
      !Array.isArray(report.prs) ||
      (report.outcome === 'unchanged' && report.prs.length) ||
      (report.outcome === 'published' && !report.prs.length)
    )
      throw new Error('Publication outcome differs from the recorded PRs');
    const merged = [];
    for (const item of report.prs) merged.push(await verifyMerged(item, attempt));
    if (attempt.protocolVersion === 2)
      report.verification = gates.completionChecks(attempt.id, merged);
    const receipt = at(`.state/nightly/reports/${attempt.id}.json`);
    writeJSON(receipt, report, 0o600);
    const publication = readJSON(at('.state/publication.json'), {});
    if (
      publication.lastRun?.id !== attempt.publicationRunId ||
      publication.lastRun.outcome !== report.outcome
    )
      await recordPublication({
        phase: 'completed',
        runId: attempt.publicationRunId,
        trigger: attempt.trigger,
        outcome: report.outcome,
        pr: merged.at(-1)?.number,
      });
    attempt.phase = 'completed';
    attempt.completedAt = now();
    attempt.outcome = report.outcome;
    attempt.reportSha256 = sha(fs.readFileSync(receipt));
    attempt.prs = merged;
    ledger.completed[attempt.mode === 'manual-rerun' ? attempt.id : attempt.slotDate] = attempt;
    delete state.active;
    delete ledger.retryAfter;
    save(state, attempt);
    return attempt;
  };
  console.log(JSON.stringify(await (operation === 'status' ? run() : withLock(run)), null, 2));
} catch (error) {
  console.error('brain nightly: ' + error.message);
  process.exitCode = 1;
}
