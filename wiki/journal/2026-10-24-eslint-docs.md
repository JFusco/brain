---
title: "ESLint documentation catalog"
topics: [official-reference-expansion]
---

# ESLint documentation catalog

[Issue 201](https://github.com/JFusco/brain/issues/201) registers `eslint-docs`, a sitemap collection read from `eslint.org/docs/latest/sitemap.xml`. `eslint.org/llms.txt` returned 404 and the site sitemap is mostly blog posts. Local `official sync` read one index and catalogued 370 of its 410 locations: 313 rule pages, 36 user-guide pages, 16 extend pages, 3 integrate pages and the flags and languages pages. Contributor, maintainer, component-library, about and versions pages fall outside the selected prefixes.

The `latest` docs reported v10.13.0 at registration, with v9 and v8 docs published separately and not catalogued. Rule pages include deprecated rules. Appending `.md` returns 404, so focused excerpts read HTML. Tooling had no curated notes; the unscoped `browser verification accessibility` lookup kept both curated notes at positions 1 and 3. The `eslint/eslint` repository is MIT-licensed; the catalog stores links and metadata only. See [official reference expansion](../topics/official-reference-expansion.md).
