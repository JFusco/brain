---
status: "implemented"
executed: true
evidence: ["scripts/lib/nightly-publication.mjs; scripts/nightly-content-review.md; JFusco/brain issue 79"]
source_tool: "repository"
source: "repository:nightly-review-gate"
topics: ["automatic-knowledge-maintenance"]
digest: "a0163043b8513c3166a5eec62cf3675a3caf66093cdb8e5817a291223e0e0ac9"
---

# Enforce nightly content review before publication

1. Register temporary nightly issue branches and bind local approval to the exact
   committed head, baseline and changed-file hashes.
2. Require a separate content reviewer for changed knowledge, while preserving
   author review for catalogs and generated hub sections.
3. Execute existing checks locally; enforce fresh receipts before push and guarded
   merge, preserving Wiki integrity and post-merge byte verification.
4. Update the existing automation, repository instructions and durable wiki record.
5. Deliver issue 79 through a verified PR, merge under Joe's authorization, restore
   the existing nightly schedule and remove the merged delivery branch.

Scope excludes tests, fixtures, dedicated QA, implementation-review audits,
reference-maintenance Actions, other repositories and private-state uploads.
