---
topics: [webflow-coverage]
---

# Register the Webflow domain and developer documentation

[Issue 290](https://github.com/JFusco/brain/issues/290) adds the `cms/webflow` domain, its knowledge hub and navigation link, and the reference-only `webflow-docs` source (721 links, including the MCP section).

The first candidate also registered `webflow-skills`, `webflow-mcp-server` and `webflow-university-resources`. Review found that bundling conflicts with the AGENTS.md rule that new sources need their own registration change, so a follow-up commit removed those three registrations, catalogs and lock entries. Issue 290 was then rescoped to the domain and documentation source, and the three sources are tracked by [issue 291](https://github.com/JFusco/brain/issues/291), [issue 292](https://github.com/JFusco/brain/issues/292) and [issue 293](https://github.com/JFusco/brain/issues/293); each can reuse that first commit while it is reachable but must be re-derived and re-verified in its own registration PR.

Local evidence on 2026-11-01: `official sync webflow-docs` succeeded with one index fetched. A first documentation sync also caught the changelog index page, so the exclusion was tightened and the source re-synced. Focused lookups returned the MCP Claude Code and documentation-server installation pages and the Data API CMS item creation pages. `check`, `official check`, `pnpm run verify:ci` and wiki integrity ran before delivery; the PR records their actual outcomes. No MCP server was installed or executed.

See [Webflow coverage](../topics/webflow-coverage.md).
