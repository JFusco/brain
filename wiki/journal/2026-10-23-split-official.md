---
title: "Split the official reference modules"
date: "2026-10-23"
topics: [code-quality]
---

# Split the official reference modules

[Issue 149](https://github.com/JFusco/brain/issues/149) is phase 3b of the cleanup. Four oversized modules become 21 focused modules, each under 200 lines.

| Old module | New modules |
| --- | --- |
| `official.mjs` (774 lines) | `branch/official/{registry,catalog-build,fetch,hubs,validate-registry,validate}` and `tree/official/{sync,generate-hubs,check}` |
| `network.mjs` (264 lines) | `branch/platform/network/{dns,download,github,probe}` |
| `archive.mjs` | `branch/platform/archive` |
| `documentation.mjs` (213 lines) | `branch/official/documentation/{limits,repository-catalog,page-filter,index-links,fetch}` |

- The documentation crawler's URL filter and its HTML, sitemap and Markdown index parsers are now pure functions with tests. The filter is a security boundary: approved HTTPS hosts, path prefixes, no credentials or non-default ports, no binary files.
- `leaf/url.mjs` replaces the official module's private `webURL` with a shared `httpsURL`.
- `leaf/frontmatter.mjs` is the single adapter to the wiki kit's frontmatter parser.

`.prettierignore` entries are now anchored to the repository root. The unanchored `official/` entry also matched the new `scripts/lib/*/official/` code, so Prettier had silently skipped it; a review agent caught this, and the three affected files are now formatted.

Code moved by line-range extraction. ESLint `no-undef` and `no-unused-vars` verified every import.

Verification:
- `official sync` ran for six sources covering every fetch path (repository archive, catalog-only tree, URL index, Markdown collection, sitemap and HTML index), once in a throwaway `main` checkout and once on this branch. Both produced byte-identical catalogs, lock entries, regenerated hub and sync report, including one source that had changed upstream. The sync output was discarded.
- Normalized output from the read-only command baseline is unchanged, apart from `check`'s scanned-file count.
- `pnpm run verify:ci` passed.
