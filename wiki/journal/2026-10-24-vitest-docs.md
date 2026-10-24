---
title: "Vitest documentation catalog"
topics: [official-reference-expansion]
---

# Vitest documentation catalog

[Issue 185](https://github.com/JFusco/brain/issues/185) registers `vitest-docs`, a Markdown-index collection read from the official `vitest.dev/llms.txt`, because `vitest.dev` serves no sitemap. Relative `.md` links resolve against the index URL; `fetchSuffix: ".md"` keeps reader links on the HTML pages. The `/config` and `/guide` prefixes omit a trailing slash so the root Configuring Vitest and Getting Started pages are included; content review caught the Getting Started page missing from a first `/guide/` sync. Only the releases and a migration to-do page are excluded. Local `official sync` read one index and catalogued 213 pages: 109 config, 74 guide and 30 API pages, including browser mode, mocking, migration and advanced API sections.

The upstream index titles one advanced API example page "Untitled", and the catalog keeps that title. Tooling still had no curated notes, so its lookups gave no retention evidence; the unscoped `browser verification accessibility` lookup kept both curated notes at positions 1 and 3. The `vitest-dev/vitest` repository is MIT-licensed; the catalog stores links and metadata only. See [official reference expansion](../topics/official-reference-expansion.md).
