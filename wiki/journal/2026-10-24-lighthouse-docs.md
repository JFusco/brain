---
title: "Lighthouse audit documentation catalog"
topics: [official-reference-expansion]
---

# Lighthouse audit documentation catalog

[Issue 197](https://github.com/JFusco/brain/issues/197) registers `chrome-lighthouse-docs`, a static HTML collection read from `developer.chrome.com/docs/lighthouse/overview`. Local `official sync` read the overview and catalogued 72 pages: the overview plus 22 performance, 21 best-practices, 11 accessibility, 10 SEO and 7 agentic-browsing audit pages. The v3 migration guide is excluded as history.

The issue's example audit `lcp-lazy-loaded` returned 404, and `render-blocking-resources` exists but is not linked from the overview, so neither is catalogued; catalogued audits include `offscreen-images`, `bootup-time` and `lighthouse-largest-contentful-paint`. Article pages, including the overview, state CC BY 4.0 except as otherwise noted, with Apache 2.0 code samples. All three Performance lookups and the unscoped `image loading LCP` lookup kept the image-loading playbook at position 1. See [official reference expansion](../topics/official-reference-expansion.md).
