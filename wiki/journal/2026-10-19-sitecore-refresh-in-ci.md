---
title: "Sitecore catalogs refresh in CI"
topics: ["automatic-knowledge-maintenance"]
issue: 'https://github.com/jfusco/brain/issues/66'
issues: ['https://github.com/jfusco/brain/issues/66']
---

# Sitecore catalogs refresh in CI

[Issue 66](https://github.com/JFusco/brain/issues/66) removes `doc.sitecore.com` from `runnerBlockedHosts`, so the weekly workflow and **Brain catalog sync** refresh both Sitecore docs catalogs without Joe's Mac. It follows the [Sitecore catalogs and runner policy](2026-10-18-sitecore-catalogs-and-runner-policy.md) delivery.

## Why

[PR 63](https://github.com/JFusco/brain/pull/63) listed doc.sitecore.com as runner-blocked after two Brain catalog sync runs got HTTP 403. [PR 65](https://github.com/JFusco/brain/pull/65) then found the 403 came from collection index requests sent without an Accept header. With the header, the product sitemaps returned 200 locally. That raised a question: had the runners been blocked at all?

## Evidence

- **Test commit.** `530e5ad` removed only the host from the registry.
- **Hosted Sitecore sync.** [Brain catalog sync run 39178888939](https://github.com/JFusco/brain/actions/runs/39178888939) on that commit ran `official sync --hosted sitecoreai-docs sitecore-xp-docs` on a GitHub-hosted runner.
  - Both sources returned `unchanged`, with `failed: []` and `skipped: []`.
  - `check` reported `ok: true`, and there was no catalog commit.
  - The runner rebuilt both catalogs byte-for-byte from doc.sitecore.com.
- **Hosted Accept-header check.** [Brain catalog sync run 39178545737](https://github.com/JFusco/brain/actions/runs/39178545737) refreshed the seven other hosted collection sources with the new header. All were unchanged, with no failures.

## Limits

- **Links are untested.** Link sampling for doc.sitecore.com resumes in the weekly workflow. Its first run after merge is the first hosted link check, which uses HEAD with a GET fallback; the Mac saw HEAD 403 then GET success.
- **Contentful stays listed.** www.contentful.com answers automated requests from every client tried with a Vercel HTTP 429 challenge, so it stays on the list. Its catalog remains pending in [issue 64](https://github.com/JFusco/brain/issues/64).
- **Rollback.** Revert the commit, or re-add the host if the runners start receiving 403 again.
