---
title: "Project cleanup and selective collection"
topics: ["automatic-knowledge-maintenance"]
plans: ["2026-10-17-clean-brain-s-inbox-and-reduce-project-clutter-97c2efc2fd.md"]
issue: 'https://github.com/jfusco/brain/issues/27'
issues: ['https://github.com/jfusco/brain/issues/27']
---

# Project cleanup and selective collection

The user approved cleanup of the existing Brain project, future collection, and navigation, then explicitly expanded the scope to demonstrably unused code/setup files and deduplication. The initial plan excluded Git delivery; the user subsequently asked to continue and follow the AGENTS.md Git rules. [Issue 27](https://github.com/JFusco/brain/issues/27) was created with existing labels and read back before creating `codex/27-project-cleanup`. A separate clean worktree pulled current remote main with `--ff-only`; the dirty primary checkout was preserved. The dirty checkout's unrelated reference refresh and note changes were preserved.

## Changes

Collection now selects project topic notes and authored skill sources, preserving vendor provenance and quarantine classification. It no longer enumerates raw memory roots or collects repository instructions, indexes, or implementation journals. The collection version is separate from the privacy fingerprint, so this source-selection change does not invalidate existing candidate approvals or identities. Existing explicit captures and project integrations remain available. Version-aware due checks reprocess eligible sources on the next collection; dry-run reporting includes exclusion counts.

The full 34-entry Vercel plugin catalog is listed once in the Vercel hub. React retains its direct React review entry and a link to that catalog; Next.js links to it rather than repeating the full list. This removes 67 repeated skill entries from those two hubs. Generated sections use the same rule on future refreshes. The knowledge index links to the detailed usage guide rather than repeating its procedure.

Four unused core exports (`HOME`, `slash`, `stable`, and `run`), eight unused import bindings including their dependencies, and two directory placeholders were removed after reference inspection. Setup, recovery and maintenance tools remain reachable and were retained. The root status page now presents current behavior; its former text is preserved as [explicit historical evidence](2026-10-17-status-history.md). The README no longer presents an earlier Sitecore HEAD restriction as current coverage.

## Inbox and duplicate audit

All 3,075 pending candidates were structurally screened in 257 batches of at most 12; quarantined bodies were not opened. Exact-content comparison found no duplicate inbox groups, including comparison that ignores only source session/modified metadata while retaining domain, class, and other source metadata. Repeated titles alone were not treated as duplicates.

The initial pass rejected eighteen reviewed records from the active queue: four navigation indexes, ten status-only project logs, two role profiles, and two repository-specific operating rules. The twelve-log manual batch retained two items with potentially useful mechanisms or decisions. Candidate files, source bytes, dispositions, and private audit records remain available; nothing was accepted or published by this cleanup.

At the end of the initial pass, 3,057 candidates remained for semantic curation. The structural screen identified 1,232 historical logs that may contain useful lessons; it did not establish that all such logs are irrelevant. No claim is made that every remaining candidate is useful or fully curated. Private batch receipts retain candidate hashes, reasons, original dispositions and applied outcomes for precise rollback.

A byte-level audit of 1,104 tracked files found 244 duplicate groups, all within versioned vendor snapshots. Their manifests and version/provenance relationships require preservation. There were no exact duplicate groups outside vendor material. The current lookup inventory had 5,791 entries with no repeated source/revision/kind/URL identities, so no lookup deduplication code was added.

## Verification and limits

The collection preview reported 2,527 discovered sources, 1,232 implementation-journal exclusions, two index/instruction exclusions, zero unreadable sources, and two possible new candidates. It wrote no candidates. This preview is not an actual collection or unattended scheduler execution.

Official integrity passed. An initial runtime content/privacy check passed for 1,666 files before the final documentation changes. Final runtime content/privacy checks passed with no warnings for 1,667 files. All 23 maintained Node modules passed syntax checks; the named-import scan found no remaining unused bindings. Scoped plan discovery returned no unmatched repository plans. Wiki generation and integrity passed with 24 nodes and 59 edges. The first wiki run found a relative-link error after relocating the old status page; its archive links were corrected before the passing run. Whitespace/diff validation passed. Eleven pre-existing modified files outside the intentionally regenerated React/Next.js hubs matched their preserved starting bytes. Tests, fixtures, CI, fresh-session checks, dedicated QA and review-agent audits remain deferred. Automatic backups and Drive uploads remain disabled.

A further individually reviewed cross-domain batch of twelve rejected five status-only records and retained seven mixed or potentially useful records. Hash-bound decisions and actual outcomes are under ignored private curation-triage storage. Cumulative rejections are 23; 3,052 candidates remain. Related key-normalization records were retained separately because edit-time normalization and cross-system identity consistency are distinct lessons. Earlier receipts are preserved as historical records rather than rewritten to imply a later review procedure was already in force.

The executed plan is partial specifically because full semantic review of the retained inbox is outstanding. The collection, navigation, code and current-status cleanup is applied locally. Revert only this cleanup's changes or recorded dispositions; do not restore over later edits or discard unrelated refresh work.

## Issue-linked delivery verification

The delivery branch starts at refreshed remote main `be035c7`. Content/privacy checks passed for 1,671 files with no warnings; official integrity and syntax for all 23 Node modules passed. Scoped wiki discovery returned no unresolved candidates, and graph/integrity passed with 28 nodes and 70 edges. The primary checkout was not pulled or switched because its unrelated dirty state required preservation; the separate clean worktree ran `git pull --ff-only origin main` before creating the issue branch. The existing pre-commit privacy guard remains enabled. No test suites, fixtures, fresh-session tests, dedicated QA, review agents or additional CI were added or claimed. This code/policy cleanup stops at a verified pull request; it is not an automatic maintenance merge.
