#!/usr/bin/env node
// Local due-time bookkeeping. The scheduled agent performs the work and review.
import { coordinator } from './lib/branch/platform/git.mjs';
import { withLock } from './lib/branch/platform/lock.mjs';
import { loadLedger } from './lib/branch/nightly/ledger.mjs';
import { dueDate } from './lib/branch/nightly/schedule.mjs';
import { args } from './lib/leaf/cli-args.mjs';
import { ROOT } from './lib/leaf/paths.mjs';
import { checkout } from './lib/tree/nightly/checkout.mjs';
import { claim } from './lib/tree/nightly/claim.mjs';
import { complete } from './lib/tree/nightly/complete.mjs';
import { failed } from './lib/tree/nightly/failed.mjs';
import { merge } from './lib/tree/nightly/merge.mjs';
import { prepare } from './lib/tree/nightly/prepare.mjs';
import { rebase } from './lib/tree/nightly/rebase.mjs';
import { status } from './lib/tree/nightly/status.mjs';
import { verify } from './lib/tree/nightly/verify.mjs';

const GATES = { checkout, rebase, prepare, merge, verify };
const ALLOWED = {
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

async function run(operation, flags) {
  if (Object.hasOwn(GATES, operation))
    return GATES[operation]({
      runId: flags['run-id'],
      worktree: flags.worktree,
      file: flags.file,
      issue: flags.issue,
      slug: flags.slug,
      kind: flags.kind,
      pr: flags.pr,
    });
  const state = loadLedger();
  const slotDate = dueDate();
  if (operation === 'status') return status(state, slotDate);
  if (operation === 'claim') return claim(state, slotDate, flags);
  if (operation === 'failed') return failed(state, flags);
  return complete(state, flags);
}

const {
  positional: [operation],
  flags,
} = args(process.argv.slice(2));
try {
  if (
    !Object.hasOwn(ALLOWED, operation ?? '') ||
    Object.keys(flags).some(k => !ALLOWED[operation].includes(k))
  )
    throw new Error(
      'Use nightly.mjs status|claim|checkout|rebase|prepare|merge|verify|complete|failed; see README for options',
    );
  if (operation !== 'status' && ROOT !== coordinator())
    throw new Error('Run nightly mutation commands from the primary checkout');
  const result =
    operation === 'status' ? run(operation, flags) : withLock(() => run(operation, flags));
  console.log(JSON.stringify(await result, null, 2));
} catch (error) {
  console.error('brain nightly: ' + error.message);
  process.exitCode = 1;
}
