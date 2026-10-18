# Implementation status

Brain provides on-demand frontend/CMS knowledge lookup, read-only project-skill suggestions, and manual private lesson capture. Start at [the knowledge index](knowledge/INDEX.md); use [the README](README.md) for commands.

## Simplification

- [Phase 1](wiki/journal/2026-10-18-simplification-phase-1.md) added the opt-in `brain` skill, fixed `lookup` on fresh clones, and removed backup tooling and the wiki sync workflows.
- Phase 2 ([issue 54](https://github.com/JFusco/brain/issues/54)) makes publishing an ordinary Git change. A merged note with `status: current` is published, with no approval ledger or proposal export. Lessons arrive through the manual `brain-capture` skill instead of nightly project harvesting.
  - The `integration` command and the project skill installer are gone; `skills suggest` remains.
  - The 2,726 pending harvested records stay untouched in the private inbox and are reviewed only on request. The privacy-policy change requires one `inbox rescan`.
- Phase 3 ([issue 56](https://github.com/JFusco/brain/issues/56)) makes `official/` a link registry. It keeps the registry, a slim lock and generated link catalogs (16 files instead of 1,544), with no vendor bodies, rollback history or `official restore`. `check` passes in a fresh clone after setup.
  - A weekly GitHub workflow refreshes catalogs in the runner, samples links and keeps one issue. It replaces the daily Codex-investigated publisher and its watch.
  - Registry edits are ordinary PRs; lock policy hashes and `inbox propose`/`apply` are gone. The LaunchAgent and `scheduled-run` are removed.

## Delivered cleanup

- Automatic collection selected project topic notes and authored skills, excluding raw memory roots, indexes, repository instructions and implementation journals. Phase 2 removed it.
- React and Next.js link to the full Vercel plugin catalog instead of repeating it. React retains its direct review entry. Knowledge usage instructions have one detailed guide.
- Four unused core exports, eight unused imports, and two redundant directory placeholders were removed. Setup, maintenance and the published notes remain available; phase 3 removed the vendor snapshots, manifests and recovery tools.
- Inbox screening, full retained-baseline semantic review and deduplication record hash-bound decisions privately. Useful or uncertain evidence stays pending with specific reasons and evidence gaps.
- [PR 28](https://github.com/JFusco/brain/pull/28) merged the project cleanup. The primary checkout was reconciled to merged main after verifying all local intent was already upstream and preserving the original state in a recovery stash.
- The original cleanup structurally screened 3,075 candidates, rejected 38 irrelevant records and superseded 28 verified duplicates. All original bodies remain preserved.
- [Completed semantic audit](wiki/journal/2026-10-17-semantic-audit-complete.md) covers all 2,955 retained baseline candidates with individual full-body review receipts. Final original-cohort accounting is 283 rejected, 65 superseded, one accepted and 2,726 retained pending. All 3,075 original bodies remain unchanged, and all duplicate replacement chains retain their bytes.
- [PR 34](https://github.com/JFusco/brain/pull/34) published two officially verified lessons on React hydration and Next.js route parameters. Exact merged-byte verification accepted only their fully reviewed source candidate. Completed review does not mean every retained claim is verified or published.

## Verification and operation

Local verification outcomes and cleanup counts are recorded in [the reconciliation journal](wiki/journal/2026-10-17-cleanup-reconciliation.md). Runtime checks establish structure, privacy and integrity; they do not prove every technical claim or unattended execution.

[Contentful access repair](https://github.com/JFusco/brain/issues/41) replaces the throttled landing-page pointer with verified official API/JavaScript SDK Markdown entry points. Both retrieval and the unchanged checker returned 200, and focused lookup cached excerpts only. Historical failures remain retained; unused URLs leave active coverage through normal registry reconciliation.

Use `node scripts/brain.mjs maintenance status` for publication attempts and failures, catalog freshness, local link counts and stale notes; the weekly reference health issue reports hosted catalog changes and link warnings. A configured schedule alone is not proof of execution.

Backup tooling, previously disabled, has been removed; existing private archives and keys were not touched. Tests, fixtures, CI, fresh-session checks, dedicated QA, and review-agent audits remain deferred for v1.

## History

Earlier status text, including dated counts and incident outcomes, is retained as [historical implementation status](wiki/journal/2026-10-17-status-history.md). [Maintenance history](wiki/topics/automatic-knowledge-maintenance.md) records the decisions and original evidence. Historical failures and partial observations are preserved rather than presented as current status.
