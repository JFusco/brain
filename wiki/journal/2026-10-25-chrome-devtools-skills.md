---
title: "Register Chrome DevTools skills"
topics: [official-reference-expansion]
---

# Register Chrome DevTools skills

[Issue 238](https://github.com/JFusco/brain/issues/238) adds `chrome-devtools-skills` to Tooling. Catalog the official seven skills and their supporting references as reference-only guidance. Preserve tool-version requirements and unresolved upstream references.

The successful local sync produced 7 skills, 8 docs, 0 pages and 0 upstream relative-reference issues. Catalogs retain links and metadata only; upstream files were validated in memory, never executed. The registration uses the existing fetcher and reference-only policy.

Applicability: Official Chrome DevTools MCP and CLI skills and supporting references. Match the installed chrome-devtools-mcp and Chrome versions; skills describe version-specific tools. Reference-only: cataloging does not install skills, connect a browser or establish accessibility conformance.

Validation: local source sync, Brain content/official checks, wiki integrity, representative lookup and `pnpm run verify:ci`. The delivery PR records actual command outcomes and hosted checks. No consuming project, browser or server behavior is certified.
