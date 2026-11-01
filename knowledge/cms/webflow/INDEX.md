---
title: "Webflow"
aliases: ["webflow", "webflow mcp", "Webflow Data API", "Webflow Designer API", "webflow skills", "webflow-agent"]
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

The `webflow-university-resources` catalog follows the [Webflow University sitemap](https://university.webflow.com/sitemap.xml) but keeps only its `/resources/` pages: 10 links at registration (2026-11-01). Six are best-practice checklists (build and launch, design system, Optimize, Optimize for non-Webflow sites, reverse proxy and Localize) and four are role quick guides (content editor, designer, marketer and reviewer). Courses, course lessons, videos, the glossary, learning paths, assessments and certifications are product training, so they are excluded. The sitemap is served with an RSS content type, but the body is a standard sitemap. These checklists describe Designer and site-launch workflows rather than the developer API, so confirm the site plan and feature availability before you follow one.

### Official skills and native agent

The `webflow-skills` source catalogs [`webflow/webflow-skills`](https://github.com/webflow/webflow-skills) (MIT) at a pinned commit, `fd07213dfaac2ff33465ff367685711783261287` at registration (2026-11-01). Selected paths:

| Path | At registration |
| --- | --- |
| `plugins/webflow-skills/skills/` | 33 skills and 24 supporting documents |
| `agents/webflow-agent.md` | The native `webflow-agent` definition |
| `README.md`, `plugins/webflow-skills/README.md` | Repository and plugin overviews |
| `LICENSE` | MIT license text (retrieved, not catalogued) |

The skills call Webflow MCP tools and need the Webflow MCP server (`https://mcp.webflow.com/mcp`, as the repository's `.mcp.json` declares) with access to the target site. Without that server they serve only as reading material. Check the site plan, token permissions and MCP client before applying a workflow. The `deploy-guide` skill links to `plugins/webflow-skills/references/CODE_COMPONENTS_REFERENCE.md`, which does not exist at the catalogued commit; the catalog records this as a reference issue.

Plugin manifests are recorded here as metadata only. They are JSON, so the catalog does not index them, and Brain does not install them. At the catalogued commit the Claude, Codex and Cursor plugin manifests declare version 1.0.10, and the Codex and Cursor manifests also declare the MIT license:

- Claude: `.claude-plugin/marketplace.json` and `plugins/webflow-skills/.claude-plugin/plugin.json`.
- Codex: `.agents/plugins/marketplace.json` and `plugins/webflow-skills/.codex-plugin/plugin.json`, which points at the plugin's `.mcp.json`.
- Cursor: `.cursor-plugin/marketplace.json` and `.cursor-plugin/plugin.json`, which list the skills directory and `agents/`.

The repository publishes no hook definitions: no hook files exist at the catalogued commit and no manifest declares hooks. The Antigravity manifest, MCP configuration files, contributor instructions (`AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`), CI workflow and logos are not selected. Third-party Webflow skill repositories are not registered.

The official MCP server README (`webflow/mcp-server`, [#292](https://github.com/JFusco/brain/issues/292)) needs its own registration change, so it is not searchable here yet.

These sources are reference only. Brain does not connect to a Webflow site, install or run the MCP server, or install or execute skills, plugins or the agent. Refresh them with `official sync webflow-docs`, `official sync webflow-university-resources` and `official sync webflow-skills`. Neither the developer documentation nor Webflow University asserts an open content license, so Brain stores only links and metadata, and focused retrieval keeps just a bounded excerpt.

```sh
node scripts/brain.mjs lookup --domain cms/webflow --query "mcp server claude code installing" --limit 3
node scripts/brain.mjs lookup --domain cms/webflow --query "cms collection items create" --limit 3 --fetch
node scripts/brain.mjs lookup --domain cms/webflow --query "build and launch checklist" --limit 3
node scripts/brain.mjs lookup --domain cms/webflow --query "cms best practices" --limit 3
node scripts/brain.mjs lookup --domain cms/webflow --query "safe publish" --limit 3
node scripts/brain.mjs lookup --domain cms/webflow --query "webflow agent" --limit 3
```

## Curated learnings

<!-- brain:curated:start -->
No curated notes yet.
<!-- brain:curated:end -->

<!-- brain:official:start -->
## Official sources

- **webflow-docs** — link catalog of 721 pages; rolling-url; revision `8993bd8e62fa5454d16c31a939b86dd9d4117dc8fc5c535fee3b35f63836329c`; fetched 2026-11-01.
  - [Catalog source](https://developers.webflow.com/sitemap.xml); search it with `lookup --domain cms/webflow`.
- **webflow-university-resources** — link catalog of 10 pages; rolling-url; revision `4a1a739c088dd682318c1747a830c2f84102a2e44e43c40c0a825748d5a5f992`; fetched 2026-11-01.
  - [Catalog source](https://university.webflow.com/sitemap.xml); search it with `lookup --domain cms/webflow`.
- **webflow-skills** — 33 skills and 27 docs at a pinned commit; default-branch; revision `fd07213dfaac2ff33465ff367685711783261287`; fetched 2026-11-01.
  - [accessibility-audit](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/accessibility-audit/SKILL.md) — reference only.
  - [asset-audit](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/asset-audit/SKILL.md) — reference only.
  - [bulk-cms-update](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/bulk-cms-update/SKILL.md) — reference only.
  - [cloud-apps](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/cloud-apps/SKILL.md) — reference only.
  - [cms-best-practices](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/cms-best-practices/SKILL.md) — reference only.
  - [cms-collection-setup](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/cms-collection-setup/SKILL.md) — reference only.
  - [code-component-command](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/code-component-command/SKILL.md) — reference only.
  - [component-audit](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/component-audit/SKILL.md) — reference only.
  - [component-scaffold](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/component-scaffold/SKILL.md) — reference only.
  - [convert-component](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/convert-component/SKILL.md) — reference only.
  - [custom-code-management](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/custom-code-management/SKILL.md) — reference only.
  - [deploy-guide](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/deploy-guide/SKILL.md) — reference only.
  - [designer-extension-command](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/designer-extension-command/SKILL.md) — reference only.
  - [designer-tools](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/designer-tools/SKILL.md) — reference only.
  - [devlink-command](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/devlink-command/SKILL.md) — reference only.
  - [figma-to-webflow](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/figma-to-webflow/SKILL.md) — reference only.
  - [flowkit-naming](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/flowkit-naming/SKILL.md) — reference only.
  - [interactions](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/interactions/SKILL.md) — reference only.
  - [link-checker](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/link-checker/SKILL.md) — reference only.
  - [local-dev-setup](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/local-dev-setup/SKILL.md) — reference only.
  - [pre-deploy-check](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/pre-deploy-check/SKILL.md) — reference only.
  - [review-comments](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/review-comments/SKILL.md) — reference only.
  - [safe-publish](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/safe-publish/SKILL.md) — reference only.
  - [site-activity](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/site-activity/SKILL.md) — reference only.
  - [site-audit](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/site-audit/SKILL.md) — reference only.
  - [troubleshoot-deploy](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/troubleshoot-deploy/SKILL.md) — reference only.
  - [waf-rules](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/waf-rules/SKILL.md) — reference only.
  - [webflow-cli-troubleshooter](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/webflow-cli-troubleshooter/SKILL.md) — reference only.
  - [webflow-cloud-command](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/webflow-cloud-command/SKILL.md) — reference only.
  - [webflow-compress-cms-image](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/webflow-compress-cms-image/SKILL.md) — reference only.
  - [wfu-mcp-getting-started](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/wfu-mcp-getting-started/SKILL.md) — reference only.
  - [wfu-migrate-cms](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/wfu-migrate-cms/SKILL.md) — reference only.
  - [wfu-new-cms-plan](https://github.com/webflow/webflow-skills/blob/fd07213dfaac2ff33465ff367685711783261287/plugins/webflow-skills/skills/wfu-new-cms-plan/SKILL.md) — reference only.
<!-- brain:official:end -->
