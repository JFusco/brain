---
title: "Split the nightly publication gate"
date: "2026-10-24"
topics: [code-quality, automatic-knowledge-maintenance]
---

# Split the nightly publication gate

[Issue 151](https://github.com/JFusco/brain/issues/151) is phase 3c of the cleanup. Three modules become focused, layered modules:
- `nightly-publication.mjs` (466 lines);
- the logic inside `scripts/nightly.mjs` (about 290 lines);
- `maintenance.mjs`.

| Layer | Modules |
| --- | --- |
| Platform adapters | `branch/platform/git` (`execute`, `git`, `coordinator`, `blob`), `branch/platform/github-cli` (`gh`, `repository`) |
| Gate building blocks | `branch/nightly/{paths,run,scope,review,checks,receipts}` |
| Bookkeeping | `branch/nightly/{schedule,ledger,report,merged}` and `branch/publication/{ledger,merged-pr}` |
| Commands | `tree/nightly/{checkout,prepare,rebase,merge,verify,push-guard,claim,failed,complete,status}`, `tree/maintenance/status` |

`scripts/nightly.mjs` and `scripts/nightly-push.mjs` now only dispatch arguments.

The due date takes an injectable clock. Claim refusals (active run, completed date, retry limit, backoff) and run-report validation are pure functions, and review validation accepts the author explicitly. `mergedBrainPR` reuses the shared repository-identity lookup instead of a duplicate regex. The `overdue` helper moved to `leaf/time`. `verifyMerged` keeps its own Git helper so its error message is unchanged.

One pre-existing quirk is fixed: inherited object keys such as `nightly.mjs constructor` passed the command check, fell through to `complete` under the lock and failed there. They now get the usage error.

The `CHECKS` strings, state file paths, receipt shapes, command names, options and messages are unchanged.

Verification:
- A replay harness ran the nightly ledger lifecycle in throwaway clones, against the old code and against the new code. Each clone had a scratch bare origin, served through a fake ssh under a GitHub-style URL so the wiki check sees the real repository identity. The lifecycle covered:
  - status, invalid arguments and claim;
  - a duplicate claim;
  - final `verify` with real local checks;
  - an unchanged `complete`;
  - a completed-date refusal;
  - a manual rerun, failure-code validation, failure and backoff;
  - the push guard, maintenance status and the private state files written.

  The 688 lines of normalized output were identical.
- New tests cover the 03:15 boundary in both daylight-saving periods and on both transition days, claim refusals, report validation and review validation.
- A static check confirmed that every named import resolves to an export.
- `pnpm run verify:ci` passed.
