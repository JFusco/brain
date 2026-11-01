---
title: "Webflow documentation coverage"
aliases: ["webflow-docs", "webflow-skills", "webflow-mcp-server", "webflow-university-resources"]
---

# Webflow documentation coverage

[Issue 290](https://github.com/JFusco/brain/issues/290) adds the `cms/webflow` domain with its first official, reference-only source, `webflow-docs`, using the existing catalog implementation. The [knowledge hub](../../knowledge/cms/webflow/INDEX.md) holds current counts and lookup commands. AGENTS.md and the README coverage policy require each new source to have its own registration change, so issue 290 was rescoped on 2026-11-01 to the domain and the documentation source, and the other three sources follow in their own issues and registration PRs; issue 293 has since registered the University resources. The older WordPress registration bundled its sources; current policy takes precedence.

- `webflow-docs` follows `https://developers.webflow.com/sitemap.xml` (one index, 968 URLs on 2026-11-01). It keeps the developer home page and the MCP, Data API, Designer API, Webflow Cloud, DevLink, code components, CLI, Browser API and FlowKit sections: 721 links. The developer changelog (127 entries plus its index), the deprecated Data API v1 reference (54) and the v2.0.0-beta reference (65) are excluded, so Data API links describe the current v2 contract. Lookup fetches the Markdown that Webflow publishes by appending `.md`.
- `webflow-university-resources` ([issue 293](https://github.com/JFusco/brain/issues/293)) follows `https://university.webflow.com/sitemap.xml` and keeps only `/resources/`: 6 best-practice checklists and 4 role quick guides, 10 links of 1,338 sitemap URLs on 2026-11-01. Courses, course lessons, videos, the glossary, learning paths, assessments and certifications are product training rather than best-practice or development reference, so they are excluded. The sitemap is served as `application/rss+xml`, but the body is a standard `urlset` and three fetches returned the same resource list, so it is a stable index. Webflow University asserts no open content license, so only links and metadata are kept.

Evaluated for separate registration on 2026-11-01, each locally synced in the first candidate and pending its own issue and PR:

- `webflow-skills` ([issue 291](https://github.com/JFusco/brain/issues/291)): `plugins/webflow-skills/skills/`, the native `agents/webflow-agent.md`, both READMEs and the MIT `LICENSE` (33 skills and 27 supporting documents). Plugin manifests, MCP configuration and contributor instructions are not selected.
- `webflow-mcp-server` ([issue 292](https://github.com/JFusco/brain/issues/292)): only the README of the official MIT server repository, like the Chrome DevTools MCP registration. This differs from the README watch-list convention of recording MCP servers as website pointers because the issue asks for a reference catalog.

No hook definitions exist in `webflow/webflow-skills` or `webflow/mcp-server` at the evaluated commits. Third-party Webflow skill and MCP repositories are not registered. The developer documentation asserts no open content license, so the catalog keeps only links and metadata.

Catalog coverage is not runtime verification. Rolling pages require checks of the site plan, token scopes, API version, CLI or package version and MCP client before use. The [registration journal](../journal/2026-11-01-webflow-coverage.md) and the [University registration journal](../journal/2026-11-01-webflow-university-resources.md) record the local evidence. Reverting this registration removes the domain, source, catalog, lock entry and hub together.
