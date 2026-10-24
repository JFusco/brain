---
title: "Official reference expansion"
aliases: ["browser references", "official source additions"]
---

# Official reference expansion

Each source is delivered in its own issue-linked registration PR. Catalogs contain links and metadata; upstream page bodies are retrieved selectively, never mirrored or executed. Google Search Central is excluded by Joe's request.

## MDN browser platform

[Issue 119](https://github.com/JFusco/brain/issues/119) registers a bounded English sitemap subset under Frontend: HTML, CSS guides, JavaScript guides, HTTP, Fetch, Intersection Observer and Baseline. The 1,500-page and four-index limits refuse partial catalogs. MDN is publisher-maintained documentation; technical standards and project browser requirements retain their own authority. Baseline availability does not establish accessibility, usability or project acceptance.

Prose license metadata preserves CC-BY-SA-2.5 and identifies separate code-example terms. This does not register the full MDN Web API or CSS reference libraries.

## W3C internationalization

[Issue 120](https://github.com/JFusco/brain/issues/120) adds the official HTML authoring index to Frontend and Semantics. Only approved article, question and tutorial links enter the 250-page catalog. The source uses a single explicitly registered static HTML index; scripts, styles and embedded resources are never executed or fetched. Existing Markdown and sitemap indexes retain their formats. Unsupported formats fail registry validation.

Language declarations, locale-specific formatting and text direction remain separate decisions. W3C articles are guidance with their own historical context, not proof of the target CMS implementation. The unverified International sitemap returned 404 during discovery; the retrieved authoring index supplies the catalog instead.

## Playwright

[Issue 121](https://github.com/JFusco/brain/issues/121) registers official JavaScript/TypeScript documentation under Frontend. The sitemap selection includes only `/docs/`, excluding next-version, other-language and community pages. It is reference-only and does not install Playwright or enable Brain tests, fixtures or QA agents. Rolling docs do not establish compatibility with a consuming project's installed runner or browsers.

The first Playwright sync correctly refused 296 links because `/docs/` also contains `/docs/next/`. The registration now explicitly excludes that subtree using validated optional collection path exclusions; the 250-page bound stays in place. This corrects the selected scope rather than treating next-version guidance as stable documentation. The initial failed attempt remains in private operational logs.

## OWASP ASVS

[Issue 122](https://github.com/JFusco/brain/issues/122) adds English ASVS 5.0.0 documents alongside the existing cheat sheets. The stable `v5.0.0_release` commit is pinned as `5cf9b032440be53ce345ab3c130fda46ba1ce7a2`; GitHub's releases/latest resolves to an explicitly named Bleeding Edge release despite `prerelease: false`, so it is deliberately not used. This preserves a stable version boundary and leaves upgrades explicit. Requirement lookup does not assess an application or confer compliance/certification.

The repository archive exceeded the existing 64 MiB download cap and was refused. ASVS now uses the existing bounded Git-tree catalog path, with a validated Markdown documentation suffix so pinned GitHub reading links retain `.md`. No download or archive limit was raised; only selected pages are fetched on demand and verified against their Git blobs. The failed archive attempt remains in private logs.

## web.dev performance

[Issue 123](https://github.com/JFusco/brain/issues/123) expands the existing pointers into a bounded Learn Performance course catalog. The explicitly selected static HTML index admits only `web.dev/learn/performance/` module links, with one-index and 64-page limits. The course and Core Web Vitals pointers remain available. This deliberately avoids a full-site sitemap crawl, translation duplicates and claims of measured performance. Historical sitemap failures remain history, not evidence against the successfully retrieved course index.

## Sitecore Content Hub

[Issue 161](https://github.com/JFusco/brain/issues/161) adds the Content Hub (DAM) cloud developer and user documentation sitemaps to `cms/sitecore-ai` as two bounded link catalogs. Pages the upstream sitemaps list without their `/en` segment are restored explicitly as additional pages rather than by widening the include prefix. API-reference class pages remain outside the catalogs. Content Hub documentation does not establish compatibility with SitecoreAI or Content SDK versions.

## Dedicated tooling domain

[Issue 173](https://github.com/JFusco/brain/issues/173) adds an empty `tooling` domain before any build, test, lint, package or monorepo source is registered. Lookup ranking is lexical on titles and summaries, and a curated note outranks a matching catalog link by only one point, so large new catalogs are kept out of existing domains where they would crowd notes out of the top results. Tooling keywords use distinctive names (`vitest`, `eslint`, `pnpm-workspace`) rather than bare `vite`, `test`, `lint` or `pnpm`, which would misroute captures that merely mention running a command. Design-system and commerce domains follow as separate changes. Candidate hosts stay labeled as candidates until each registration's own verified sync.

## Dedicated design-systems domain

[Issue 175](https://github.com/JFusco/brain/issues/175) adds an empty `design-systems` domain after `tooling`, for design tokens, design-to-code handoff and component libraries. Its keywords (`design token`, `dtcg`, `figma`, `code connect`) avoid a bare `token`. Because it is listed after the existing domains, a capture that ties with `frontend` or `accessibility` keeps the earlier domain. The Design Tokens Community Group format and Figma developer hosts stay candidates until their own verified syncs.
