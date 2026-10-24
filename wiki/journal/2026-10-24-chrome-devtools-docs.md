---
title: "Chrome DevTools documentation catalog"
topics: [official-reference-expansion]
---

# Chrome DevTools documentation catalog

[Issue 195](https://github.com/JFusco/brain/issues/195) registers `chrome-devtools-docs`, a static HTML collection read from `developer.chrome.com/docs/devtools` and limited to `/docs/devtools/`. During discovery, the site's three sub-sitemaps returned HTTP 500 to Brain's and curl's user agents, and `developer.chrome.com/llms.txt` returned 404. The landing page links 47 panel and feature pages; release notes and What's new are excluded as release history, matching the Figma changelog decision. Local `official sync` read the landing page and catalogued 45 pages with their link titles, covering performance, network, memory, coverage, rendering, console, sources, the Lighthouse panel and AI assistance.

The Performance hub now describes the bounded DevTools entries. All three Performance lookups and the unscoped `image loading LCP` lookup kept the image-loading playbook at position 1. Content review found that Chrome for Developers article pages state CC BY 4.0 except as otherwise noted, with code samples under Apache 2.0, although the landing page carries no footer; the catalog stores links and metadata only. Lighthouse audit documentation follows as a separate registration. See [official reference expansion](../topics/official-reference-expansion.md).
