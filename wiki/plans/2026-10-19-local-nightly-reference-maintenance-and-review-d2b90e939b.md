---
status: "implemented"
executed: true
evidence: ["scripts/nightly.mjs", "scripts/lib/maintenance.mjs", "Local workflow-state readback and manual runtime checks; no Git delivery or unattended proof"]
source_tool: "codex"
source: "repository:local-nightly-maintenance"
topics: ["automatic-knowledge-maintenance"]
digest: "d2b90e939b73538fd7a594c3c3ccb0692de21e7489aa097b3195bb50fbbb0f49"
---

# Local nightly reference maintenance and review

1. Inspect actual scheduled/manual execution receipts and current code, preserving private content and failures.
2. Disable reference-health and catalog-sync GitHub workflows; preserve the separate Wiki integrity PR check.
3. Preserve the dirty checkout and fast-forward local main to the merged implementation without reviving retired harvesting or proposal machinery.
4. Reuse the existing local automation for nightly refresh, bounded links, stale-first capture curation, review before merge and exact merged-byte verification. Pause the obsolete separate verifier.
5. Retain a durable daily claim, bounded retries and stage/check/publication receipts. Require original-ID reconciliation rather than lease takeover.
6. Exercise actual local source refresh, bounded links and existing runtime/wiki checks. Distinguish manual setup from future unattended proof. Do not add tests or perform unrequested Git delivery.
7. Preserve the exact diagnostic diff and results, remove only the owned temporary worktree/branches, record wiki history and validate it.
