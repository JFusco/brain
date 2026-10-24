---
title: "Storybook documentation catalog"
topics: [official-reference-expansion]
---

# Storybook documentation catalog

[Issue 187](https://github.com/JFusco/brain/issues/187) registers `storybook-docs`, a sitemap collection read from `storybook.js.org/docs/sitemap.xml`. The docs sitemap held 169 locations; the site root and community page fall outside `/docs`, and the 7 contributor pages are excluded. Local `official sync` read one index and catalogued 160 pages, including the docs root and the get-started, configure, writing-stories, writing-tests, writing-docs, addons, essentials, sharing, builders, AI, releases and API sections.

A first sync excluded `/docs/contribute/` and still admitted the contributor root page, so the exclusion became `/docs/contribute`, matching the issue's intent to leave out contributor guides. `fetchSuffix: ".md"` fetches Markdown, including `docs.md` for the root. Tooling had no curated notes; the unscoped `component meaning Code Connect` lookup kept its Frontend note at position 1. The `storybookjs/storybook` repository is MIT-licensed; the catalog stores links and metadata only. See [official reference expansion](../topics/official-reference-expansion.md).
