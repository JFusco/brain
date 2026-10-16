---
title: "Disable automatic private-state backups"
topics: [automatic-knowledge-maintenance]
plans: [2026-10-16-disable-automatic-private-state-backups-d62b39cfd0.md]
issue: 'https://github.com/jfusco/brain/issues/8'
issues: ['https://github.com/jfusco/brain/issues/8']
---

# Disable automatic private-state backups

Joe withdrew the backup requirement after the reliability delivery. [Issue 8](https://github.com/JFusco/brain/issues/8) disables automatic archive creation, backup inventory previews, retention pruning and Google Drive uploads. Existing local archives, the recovery key, Drive files and private receipts remain intact. Explicit manual recovery commands remain available for a separately scoped request.

`maintenance.backupEnabled` is false. Runtime and dry-run maintenance both skip backup work, and status exposes `automaticEnabled: false` without missing, stale or local-only backup alerts. Disabled backup failures do not obscure the health of collection, reference refresh, curation, link checks and excerpt-cache maintenance.

The existing 03:15 publisher and one-time 04:00 verification prompts were updated through the app, retaining their schedules and remaining scope. The verification expects backups/uploads to be disabled. No recurring backup job or replacement verification was created.

Actual runtime outcomes: maintenance and dry-run both returned skipped with the explicit disabled reason, no backup retention work, and no operation failures. Status reported no backup alerts; existing link restriction/network warnings remain. Syntax checks passed. Existing runtime/privacy and wiki checks provide structural/integrity evidence; tests, fixtures and review-agent audits remain deferred. Delivery/hosted outcomes are recorded in the issue-linked PR.

Rollback restores prior code/configuration only if desired; re-enabling backup creation or upload requires Joe's instruction. Never delete retained artifacts or keys as part of rollback. See [the maintenance topic](../topics/automatic-knowledge-maintenance.md).
