---
title: "Cleanup reconciliation and verified deduplication"
topics: ["automatic-knowledge-maintenance"]
plans: ["2026-10-17-reconcile-brain-cleanup-evidence-and-duplicate-dispositions-d94ac7a452.md"]
---

# Cleanup reconciliation and verified deduplication

[Issue 30](https://github.com/JFusco/brain/issues/30) completes the delivery record after the user asked to continue through the authorized cleanup. The [initial cleanup journal](2026-10-17-project-cleanup.md) remains the historical checkpoint. Its original partial plan records the remaining semantic-curation work; it is not rewritten as an exhaustive review.

## Delivered project changes

[PR 28](https://github.com/JFusco/brain/pull/28) merged the collection, hub deduplication, unused-code removal and status cleanup at `143201bdcca3393933deb2870427d221efa9c88d`. The complete merged tree matched reviewed head `0fe89d9649f8cef3731639d4ae6a62376fd8b8c8`, and fetched remote main contained that merge. Existing hosted Wiki integrity succeeded; no new CI or test suite was introduced.

Before reconciling the primary checkout, byte comparisons and ordered-content comparisons established that all local authored changes were already represented upstream. All 473 untracked public files matched upstream exactly. A named Git stash preserved all 502 scoped modified/untracked paths before an ordinary `git pull --ff-only` advanced main to the verified merge. The recovery stash remains available; ignored private state was retained. No reset, forced overwrite or stash replay was needed.

## Final cleanup accounting

| Outcome | Candidates |
| --- | ---: |
| Original pending inventory structurally screened | 3,075 |
| Rejected after individual review | 38 |
| Superseded by verified retained copies | 28 |
| Remaining pending | 3,009 |
| Accepted or published by cleanup | 0 |

The initial structural screen used 257 batches of at most twelve. Further individually reviewed batches rejected status-only records, navigation-only inventories and unfilled scaffolds. Index labels alone did not justify rejection: candidates containing migration drift checks, tenant boundaries, API capability distinctions, atomic snapshots or unresolved design questions were retained with their useful portions and evidence gaps recorded privately.

The earlier exact-byte comparison found no duplicate inbox groups. The continuation additionally compared normalized paragraph containment, then individually read each proposed duplicate and the retained context. Twenty-six older skill/topic copies were redundant; two further index copies preserved all original rows in larger retained versions. Date changes alone were not treated as technical verification. Replacement chains terminate at retained candidates, and all original bodies, differing metadata and provenance remain historical evidence.

The final private audit rehashed every one of the 3,075 original bodies and verified that none changed. It also verified every replacement target was retained and matched its recorded hash. Candidate identities, decisions, prior dispositions, hashes, concrete reasons and replacement relationships remain in ignored local audit records. No quarantined bodies or excluded raw memory stores were opened.

This completes the selected cleanup operations, not full semantic curation of 3,009 remaining candidates. Structural screening cannot establish that they are all useful or irrelevant. Unreviewed, mixed and uncertain evidence remains pending, including historical logs with possible lessons. The eight published notes and versioned vendor snapshots remain intact; clearing the queue would discard unreviewed evidence.

## Verification and rollback

On reconciled main, runtime content/privacy passed for 1,671 files without issues or warnings; official integrity passed. Maintenance status reported no errors, no overdue official sources and no stale guidance, while retaining its warning about restricted or rate-limited destinations. Link sampling remains bounded coverage. Backups remain disabled.

The final read-only collection preview used collection version 3, reported 1,232 journal exclusions and two index/instruction exclusions, and found zero unreadable sources. It predicted two new candidates without writing them. This is a preview, not evidence of unattended collection.

Final runtime content/privacy passed for 1,673 files with no issues or warnings. Scoped plan discovery returned zero unresolved plans; wiki generation and integrity passed with 30 nodes and 77 edges, and whitespace validation passed. This documentation continuation uses a branch from current main and the existing pre-commit privacy guard. Test suites, fixtures, fresh-session checks, dedicated QA and review-agent audits remain deferred. No source publication, dependency upgrade, skill installation, project adoption or other-repository change is part of this continuation.

Rollback of documentation uses a scoped revert. Inbox rollback uses the private prior dispositions and exact hashes, without modifying bodies or overwriting later decisions. The retained recovery stash preserves the primary checkout's former local state and must not be applied over newer work without reconciliation.
