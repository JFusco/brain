---
title: "Retained inbox semantic curation"
topics: ["automatic-knowledge-maintenance"]
plans: ["2026-10-17-curate-the-retained-brain-inbox-81de1bc8dc.md"]
issue: 'https://github.com/jfusco/brain/issues/33'
issues: ['https://github.com/jfusco/brain/issues/33']
---

# Retained inbox semantic curation

The user explicitly asked to continue after [cleanup reconciliation](2026-10-17-cleanup-reconciliation.md) left 3,009 candidates pending. [Issue 33](https://github.com/JFusco/brain/issues/33) begins the semantic continuation. This is manual work, distinct from the configured nightly twelve-candidate review limit or an unattended scheduler execution.

## Individual review and dispositions

Eight bounded batches fully reviewed 93 candidates: an initial twelve across React, Next.js, frontend, Vercel, CMS, Tailwind and unsorted evidence, followed by seven batches of shorter historical log entries (the final batch contained nine). Selection by size bounded reading cost; rejection required the complete content to contain no reusable guidance or evidence.

Forty-eight records were rejected after individual review. Examples include task-start notifications without concurrency behavior, handoff announcements without assertion contents, plan-registration records without decisions, feature lists without mechanisms and unfilled delivery evidence. Original bodies, metadata and prior dispositions remain private historical evidence. Rejection is not source deletion.

Forty-five useful or mixed candidates stayed pending at the review checkpoint. Specific retained portions include multi-replica replay races, credential-precedence diagnosis, immutable identity versus adapter binding, editor canonicalization baselines, server/client field-constraint parity, cold-route compilation budgets and click-dismissal event ordering. Each private record names the useful portion, unresolved material and required evidence. Historical instructions were not executed or adopted; synthetic success and failed/blocked checks were not promoted to live acceptance.

The first checkpoint pending count was 2,961 before publication acceptance. Two further full twelve-candidate batches reviewed Contentstack, SitecoreAI, Optimizely and Vercel-tagged material. Four more records were rejected: dependency-bump reconciliation placeholders and repository-specific operating instructions without transferable content. One older payload-validation skill was superseded by a fully read expanded copy retaining all original rules and adding a spec-root relocation override. Distinct taxonomy journal/topic records were retained separately rather than deduplicated by title.

Final pre-publication accounting for this continuation is 117 fully reviewed, 52 rejected, one superseded and 64 retained pending (including the publication source). Pending inventory is 2,956; cumulative original-cohort rejections are 90 and superseded copies are 29. This does not complete semantic review of the remaining inbox. No broad heuristic disposition or quarantine-body inspection was used.

## Supported publication

One fully reviewed record contains two concise fixes. Both are covered by the exported proposal:

- [React hydration and browser storage](../../knowledge/react/hydration-browser-storage.md): preserve matching initial output, defer necessary browser-only content until after mount, and account for two-pass rendering cost. Scope is React/React DOM 19.3; the historical application walkthrough was not repeated.
- [Next.js dynamic route parameters](../../knowledge/nextjs/async-route-parameters.md): await promised App Router context parameters before accessing their values. Version context is Next.js 16, verified against 16.0.0 and current documentation, with installed-release checks required.

The React useEffect/hydrateRoot pages at `reactjs/react.dev@046f17d04295ba047bb5739026b4ac3110f17028` and Next.js route reference at `vercel/next.js@950609f96f694c5475d18cd2d72a0052ca04d4b9` were hash-verified against Git blobs. Current official React and Next.js pages agree on these mechanics. Only focused excerpts and receipts are cached. Existing effect-response cleanup and version-matched-documentation notes remain separate; the new pages do not repeat them.

Exact proposal digest: `963964b8067344583e4263358b924bf7c36220d53116ba379030a0a9471e572e`. The proposal accepts only its fully reviewed source candidate after `curation record-merge` verifies the exported pages, hubs and approval bytes in merged main. The other 63 retained records are not accepted by this proposal.

## Maintenance, verification and rollback

Due-time maintenance completed without failures: zero stale notes; four unchanged owned expired excerpt-cache files removed (5,902 bytes); seven managed cache files retained. Link sampling was not due. Automatic backups and Drive uploads remain disabled. Earlier restricted/rate-limited link observations remain visible; current sampling is not whole-catalog health.

Publication start is recorded with the actual manual trigger and active run ID. The issue was created/read back before the issue branch; export uses an isolated worktree from refreshed main. Runtime/privacy, official integrity and scoped wiki checks are required before the verified PR/head and automatic maintenance merge. The initial isolated-worktree checks failed because Git had not carried ignored snapshot-cache files into the checkout. The failure receipts remain private. Only 231 missing manifest-owned files were copied from verified canonical cached bytes; no existing file was overwritten. Afterward runtime content/privacy passed for 1,677 files without issues or warnings, and official integrity passed. Scoped plan discovery returned zero unresolved plans; graph/integrity passed with 32 nodes and 83 edges, and whitespace validation passed. The native staged privacy guard passed for 1,585 files.

Tests, fixtures, fresh-session checks, dedicated QA, review agents and added CI remain deferred.

Rollback reverts only the relevant published pages and restores dispositions from the private hash-bound prior state without overwriting later decisions. Preserve original source bytes and failed or partial evidence. A reverted publication requires reconciliation of its approval ledger and accepted candidate; do not blindly replay the old proposal over changed destinations.
