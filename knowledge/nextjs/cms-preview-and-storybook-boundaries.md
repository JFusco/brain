---
title: "Separate CMS fetching, preview and Storybook rendering"
format: "playbook"
domain: "nextjs"
aliases: ["CMS component props", "preview caching", "Storybook RSC"]
evidence_date: "2026-11-08"
reviewed_at: "2026-11-08"
applicability: "Next.js App Router 16 documentation observed at 16.4.5 and Storybook 10.6 Next.js Vite documentation; check installed releases and template caching mode"
provenance: "nextjs-index@41ead42cac3a04c79525ecdf1b47217d208f1f75f99d2caad02f331a3b7ca45f; storybook-docs@c735625fe57a09cd61ddc13f2b80d4d8f548b9e8bacd52ca415aed3e1fd2ee42; official pages read 2026-11-08; proposed integration procedure"
status: "current"
versions: []
---

# Separate CMS fetching, preview and Storybook rendering

## When to use this

Use when the same CMS presentation components must render in App Router pages and browser stories. Start with [the installed release's documentation](version-matched-docs.md); a vendor template's configuration determines which caching model applies.

## What to do

1. **Proposed:** keep CMS requests and credentials in a server-only data layer called by routes or server composition code. Extract presentation from the route file and pass reviewed data as props; stories import that component rather than the page or registry. **Documented:** [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) support server fetching and composition through props such as `children`. Props crossing into a Client Component must be serializable. Place `use client` around the interactive boundary; it also affects that module's imports.
2. **Documented:** the current [caching guide](https://nextjs.org/docs/app/getting-started/caching) uses `use cache`, `cacheLife` and tags. **Proposed:** cache published reads only under the project's chosen model, and connect an authenticated CMS webhook to the appropriate tag invalidation API. Do not combine Cache Components configuration with older `unstable_cache` recipes without checking the installed release and template.
3. **Proposed:** select authorized preview reads per request and prevent draft results from entering shared published-content caches. Preview query parameters alone are neither authorization nor proof of a framework cache bypass. **Documented nuance:** current [`draftMode()`](https://nextjs.org/docs/app/api-reference/functions/draft-mode) is asynchronous; when enabled, caching-directive scopes execute again without saving results. Thus “a draft read can never appear inside a caching directive” is too broad. Check actual Draft Mode, vendor preview and custom-cache behavior separately.
4. **Documented:** [Storybook's Next.js Vite integration](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite) marks `experimentalRSC` experimental. It adds Suspense for asynchronous stories but does not make Node-only dependencies browser-compatible. **Proposed:** use an explicit browser mock or Vite alias at the server dependency boundary.
5. **Documented:** [module automocking](https://storybook.js.org/docs/writing-stories/mocking-data-and-modules/mocking-modules) still evaluates the original module and its dependencies. A mock file prevents that evaluation. **Proposed:** provide only the exports a story needs and verify the mock contract; an empty stub that hides required behavior is not rendering evidence.

## Evidence and limits

This procedure combines documented mechanisms with unexercised architecture recommendations. No CMS preview, cache invalidation, generated application or Storybook build was exercised. Historical application patch versions and differing template choices are not compatibility guarantees. Server Actions are outside this note. Pair component stories with the separate [Storybook browser gates](../tooling/storybook-browser-gates.md).
