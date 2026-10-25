---
title: "Register Agent Skills documentation"
topics: [official-reference-expansion]
---

# Register Agent Skills documentation

[Issue 240](https://github.com/JFusco/brain/issues/240) adds `agent-skills-docs` to Tooling. Catalog the official format specification, skill-authoring guidance and client integration documentation from one bounded Markdown index.

The successful local sync produced 0 skills, 0 docs, 8 pages and 0 upstream relative-reference issues. Catalogs retain links and metadata only; upstream files were validated in memory, never executed. The registration uses the existing fetcher and reference-only policy.

Applicability: Rolling official Agent Skills format specification, authoring and evaluation guidance, and client implementation documentation. Client-specific support and validation may differ from the shared format; confirm the target agent's own documentation. Excludes the client showcase. No skill installation or execution.

Validation: local source sync, Brain content/official checks, wiki integrity, representative lookup and `pnpm run verify:ci`. The delivery PR records actual command outcomes and hosted checks. No consuming project, browser or server behavior is certified.
