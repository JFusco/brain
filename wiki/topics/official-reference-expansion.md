---
title: "Official reference expansion"
aliases: ["browser references", "official source additions"]
---

# Official reference expansion

Each source is delivered in its own issue-linked registration PR. Catalogs contain links and metadata; upstream page bodies are retrieved selectively, never mirrored or executed. Google Search Central is excluded by Joe's request.

## MDN browser platform

[Issue 119](https://github.com/JFusco/brain/issues/119) registers a bounded English sitemap subset under Frontend: HTML, CSS guides, JavaScript guides, HTTP, Fetch, Intersection Observer and Baseline. The 1,500-page and four-index limits refuse partial catalogs. MDN is publisher-maintained documentation; technical standards and project browser requirements retain their own authority. Baseline availability does not establish accessibility, usability or project acceptance.

Prose license metadata preserves CC-BY-SA-2.5 and identifies separate code-example terms. This does not register the full MDN Web API or CSS reference libraries.

## Web Platform Baseline

[Issue 181](https://github.com/JFusco/brain/issues/181) adds four exact documents from the W3C WebDX Community Group repository `web-platform-dx/web-features` (Apache-2.0) to Frontend: the Baseline status definition and the repository, `web-features` and `compute-baseline` READMEs. Feature data files are deliberately not catalogued. MDN's Baseline glossary pages remain the reader-facing explanation; these documents add the normative status definition and the packages that compute it. Lookup comparisons kept every Frontend note at its baseline position. Two catalog titles keep the Markdown link syntax of their upstream headings.

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

## Dedicated Salesforce B2B Commerce domain

[Issue 177](https://github.com/JFusco/brain/issues/177) adds an empty nested `commerce/salesforce-b2b` domain after `design-systems`, mirroring the `cms/*` layout so other commerce platforms can sit beside it. Keywords are product phrases (`salesforce b2b`, `b2b commerce`, `lightning web runtime`) rather than bare `salesforce` or `commerce`. [Issue 179](https://github.com/JFusco/brain/issues/179) found the official Commerce Cloud Markdown index (`developer.salesforce.com/docs/llms-commerce-cloud.txt`), which lists the B2B Commerce Developer Guide and the Aura to LWR Migration Guide. It answers curl but returns HTTP 403 to Brain's `personal-brain/1.0` fetcher, so the attempted collection was removed and the domain keeps three retrieved website pointers. Brain's user agent was deliberately not changed to evade the block. Agent web-fetch tools are refused too, so the pointers are for desktop browsers. Several guide pages returned 404 to HEAD and 200 to GET during review, so HEAD probes are not evidence that a Salesforce page is missing.

## Vite

[Issue 183](https://github.com/JFusco/brain/issues/183) registers the first Tooling catalog. `vite.dev/llms.txt` lists relative Markdown links; the source reads `vite.dev/sitemap.xml` instead so reader links stay on the canonical HTML pages, limited to `/guide/`, `/config/` and `/changes/` with one index and a 200-page ceiling. Blog, team and release pages stay out. Pages are fetched as Markdown by appending `.md`. Rolling documentation does not establish compatibility with a project's installed Vite major.

## Vitest

[Issue 185](https://github.com/JFusco/brain/issues/185) adds Vitest to Tooling. `vitest.dev` has no sitemap, but its official `llms.txt` is a Markdown table of contents of relative `.md` links, so the source is a Markdown-index collection limited to `/config`, `/guide` and `/api/`, with a 400-page ceiling. Rolling documentation tracks the current Vitest major.

## Storybook

[Issue 187](https://github.com/JFusco/brain/issues/187) adds Storybook to Tooling from the docs sitemap linked by the official sitemap index, because `storybook.js.org/llms.txt` links only section roots. The source includes `/docs` and excludes `/docs/contribute`; both prefixes omit a trailing slash so the docs root is kept and the contributor root is dropped. Titles are path-derived, as in other sitemap catalogs. Rolling documentation covers the current Storybook major and does not establish compatibility with an installed version or framework package.

## axe-core rule help

[Issue 189](https://github.com/JFusco/brain/issues/189) adds rule-level references for automated accessibility results. The `dequelabs/axe-core` repository describes every rule in one Markdown file, which would be a single catalog entry, so the source instead reads Deque's static axe 4.14 rule index: one page per rule, the `helpUrl` targets in axe results. The version is fixed in the URL and matches the latest stable axe-core release at registration; a new release needs an explicit registration change. Deque's `robots.txt` blocks named AI crawlers from some sections and general agents from older rule versions, but not from `/rules/axe/4.14/`. Rule IDs become the catalog titles, so lookups by rule ID or its words match directly. Automated rules cover part of WCAG and never establish conformance.

## Design Tokens Community Group

[Issue 191](https://github.com/JFusco/brain/issues/191) adds the first Design systems catalog: the Design Tokens Community Group 2025.10 Final Community Group Report. The source reads the static 2025.10 index within `/tr/2025.10/`; its relative module links resolve, and the four verified pages are also listed as additional pages so they keep their published titles instead of anchor or path titles. `/sitemap.xml` returns 404, and the `robots.txt` sitemap lists uppercase `/TR/` URLs that redirect to the lowercase pages, alongside editor's drafts. The reports are published under the W3C Community Final Specification Agreement and are not W3C Standards. The version is fixed in the path; a later report needs an explicit registration change.

## Figma developer documentation

[Issue 193](https://github.com/JFusco/brain/issues/193) adds Figma to Design systems from `developers.figma.com/sitemap.xml`, limited to the REST API, Plugin API and Code Connect sections. The plugin changelog under `/docs/plugins/updates/` is excluded as release history rather than reference; Widget API, Embed Kit and MCP server sections stay out of scope. Existing Figma design-context lessons remain in Frontend, and the unscoped Code Connect lookup kept that note first after the sync.

## Chrome DevTools

[Issue 195](https://github.com/JFusco/brain/issues/195) adds Chrome DevTools to Performance. The `developer.chrome.com` sitemap index links three sub-sitemaps that returned HTTP 500 to every tested user agent, and the site has no `llms.txt`, so the source reads the static DevTools landing page, whose absolute and relative links both resolve, limited to `/docs/devtools/`. The catalog holds the landing page's panel and feature entries without release history, not every DevTools reference page. Article pages state CC BY 4.0 with Apache 2.0 code samples. Lookup comparisons kept the image-loading playbook first for every Performance query.

## Lighthouse audits

[Issue 197](https://github.com/JFusco/brain/issues/197) adds Lighthouse audit documentation to Performance from the static Lighthouse overview, for the same sitemap reason as DevTools. The overview links its audits root-relatively; the catalog keeps them under `/docs/lighthouse/` and excludes the historical v3 migration guide. Audit pages that the overview does not link, such as `render-blocking-resources`, are outside the catalog. Audits are lab evidence that follows the current Lighthouse release; they do not establish field performance or WCAG conformance.

## Testing Library

[Issue 199](https://github.com/JFusco/brain/issues/199) adds Testing Library to Tooling from its single sitemap, limited to `/docs/` and excluding the contributor guide, consistent with Storybook. The catalog covers queries, user-event, DOM Testing Library, the framework adapters, examples and ecosystem pages. Pages have no Markdown variant, so focused excerpts read HTML.

## ESLint

[Issue 201](https://github.com/JFusco/brain/issues/201) adds ESLint to Tooling from the latest-docs sitemap rather than the blog-heavy site sitemap, limited to the user guide, core rules, extend, integrate, flags and languages sections. Contributor, maintainer and website component-library pages are excluded. The `latest` path is rolling (v10.13.0 at registration) and rule pages include deprecated rules, so readers confirm the installed major and config format.

## pnpm

[Issue 203](https://github.com/JFusco/brain/issues/203) adds pnpm to Tooling from its single sitemap. Current-major docs sit at the site root (12.x at registration), so the source includes `/` and excludes the `/10.x` versioned docs, the `/11.x` sitemap entries (which redirect to the root), blog, `/r/` redirect shortcuts and donation and logo pages; the site homepage remains as an entry. Brain itself pins pnpm 10, a reminder that rolling current-major docs need version confirmation.

## Turborepo

[Issue 205](https://github.com/JFusco/brain/issues/205) completes the planned Tooling sources with Turborepo on its canonical `turborepo.dev` host. Its official `llms.txt` lists every docs page as a relative `.md` link with a page title, so the source is a Markdown-index collection limited to `/docs` rather than the sitemap, whose titles would be path-derived. Rolling documentation tracks the current turbo release.

## HTML catalog link titles

The [HTML catalog titles journal](../journal/2026-10-24-html-catalog-titles.md) records numeric character-reference decoding and skip-link handling in the HTML index parser. Only four Lighthouse titles changed on resync.

## Lighthouse docs in Accessibility

The [Lighthouse accessibility routing journal](../journal/2026-10-24-lighthouse-accessibility.md) records adding Accessibility to the Lighthouse catalog's domains, so its accessibility audits appear in Accessibility lookups. The whole catalog now matches the Accessibility domain; curated notes stayed in their baseline top five.

## Figma MCP server documentation

The [Figma MCP server journal](../journal/2026-10-24-figma-mcp-docs.md) records adding the 24 Figma MCP server pages to the existing Figma catalog in Design systems, with curated notes unchanged at the top of their comparisons.
