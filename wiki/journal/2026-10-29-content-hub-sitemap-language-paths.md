---
title: "Match Content Hub sitemap language paths"
date: "2026-10-29"
topics: [automatic-knowledge-maintenance]
---

# Match Content Hub sitemap language paths

[Issue 274](https://github.com/JFusco/brain/issues/274) repairs `content-hub-docs` and `content-hub-user-docs`. The October 28 refresh (issue 273) produced candidates of only 19 and 35 links, exactly their `additionalPages`, because no sitemap location matched the include prefix. The fetcher added supplements before its non-empty check, so an empty match looked like success. Neither candidate was published.

On October 29 both official sitemaps returned HTTP 200 and listed every location under an English path: 387 under `/ch/en/developers/cloud-dev/` and 731 under `/ch/en/users/content-hub/`. This includes the pages whose names start with `en`, which the [original registration](2026-10-24-content-hub-sources.md) restored by hand. The prefixes now include `/en/`, and the redundant supplements are removed. The earlier HTTP 403 recorded for the developer sitemap did not recur; that failure record is unchanged. Host, manuals, index URLs and the API-reference exclusion are unchanged. The issue followed the same path change seen in the [Sitecore language-path fix](2026-10-28-sitecore-sitemap-language-paths.md).

Collection fetching now rejects an index with no matching links before it adds supplements, and the previous good catalog is kept. Local `official sync` rebuilt both catalogs at 387 and 731 links, the same pages as the baseline under `/en/`. The 54 formerly supplemented pages now use sitemap-derived titles. HTTP success and path matching do not verify any technical claim in the linked pages. The registry PR stops for review, and issue 273 remains open.
