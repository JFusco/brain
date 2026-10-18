---
title: "Skip unchanged source bodies and review duplicate lessons"
topics: ["incremental-collection"]
plans: ["2026-10-18-incremental-collection-and-duplicate-lesson-review-18503b9454.md", "2026-10-18-deliver-incremental-collection-and-daily-duplicate-review-3a697901c0.md"]
---

# Skip unchanged source bodies and review duplicate lessons

Joe requested more efficient project collection and protection against the same lesson being published in different words. The local collector now persists metadata stamps, rehashes only new or changed sources, checks for races, exposes body-read counters, and supports an explicit `--rehash` audit. The first collection seeded the cache with zero new candidates; its follow-up dry run skipped 2,128 unchanged bodies and read zero source-body bytes.

The curator now has `inbox compare` for a complete compact knowledge catalog plus bounded related excerpts. Proposal validation requires concrete catalog-bound duplicate-review decisions, exact compared-page hashes, and reuse of the existing destination for the same lesson. Apply and export check freshness, export verifies the target worktree catalog, and immutable proposal digests include the decisions. Semantic judgments stay with the curator; word similarity alone cannot discard evidence. No candidates were resolved or knowledge pages published during this change.

Existing dirty official-reference and knowledge work was preserved. Joe subsequently authorized issue-linked commit, PR and merge delivery and daily-curator adoption under [issue 49](https://github.com/JFusco/brain/issues/49). No source registration, external embedding service, dependency, memory modification, backup, or other-project change is included. New tests, fixtures, dedicated QA and review-agent audits remain deferred per AGENTS.md. Runtime command and wiki integrity outcomes are recorded below after completion.

Verification: syntax checks passed for all six changed JavaScript modules. The final runtime privacy/content command passed with 1,763 files, zero issues and zero warnings; strict official integrity passed. Wiki graph generation and integrity passed (37 nodes, 96 edges). Scoped plan discovery found no undiscovered plan candidates, and whitespace checks passed. The existing-candidate comparison returned ten published catalog entries and six related excerpts. No actual semantic publication or rejection was performed, so these outcomes do not establish paraphrase-detection recall or an unattended curation result.

Rollback: restore only the scoped collector, comparison, proposal, CLI and instruction changes. Preserve ignored collection history and candidate evidence. Older collectors ignore the additional stamps and remain able to calculate hashes; historical proposal digests remain separately verifiable. Resume an interrupted publication using its original immutable evidence rather than changing the digest.

## Authorized delivery and daily adoption

[Issue 49](https://github.com/JFusco/brain/issues/49) tracks the delivery from current remote main in an isolated branch, preserving the primary checkout's unrelated edits. Strict runtime/privacy checks passed with 1,784 scanned files and no issues or warnings; strict official integrity passed; syntax and whitespace checks passed. No PR template or PR lint tooling exists in this repository. Generated wiki data is rebuilt against the current remote history rather than replacing it with the older primary-checkout graph.

The existing daily curator prompt was updated and read back exactly. It now loads the merged procedure from fetched main, runs candidate and proposed-text comparisons, reviews equivalent meaning across the compact catalog and relevant full pages, records digest-bound decisions, and rechecks changed catalogs. Missing merged CLI support is an actionable deployment dependency, never permission to bypass guards. Its active status, name, 03:15 New York schedule, target chat and twelve-candidate budget remain unchanged. Backups remain disabled and privacy/uncertainty controls remain in force. This verifies the saved configuration; a future unattended semantic publication remains unproven.
