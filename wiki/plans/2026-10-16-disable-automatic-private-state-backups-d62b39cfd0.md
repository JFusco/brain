---
status: "implemented"
executed: true
evidence: ["JFusco/brain#8; scripts/lib/maintenance.mjs; maintenance and dry-run both skipped backup work"]
source_tool: "repository"
source: "/Users/joe.fusco/Projects/brain/.state/disable-backups-plan.md"
topics: ["automatic-knowledge-maintenance"]
digest: "d62b39cfd03db0d8c9ef7b5f3945e26e4c050345bd951bf0d066353dab1c4e14"
---

# Disable automatic private-state backups

Joe no longer wants backups. Scope is JFusco/brain issue 8.

- Default automatic backups to disabled; skip creation, inventory previews and retention pruning in maintenance and its dry-run mode.
- Expose the disabled setting in status and suppress backup requirement alerts while disabled.
- Remove backup/upload work from the existing daily publisher and one-time 4 a.m. verification while preserving their timing and remaining scope.
- Preserve existing local archives, recovery keys, Drive files and receipts; retain explicitly requested manual recovery commands.
- Update current instructions, README, status and wiki. Use existing runtime/privacy/wiki checks; keep tests, fixtures and review-agent audits deferred.

Implemented evidence: brain.config.json, scripts/lib/maintenance.mjs and scripts/lib/backup.mjs. Actual maintenance and dry-run execution both returned skipped with reason Automatic backups are disabled; status returned automaticEnabled false, no backup alerts and no operational failures. Existing link restriction/network warnings remain. The daily publisher and one-time verification were updated through the app without changing schedules or creating duplicate jobs. Publication status is tracked in the linked issue and PR.
