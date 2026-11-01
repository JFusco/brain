---
topics: [webflow-coverage]
---

# Register Webflow University best-practice resources

[Issue 293](https://github.com/JFusco/brain/issues/293) adds the reference-only `webflow-university-resources` source to the `cms/webflow` domain. It reuses the registration drafted in the first issue 290 candidate (commit `ec6275e`), re-derived and re-verified against the current sitemap.

The issue asked for a stable index first because the sitemap returned an RSS content type on 2026-10-31. On 2026-11-01, three fetches of `https://university.webflow.com/sitemap.xml` returned HTTP 200, `application/rss+xml`, a standard sitemap `urlset` of 1,338 URLs and the same 10 `/resources/` URLs. The sitemap parser does not depend on the content type.

Local evidence on 2026-11-01: `official sync webflow-university-resources` succeeded with one index fetched and produced the same catalog revision as the draft (10 links). A focused lookup for `build and launch checklist` returned the official build and launch checklist first, and a `--fetch` lookup retrieved a bounded excerpt of it. `check`, `official check`, `pnpm run verify:ci` and wiki integrity ran before delivery; the PR records their actual outcomes. No vendor body was stored and nothing was installed or executed.

See [Webflow coverage](../topics/webflow-coverage.md).
