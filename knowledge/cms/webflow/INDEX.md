---
title: "Webflow"
aliases: ["webflow", "webflow mcp", "Webflow Data API", "Webflow Designer API"]
---

# Webflow

Use these references for Webflow site, app and integration work. The developer documentation rolls forward. Before you apply an API or example, check the site plan, token scopes, Data API version, CLI and package versions. For MCP guidance, also check the MCP client and server mode.

## Coverage and limits

The `webflow-docs` catalog follows the [official sitemap](https://developers.webflow.com/sitemap.xml). Counts at registration (2026-11-01):

| Section | Links |
| --- | ---: |
| Designer API | 314 |
| Data API v2 (guides and reference) | 214 |
| Browser API | 45 |
| FlowKit | 45 |
| Code components | 27 |
| MCP server (setup, tools, prompts, skills) | 26 |
| Webflow Cloud | 24 |
| DevLink | 19 |
| CLI | 6 |
| Developer home | 1 |
| **Total** | **721** |

The developer changelog, the deprecated Data API v1 reference and the v2.0.0-beta reference are excluded. Lookup fetches the Markdown version that Webflow publishes for each page (the URL plus `.md`). These links are what the sitemap lists; they do not show that every page is discoverable or verified.

The `webflow-mcp-server` catalog pins one document, `README.md`, from the official [`webflow/mcp-server`](https://github.com/webflow/mcp-server) repository (MIT; `LICENCE` is selected for provenance but is not a catalog document). Commit `124b5caa38baf46ab51edea9220076c9785ceaf7` (2026-10-27) was catalogued at registration. The README covers:

- Remote setup for Cursor and Claude desktop, which authenticates with OAuth and uses a companion app in the Webflow Designer, and how to reset the OAuth token (`~/.mcp-auth`).
- Local setup: `npx webflow-mcp-server@latest` with a `WEBFLOW_TOKEN` API token, plus an MCP Bridge App that you register and publish in your own workspace.
- Troubleshooting, the Node.js 22.3.0 minimum and a known limitation of `pages_update_static_content`.

When you use the README, keep these limits in mind:

- **Outdated remote URL.** The remote client examples still use `https://mcp.webflow.com/sse`. The repository's `server.json` (version 2.0.0) and the current developer documentation use the streamable HTTP endpoint `https://mcp.webflow.com/mcp`, so follow the documentation pages for client configuration.
- **Redirected links.** The README's `data/v2.0.0/docs/ai-tools` and `register-an-app` links now redirect to `/mcp/reference/overview` and `/apps/data/docs/register-an-app`.
- **Tool reference.** The README's tool section points to a `./tools` directory that does not exist. Tool definitions are TypeScript under `src/tools/`, which Brain does not catalog. Use the `webflow-docs` pages for data, Designer and utility tools instead.
- **Third-party bridge app.** The local bridge app is linked from a personal repository (`virat21/webflow-mcp-bridge-app`), which is not registered.

The official skills and native agent (`webflow/webflow-skills`, [#291](https://github.com/JFusco/brain/issues/291)) and the Webflow University best-practice checklists ([#293](https://github.com/JFusco/brain/issues/293)) each need their own registration change, so they are not searchable here yet. No official Webflow hook definitions were found in `webflow/webflow-skills` or `webflow/mcp-server`.

These sources are reference only. Brain does not connect to a Webflow site or install, configure or run the MCP server or bridge app. Refresh them with `official sync webflow-docs` and `official sync webflow-mcp-server`. Webflow's developer documentation asserts no open content license, so Brain stores only links and metadata, and focused retrieval keeps just a bounded excerpt.

```sh
node scripts/brain.mjs lookup --domain cms/webflow --query "mcp server claude code installing" --limit 3
node scripts/brain.mjs lookup --domain cms/webflow --query "webflow mcp server local installation token" --limit 3 --fetch
node scripts/brain.mjs lookup --domain cms/webflow --query "cms collection items create" --limit 3 --fetch
```

## Curated learnings

<!-- brain:curated:start -->
No curated notes yet.
<!-- brain:curated:end -->

<!-- brain:official:start -->
## Official sources

- **webflow-docs** — link catalog of 721 pages; rolling-url; revision `8993bd8e62fa5454d16c31a939b86dd9d4117dc8fc5c535fee3b35f63836329c`; fetched 2026-11-01.
  - [Catalog source](https://developers.webflow.com/sitemap.xml); search it with `lookup --domain cms/webflow`.
- **webflow-mcp-server** — 0 skills and 1 docs at a pinned commit; default-branch; revision `124b5caa38baf46ab51edea9220076c9785ceaf7`; fetched 2026-11-01.
  - [README.md](https://github.com/webflow/mcp-server/blob/124b5caa38baf46ab51edea9220076c9785ceaf7/README.md).
<!-- brain:official:end -->
