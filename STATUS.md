# Implementation status

Brain provides on-demand frontend/CMS knowledge lookup, selected project-skill management, and private lesson capture. Start at [the knowledge index](knowledge/INDEX.md); use [the README](README.md) for commands.

## Delivered cleanup

- Automatic collection selects project topic notes and authored skills. Raw memory roots, indexes, repository instructions, and implementation journals are excluded. Explicit captures and existing project capture integrations remain available.
- React and Next.js link to the full Vercel plugin catalog instead of repeating it. React retains its direct review entry. Knowledge usage instructions have one detailed guide.
- Four unused core exports, eight unused imports, and two redundant directory placeholders were removed. Setup, maintenance, recovery tools, vendor snapshots, manifests, and the eight published notes remain available.
- Inbox screening and deduplication record decisions privately. Retained mixed evidence remains pending; structural screening is not completed semantic curation.
- [PR 28](https://github.com/JFusco/brain/pull/28) merged the project cleanup. The primary checkout was reconciled to merged main after verifying all local intent was already upstream and preserving the original state in a recovery stash.
- The original 3,075 pending candidates were structurally screened: 38 individually reviewed irrelevant records were rejected and 28 verified duplicates superseded. The remaining 3,009 stay pending for semantic curation. All original bodies are preserved; cleanup accepted or published no candidates.

## Verification and operation

Local verification outcomes and cleanup counts are recorded in [the reconciliation journal](wiki/journal/2026-10-17-cleanup-reconciliation.md). Runtime checks establish structure, privacy and integrity; they do not prove every technical claim or unattended execution.

Use `node scripts/brain.mjs maintenance status` for observed collection/publication attempts, failures, source freshness, and sampled link coverage. A configured schedule alone is not proof of execution.

Automatic backups and Drive uploads are disabled. Tests, fixtures, CI, fresh-session checks, dedicated QA, and review-agent audits remain deferred for v1.

## History

Earlier status text, including dated counts and incident outcomes, is retained as [historical implementation status](wiki/journal/2026-10-17-status-history.md). [Maintenance history](wiki/topics/automatic-knowledge-maintenance.md) records the decisions and original evidence. Historical failures and partial observations are preserved rather than presented as current status.
