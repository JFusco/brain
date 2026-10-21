---
title: "Performance, Security and Semantics reference hubs"
topics: [automatic-knowledge-maintenance]
plans: [2026-10-21-add-performance-security-and-semantics-reference-hubs-2da6a0ec3d.md]
---

# Performance, Security and Semantics reference hubs

Implemented locally on October 21, 2026 from baseline `5c3b9987cf15feac551ef76db8fe2e97d45a0561` in a detached worktree. The primary checkout's unrelated edits were preserved. The initial implementation stopped uncommitted; Joe subsequently authorized commit, connector publication, merge and cleanup through [issue 101](https://github.com/JFusco/brain/issues/101). The executed plan is partial because one required selective retrieval failed.

## Scope and decisions

Added the [Performance](../../knowledge/performance/INDEX.md), [Security](../../knowledge/security/INDEX.md) and [Semantics](../../knowledge/semantics/INDEX.md) hubs, main-index links, reciprocal Frontend/Accessibility/React/Next.js links and related vendor/CMS links. All three retain `No curated notes yet.` Semantics distinguishes HTML meaning/native controls, structured/linked data, content/domain models and experimental semantic search.

Registered reference-only OWASP and Schema.org sitemap collections with 5,000-page and 32-index bounds, plus the seven specified website pointers. Existing vendor assignments remain unchanged. Schema.org's datamodel title uses the existing additional-page override. The README distinguishes catalogs from pointers, records upstream licensing references and extends the watch list. web.dev remains pointer-only based on the planning review's observed sitemap timeouts and archived repository; this run did not repeat that investigation.

Added three public domain values and appended their keywords. The existing substring classifier, tie order and WordPress exception are unchanged. No tests, practice notes, collectors, graph/UI code or search schemas were added.

## Local verification

- Node `v24.14.0`; existing `scanner()` binary/hash/version validation passed before synchronization. The existing private profile was copied opaquely with mode `0600`; its contents were not inspected. The temporary parent and worktree `.state/` use `0700`; local config and state are ignored. No operational stores were copied.
- Separate local `official sync` calls each reported the source in `changed`, with empty `failed` and `skipped`, one successfully fetched index and `maxIndexes: 32`.
- OWASP: 137 pages, 40,531 bytes, revision `6d07d8e422d2f2e96d3b1304a9d16b7f54e1b4ccd472bc6745fee122153d3775`, catalog hash `4ad611ae601034742aa0efb2ba4be224ffceee8e0a112de64dda3fd5748650e4`.
- Schema.org: 12 pages, 2,183 bytes, revision `fd5f6e3f496d0f569a651cc9f87b867dc9659da7d6ad010607c5bf1501822dee`, catalog hash `665e891b1788f2f24ba86bbfb0dcd417c90a8b45f844e8dbec97ef022176a47d`.
- Both catalogs are nonempty, within 5,000 pages / 1 MiB, with matching lock revision and hash.
- All ten one-off configuration-backed `domainFor()` checks matched the plan, including `input handling` → `_unsorted`, `semantic HTML` → `frontend` and both WordPress cases. Inspection of `capture()` confirms valid explicit-domain precedence: `Next.js caching` can be explicitly assigned to `performance`; capture was not invoked and no inbox records were created.
- `curation hubs` exited 0 with no additional changes. Initial `check` exited 0, `ok: true`, no issues/warnings, 224 files scanned. `official check` exited 0, `ok: true`, no issues/warnings.
- All nine domain-filtered `lookup --limit 5` expectations matched the intended URL and kind: seven `official-pointer` results and the OWASP authentication / Schema.org datamodel `official-page` results.
- `lookup --limit 1 --fetch` passed for Core Web Vitals (1,543 excerpt characters), OWASP authentication (445) and Optimizely Graph semantic search (2,500), with intended URLs, fetch timestamps and content hashes.
- **Incomplete:** Schema.org `structured data model --limit 1 --fetch` ranked the intended `https://schema.org/docs/datamodel.html` page but returned `retrieval.ok: false`, error `Documentation page is unavailable or challenged`, and no excerpt. The CLI exit was 0; this does not satisfy retrieval acceptance. No fallback or guard bypass was used. The failure remains in the private worktree verification record.

These are bounded catalog/routing/retrieval observations, not full technical or link audits. Local lookup reads worktree data; visual graph visibility remains deferred until separately authorized publication to committed main. No hosted maintenance, commit, push, PR or merge occurred. Future source registration delivery requires the prescribed issue-linked PR process.

## Completion checks

Scoped plan discovery exited 0 with zero candidates, matches or ambiguities. Wiki graph generation exited 0 with 96 nodes / 256 edges, and wiki integrity passed. Final `curation hubs` exited 0 with no changes; `check` exited 0 with 226 files scanned and no issues/warnings; `official check` exited 0 with no issues/warnings; wiki integrity and `git diff --check` passed. The primary HEAD and porcelain status exactly match the recorded baseline. The private worktree completion report retains command outputs.

## Authorized Git delivery

Delivery uses `codex/101-reference-hubs` from the unchanged current main baseline. Issue 101 was created and read back through the GitHub connector after the app was installed on the repository owner account. The initial incomplete Schema.org datamodel retrieval remains recorded above; publication does not convert it into successful retrieval. The normal privacy pre-commit and pre-push checks remain required, and merge requires passing Wiki integrity on the exact PR head.
