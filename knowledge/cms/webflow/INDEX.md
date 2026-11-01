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

The official skills and native agent (`webflow/webflow-skills`), the official MCP server README (`webflow/mcp-server`) and the Webflow University best-practice checklists each need their own registration change, so they are not searchable here yet. No official Webflow hook definitions were found in `webflow/webflow-skills` or `webflow/mcp-server`.

This source is reference only. Brain does not connect to a Webflow site or install or run the MCP server. Refresh it with `official sync webflow-docs`. Webflow's developer documentation asserts no open content license, so Brain stores only links and metadata, and focused retrieval keeps just a bounded excerpt.

```sh
node scripts/brain.mjs lookup --domain cms/webflow --query "mcp server claude code installing" --limit 3
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
<!-- brain:official:end -->
