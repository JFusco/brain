---
title: "Move nightly reference maintenance and review local"
topics: [automatic-knowledge-maintenance]
---

# Move nightly reference maintenance and review local

Joe requested local reference refresh, curation and verification after the scheduled GitHub reference-health run did not appear. GitHub's run history contained no scheduled reference-health runs at inspection. That establishes missing execution evidence, not the cause of GitHub's omission.

Six October 19 local curation attempts had also failed after collection. The old local task still required harvesting/proposal commands retired from current main. The primary checkout was eighteen commits behind and contained older uncommitted work. That work was preserved in the named `brain-local-nightly-preserved-20261019` Git stash, and local main was fast-forwarded without applying the older changes over the newer implementation. Legacy vendor files and private state were retained.

## Result

- **Brain weekly reference health** and **Brain catalog sync** are disabled in GitHub. **Wiki integrity** remains active. It was briefly disabled during an overly broad scope interpretation and was restored after Joe's correction; workflow readback verified the final states.
- The existing curator is repointed to one local nightly refresh, curation, review and verification task. The obsolete one-time verifier remains paused, with its original configuration preserved privately.
- `scripts/nightly.mjs` records original run/publication IDs, a once-per-day 03:15 New York window, coalesced catch-up, one-hour failure backoff and at most three attempts per date. Completion requires stage/check evidence, and verifies every published PR's exact head, changed paths and merged-file hashes. It does not independently establish the truth of an agent's semantic review.
- Runtime status and the local procedures describe local reference maintenance while retaining the Wiki integrity PR gate. Tests, fixtures, fresh-session checks and review-agent audits remain deferred.

## Manual verification and limits

A separate temporary local checkout refreshed all 21 registered sources: one changed (`vercel-plugin`), twenty unchanged, no source failures or hosted skips. A bounded 24-link sample from 8,613 catalogued destinations found no problems. Runtime/privacy checks, official integrity and wiki integrity passed in that checkout. These observations prove the manual local path for that batch, not catalog-wide link health or future unattended scheduling.

The changed catalog was not committed, pushed or published as part of setup. Its exact diff, resulting files, safe refresh/link state and command results are retained in ignored local setup evidence before removing the owned temporary worktree. No branch was created for that detached diagnostic checkout. The original Contentful worktree is outside this cleanup's ownership.

The nightly configuration, syntax and local runtime/wiki checks are verified during setup. Actual scheduled execution, useful-capture publication and sleep/wake catch-up remain unproven until their receipts are observed. Previous publication failures are retained rather than overwritten with a setup success.

## Rollback

Pause the existing local nightly automation and preserve any active run/report before changing it. The prior automation configurations and original checkout stash are retained privately. Re-enabling a reference-maintenance GitHub workflow requires a new request from Joe. Revert only the scoped setup implementation when requested; preserve the Wiki integrity check, private state and unrelated work. The initial setup was local and uncommitted.

## Authorized Git delivery

Joe subsequently requested commit, push and merge, followed by inspection of the preserved stash. [Issue 75](https://github.com/JFusco/brain/issues/75) tracks this delivery. Its scope includes the nightly gate, local-maintenance status/procedures and this wiki record; private automation configuration, manual refresh results, historical snapshots and the stash remain outside the commit. Nightly maintenance is paused during delivery to avoid overlapping Git operations, then restored to its prior active state. The delivery branch is removed only after verifying its exact head merged, and stash inspection does not imply applying or dropping it.
