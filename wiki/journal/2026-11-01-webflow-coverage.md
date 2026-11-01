---
topics: [webflow-coverage]
---

# Register Webflow documentation, MCP guidance and native skills

[Issue 290](https://github.com/JFusco/brain/issues/290) adds the `cms/webflow` domain, its knowledge hub and navigation link, and four reference-only sources: `webflow-docs` (721 links), `webflow-skills` (33 skills, 27 documents, including the native agent), `webflow-mcp-server` (README) and `webflow-university-resources` (10 checklists and guides).

Local evidence on 2026-11-01: `official sync` succeeded separately for each source with one index fetched for each collection. A first documentation sync also caught the changelog index page, so the exclusion was tightened and the source re-synced. Focused lookups returned the MCP Claude Code and documentation-server installation pages, Data API CMS item creation pages, the `safe-publish` skill and the University build-and-launch checklist. `check`, `official check`, `pnpm run verify:ci` and wiki integrity ran before delivery; the PR records their actual outcomes. No skill, agent, plugin or MCP server was installed or executed.

See [Webflow coverage](../topics/webflow-coverage.md).
