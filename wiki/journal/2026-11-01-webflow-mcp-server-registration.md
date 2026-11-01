---
topics: [webflow-coverage]
---

# Register the Webflow MCP server README

[Issue 292](https://github.com/JFusco/brain/issues/292) adds the reference-only `webflow-mcp-server` source to the `cms/webflow` domain. It was re-derived from the first #290 candidate and checked against the current upstream repository.

- The source is `webflow/mcp-server` (MIT, `LICENCE`) on the default branch. The catalog pins commit `124b5caa38baf46ab51edea9220076c9785ceaf7` (2026-10-27) and holds one document, `README.md`.
- The README covers remote OAuth setup with the Designer companion app, local `npx webflow-mcp-server@latest` setup with `WEBFLOW_TOKEN` and a self-published MCP Bridge App, the OAuth reset, troubleshooting and a known limitation.
- **Outdated transport URL.** The README's remote examples use `https://mcp.webflow.com/sse`. The repository `server.json` (2.0.0, streamable HTTP) and the current developer documentation use `https://mcp.webflow.com/mcp`. The README's `data/v2.0.0/docs/ai-tools` and `register-an-app` links return HTTP 308 redirects to their current pages.
- **Tool reference.** The README points to a nonexistent `./tools` directory. Tools are defined in TypeScript under `src/tools/`, which the Markdown-only repository catalog does not index. The `webflow-docs` MCP tools pages remain the searchable tool reference.
- **Exclusions.** Source code, `server.json`, package manifests and the third-party `virat21/webflow-mcp-bridge-app` are not catalogued. The repository has no hook definitions. Nothing was installed or executed.

Local evidence on 2026-11-01: `official sync webflow-mcp-server` succeeded. It used the checksum-verified Gitleaks 8.30.1 binary recorded in the lock. Focused lookups for MCP server setup returned the README first, followed by the documentation-server installation page, and the `--fetch` lookup retrieved a bounded README excerpt. A tools lookup returned the data, Designer and utility tools pages. `check`, `official check`, `pnpm run verify:ci` and wiki integrity ran before delivery; the PR records their actual outcomes.

See [Webflow coverage](../topics/webflow-coverage.md).
