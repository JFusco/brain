# Implementation status

Brain provides on-demand frontend/CMS knowledge lookup, selected project-skill management, and private lesson capture. Start at [the knowledge index](knowledge/INDEX.md); use [the README](README.md) for commands.

## Delivered cleanup

- Automatic collection selects project topic notes and authored skills. Raw memory roots, indexes, repository instructions, and implementation journals are excluded. Explicit captures and existing project capture integrations remain available.
- React and Next.js link to the full Vercel plugin catalog instead of repeating it. React retains its direct review entry. Knowledge usage instructions have one detailed guide.
- Four unused core exports, eight unused imports, and two redundant directory placeholders were removed. Setup, maintenance, recovery tools, vendor snapshots, manifests, and the ten published notes remain available.
- Inbox screening, full retained-baseline semantic review and deduplication record hash-bound decisions privately. Useful or uncertain evidence stays pending with specific reasons and evidence gaps.
- [PR 28](https://github.com/JFusco/brain/pull/28) merged the project cleanup. The primary checkout was reconciled to merged main after verifying all local intent was already upstream and preserving the original state in a recovery stash.
- The original cleanup structurally screened 3,075 candidates, rejected 38 irrelevant records and superseded 28 verified duplicates. All original bodies remain preserved.
- [Completed semantic audit](wiki/journal/2026-10-17-semantic-audit-complete.md) covers all 2,955 retained baseline candidates with individual full-body review receipts. Final original-cohort accounting is 283 rejected, 65 superseded, one accepted and 2,726 retained pending. All 3,075 original bodies remain unchanged, and all duplicate replacement chains retain their bytes.
- [PR 34](https://github.com/JFusco/brain/pull/34) published two officially verified lessons on React hydration and Next.js route parameters. Exact merged-byte verification accepted only their fully reviewed source candidate. Completed review does not mean every retained claim is verified or published.

## Verification and operation

Local verification outcomes and cleanup counts are recorded in [the reconciliation journal](wiki/journal/2026-10-17-cleanup-reconciliation.md). Runtime checks establish structure, privacy and integrity; they do not prove every technical claim or unattended execution.

[Contentful access repair](https://github.com/JFusco/brain/issues/41) replaces the throttled landing-page pointer with verified official API/JavaScript SDK Markdown entry points. Both retrieval and the unchanged checker returned 200, and focused lookup cached excerpts only. Historical failures remain retained; unused URLs leave active coverage through normal registry reconciliation.

Use `node scripts/brain.mjs maintenance status` for observed collection/publication attempts, failures, source freshness, and sampled link coverage. A configured schedule alone is not proof of execution.

Automatic backups and Drive uploads are disabled. Tests, fixtures, CI, fresh-session checks, dedicated QA, and review-agent audits remain deferred for v1.

## History

Earlier status text, including dated counts and incident outcomes, is retained as [historical implementation status](wiki/journal/2026-10-17-status-history.md). [Maintenance history](wiki/topics/automatic-knowledge-maintenance.md) records the decisions and original evidence. Historical failures and partial observations are preserved rather than presented as current status.
