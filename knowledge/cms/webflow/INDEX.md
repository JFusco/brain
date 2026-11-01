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

The `webflow-skills` catalog holds 33 skill entry points and 27 supporting documents at its recorded commit, including the repository and plugin READMEs and the native `agents/webflow-agent.md` agent definition. The repository's Claude, Codex, Cursor and Antigravity plugin manifests and MCP configuration files are not catalogued. One skill, `deploy-guide`, links an upstream file that does not exist, and the catalog records that in `referenceIssues`. No official Webflow hook definitions were found in `webflow/webflow-skills` or `webflow/mcp-server`. The `webflow-mcp-server` catalog keeps only the official server README, not its source code.

`webflow-university-resources` keeps the 10 Webflow University best-practice checklists and role quick guides under `/resources/`. The rest of the University sitemap (about 1,300 courses, lessons, videos, glossary terms, assessments and certifications) is product training, not development reference, so it is excluded.

All four sources are reference only. Brain does not install or run skills, agents, plugins or the MCP server, and it does not connect to a Webflow site. Refresh them with `official sync webflow-docs webflow-skills webflow-mcp-server webflow-university-resources`. The skills repository's `LICENSE` and the MCP server's `LICENCE` both declare MIT. Webflow's developer documentation and University pages assert no open content license, so Brain stores only links and metadata, and focused retrieval keeps just a bounded excerpt.

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
- **webflow-mcp-server** — 0 skills and 1 docs at a pinned commit; default-branch; revision `124b5caa38baf46ab51edea9220076c9785ceaf7`; fetched 2026-11-01.
  - [README.md](https://github.com/webflow/mcp-server/blob/124b5caa38baf46ab51edea9220076c9785ceaf7/README.md).
- **webflow-university-resources** — link catalog of 10 pages; rolling-url; revision `4a1a739c088dd682318c1747a830c2f84102a2e44e43c40c0a825748d5a5f992`; fetched 2026-11-01.
  - [Catalog source](https://university.webflow.com/sitemap.xml); search it with `lookup --domain cms/webflow`.
<!-- brain:official:end -->
