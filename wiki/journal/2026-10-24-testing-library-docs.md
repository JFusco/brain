---
title: "Testing Library documentation catalog"
topics: [official-reference-expansion]
---

# Testing Library documentation catalog

[Issue 199](https://github.com/JFusco/brain/issues/199) registers `testing-library-docs`, a sitemap collection on `testing-library.com` limited to `/docs/` and excluding `/docs/contributing`. The single sitemap held 123 locations, 114 of them under `/docs/`. Local `official sync` read one index and catalogued 113 pages: the docs root, guiding principles, queries, user-event, DOM Testing Library, framework adapters including React, Vue, Angular, Svelte and Qwik, examples and ecosystem pages.

Appending `.md` to a page returns a 301 rather than Markdown, so no fetch suffix is set. Tooling had no curated notes; the unscoped `browser verification accessibility` lookup kept both curated notes at positions 1 and 3. The `testing-library/testing-library-docs` repository is MIT-licensed; the catalog stores links and metadata only. See [official reference expansion](../topics/official-reference-expansion.md).
