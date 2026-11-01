---
title: "Webflow documentation coverage"
aliases: ["webflow-docs", "webflow-skills", "webflow-mcp-server", "webflow-university-resources"]
---

# Webflow documentation coverage

[Issue 290](https://github.com/JFusco/brain/issues/290) adds the `cms/webflow` domain with its first official, reference-only source, `webflow-docs`, using the existing catalog implementation. The [knowledge hub](../../knowledge/cms/webflow/INDEX.md) holds current counts and lookup commands. AGENTS.md and the README coverage policy require each new source to have its own registration change, and issue 290 asks for a split when they do, so the domain ships with the documentation source and the other three sources follow in separate registration PRs. The older WordPress registration bundled its sources; current policy takes precedence.

- `webflow-docs` follows `https://developers.webflow.com/sitemap.xml` (one index, 968 URLs on 2026-11-01). It keeps the developer home page and the MCP, Data API, Designer API, Webflow Cloud, DevLink, code components, CLI, Browser API and FlowKit sections: 721 links. The developer changelog (127 entries plus its index), the deprecated Data API v1 reference (54) and the v2.0.0-beta reference (65) are excluded, so Data API links describe the current v2 contract. Lookup fetches the Markdown that Webflow publishes by appending `.md`.

Evaluated for separate registration on 2026-11-01, each locally synced in the first candidate and pending its own PR:

- `webflow-skills`: `plugins/webflow-skills/skills/`, the native `agents/webflow-agent.md`, both READMEs and the MIT `LICENSE` (33 skills and 27 supporting documents). Plugin manifests, MCP configuration and contributor instructions are not selected.
- `webflow-mcp-server`: only the README of the official MIT server repository, like the Chrome DevTools MCP registration. This differs from the README watch-list convention of recording MCP servers as website pointers because the issue asks for a reference catalog.
- `webflow-university-resources`: the 10 `/resources/` checklists and role quick guides from `https://university.webflow.com/sitemap.xml`. Local retrieval succeeded, but courses, lessons, videos, glossary, assessments and certifications (about 1,300 URLs) are product training rather than best-practice or development reference, so they are excluded.

No hook definitions exist in `webflow/webflow-skills` or `webflow/mcp-server` at the evaluated commits. Third-party Webflow skill and MCP repositories are not registered. The developer documentation asserts no open content license, so the catalog keeps only links and metadata.

Catalog coverage is not runtime verification. Rolling pages require checks of the site plan, token scopes, API version, CLI or package version and MCP client before use. The [registration journal](../journal/2026-11-01-webflow-coverage.md) records the local evidence. Reverting this registration removes the domain, source, catalog, lock entry and hub together.
