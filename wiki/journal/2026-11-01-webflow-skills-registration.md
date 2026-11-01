---
topics: [webflow-coverage]
---

# Register the official Webflow skills and native agent

[Issue 291](https://github.com/JFusco/brain/issues/291) adds the reference-only `webflow-skills` source to the `cms/webflow` domain. It catalogs `webflow/webflow-skills` (MIT): the skills under `plugins/webflow-skills/skills/`, the native `agents/webflow-agent.md`, both READMEs and the license. The registration from the first issue 290 candidate was reused only after checking it against the current upstream tree.

The Claude, Codex and Cursor plugin manifests are JSON. The repository catalog indexes only skills and Markdown or text documents, so the Webflow hub records the manifest paths, version 1.0.10 and license as metadata instead of selecting files that would never be indexed. No hook files or manifest hook declarations exist upstream. The skills require the Webflow MCP server, which the applicability text and hub record.

Local evidence on 2026-11-01: `official sync webflow-skills` succeeded at commit `fd07213dfaac2ff33465ff367685711783261287` with 33 skills and 27 documents. It kept one upstream reference issue: `deploy-guide` links to a missing `plugins/webflow-skills/references/CODE_COMPONENTS_REFERENCE.md`. Focused lookups returned the `cms-best-practices` and `safe-publish` skills first and the native agent within the top three for "webflow agent". `check`, `official check`, `pnpm run verify:ci` and wiki integrity ran before delivery; the PR records their actual outcomes. Nothing was installed or executed.

See [Webflow coverage](../topics/webflow-coverage.md).
