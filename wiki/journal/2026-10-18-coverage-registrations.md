---
title: "Coverage registrations: TypeScript, accessibility and Optimizely CMS 13"
topics: ["automatic-knowledge-maintenance"]
plans: ["2026-10-18-brain-phase-3-follow-up-fresh-catalogs-weekly-discovery-and-new-coverage-a95db4041b.md"]
issue: 'https://github.com/jfusco/brain/issues/60'
issues: ['https://github.com/jfusco/brain/issues/60']
---

# Coverage registrations

[Issue 60](https://github.com/JFusco/brain/issues/60) registers official documentation for stacks Joe works in that Brain didn't catalog yet. It's the second half of the [phase 3 follow-up](2026-10-18-phase-3-follow-up.md). The catalogs were built and verified by **Brain catalog sync** on the PR branch, because the cloud session can't reach vendor sites.

## Registered

- **New domains**, each with a hub and capture keywords: `typescript`, `accessibility` (which takes over the `accessibility` and `a11y` keywords from `frontend`) and `cms/optimizely-paas`.
- **`typescript-docs`:** the typescriptlang.org sitemap index. It covers 269 pages: the handbook, declaration files, and the TSConfig reference.
- **`w3c-accessibility`:** the WAI sitemap, with 132 pages. The sitemap lists the ARIA Authoring Practices Guide; the WCAG 2.2 and WAI-ARIA 1.2 specifications and the WCAG 2.2 Understanding and Techniques indexes are added as extra pages, because the WAI sitemap doesn't list them.
- **`optimizely-cms13-docs`:** docs.optimizely.com `llms.txt`, filtered to `/cms-13/`. It covers 498 docs and API pages. The old docs.developers.optimizely.com version path redirects there, which is where the SaaS catalogs already come from.

## Not registered

Each was attempted twice from GitHub-hosted runners, and a source that can't be retrieved isn't registered.

| Source | Result |
|---|---|
| doc.sitecore.com (SitecoreAI `/sai/en/developers/` and XP 10.4 `/xp/en/developers/104/`) | HTTP 403 on its sitemap |
| contentful.com documentation `llms.txt` | HTTP 429 |

- Their website pointers stay, and the README coverage table records the refusals.
- The nested-`llms.txt` crawling written for Contentful was removed with it.
- The weekly coverage review can revisit these if a retrievable official index appears.

## Verification

Brain catalog sync made four runs on the PR branch:
1. **Run 1:** W3C succeeded.
2. **Run 2:** the TypeScript `/sitemap.xml` returned 404, and the Optimizely developer-docs path redirected off its approved host.
3. **Run 3:** TypeScript (`/sitemap-index.xml`) and Optimizely CMS 13 succeeded.
4. **Run 4:** with the blocked sources withdrawn and `/tsconfig` added, the run was green.

Each run's commit passed the pre-commit guard. Locally, `check` passes, the hubs list the catalogs, and `lookup` returns official pages:
- `--domain typescript` for generics and narrowing;
- `--domain accessibility` for the modal dialog pattern;
- `--domain cms/optimizely-paas` for content types.

The workflow also gained one line: it prints the sync result to the job log, because the GitHub API doesn't expose step summaries.
