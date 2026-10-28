---
topics: [automatic-knowledge-maintenance]
---

# Match Sitecore sitemap language paths

[Issue 255](https://github.com/JFusco/brain/issues/255) corrects the include prefixes for `sitecoreai-docs` and `sitecore-xp-docs`. The October 27 scheduled local sync rejected both sitemaps with `Official source contains no matching documentation links` and kept the last-good catalogs.

The [original registration](2026-10-18-sitecore-catalogs-and-runner-policy.md) matched the language-neutral paths the sitemaps then listed. On October 28 both official sitemaps returned HTTP 200 and listed every location under an English path: 423 under `/sai/en/developers/sitecoreai/` and 401 under `/xp/en/developers/104/sitecore-experience-manager/`. The prefixes now include `/en/`. Host, product manual, version 10.4, index URLs and the disabled reference Actions are unchanged; separate SDK, JSS, Experience Platform and other manuals remain outside these catalogs.

Local `official sync` refreshed both catalogs (423 and 401 links) and their lock entries and hubs. HTTP success and path matching do not verify any technical claim in the linked pages. The registry PR stops for review.
