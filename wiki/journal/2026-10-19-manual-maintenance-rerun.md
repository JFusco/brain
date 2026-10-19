---
title: "Explicit manual maintenance reruns"
topics: [automatic-knowledge-maintenance]
---

# Explicit manual maintenance reruns

[Issue 81](https://github.com/JFusco/brain/issues/81) adds an explicit manual-only rerun reason so Joe can request an additional run after the daily completion. Each rerun retains its own run/publication IDs and completion, with separate three-attempt-per-date accounting and one-hour failure backoff. The scheduled completion and historical receipts are preserved. Shared locks, active-run reconciliation, review, exact-head checks, guarded merge and final merged-byte verification still apply.

The one existing local automation now runs daily at 5 p.m. America/New_York. References and links come first, then stale guidance and pending captures; review and publication apply separately to catalog and knowledge PRs. The runner's 03:15 eligibility boundary remains an internal due-date rule. Reference Actions remain disabled; Wiki integrity remains required. No private operational state is published.

Validation uses the existing runtime content, official-reference and wiki checks and the subsequent explicitly requested real manual run. Configuration and local checks are distinct from future unattended execution. Tests, fixtures and implementation audits remain deferred. Rollback is reverting the issue's runner change; preserve all receipts.
