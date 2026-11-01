---
title: "Webflow documentation coverage"
aliases: ["webflow-docs", "webflow-skills", "webflow-mcp-server", "webflow-university-resources"]
---

# Webflow documentation coverage

[Issue 290](https://github.com/JFusco/brain/issues/290) adds the `cms/webflow` domain and four official, reference-only sources using the existing catalog implementation. The [knowledge hub](../../knowledge/cms/webflow/INDEX.md) holds current counts and lookup commands. As with the WordPress registration, the domain and its sources ship as one issue-linked registration PR.

- `webflow-docs` follows `https://developers.webflow.com/sitemap.xml` (one index, 968 URLs on 2026-11-01). It keeps the developer home page and the MCP, Data API, Designer API, Webflow Cloud, DevLink, code components, CLI, Browser API and FlowKit sections: 721 links. The developer changelog (127 entries plus its index), the deprecated Data API v1 reference (54) and the v2.0.0-beta reference (65) are excluded, so Data API links describe the current v2 contract. Lookup fetches the Markdown that Webflow publishes by appending `.md`.
- `webflow-skills` catalogs `plugins/webflow-skills/skills/`, the native `agents/webflow-agent.md`, both READMEs and the MIT `LICENSE` at the synced default-branch commit: 33 skills and 27 supporting documents. Plugin manifests, MCP configuration and contributor instructions are not selected. One upstream reference defect is retained in `referenceIssues`.
- `webflow-mcp-server` catalogs only the README of the official MIT server repository, like the Chrome DevTools MCP registration. Server source code is not catalogued, and Brain never installs, configures or runs the server.
- `webflow-university-resources` keeps the 10 `/resources/` checklists and role quick guides from `https://university.webflow.com/sitemap.xml`. Local retrieval succeeded, but courses, lessons, videos, glossary, assessments and certifications (about 1,300 URLs) are product training rather than best-practice or development reference, so they are excluded.

No hook definitions exist in `webflow/webflow-skills` or `webflow/mcp-server` at the synced commits. Third-party Webflow skill and MCP repositories are not registered. The developer documentation and University pages assert no open content license, so the catalogs keep only links and metadata.

Catalog coverage is not runtime verification. Rolling pages require checks of the site plan, token scopes, API version, CLI or package version and MCP client before use. The [registration journal](../journal/2026-11-01-webflow-coverage.md) records the local evidence. Reverting this registration removes the domain, sources, catalogs, lock entries and hub together.
