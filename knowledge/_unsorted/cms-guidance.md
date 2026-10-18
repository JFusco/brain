---
title: "Choose CMS guidance by product and integration"
domain: "_unsorted"
aliases: ["CMS best practices","CMS skills","SDK guidance"]
evidence_date: "2026-10-18"
reviewed_at: "2026-10-18"
status: "current"
versions: []
applicability: "CMS source selection; current registry coverage does not establish API compatibility"
provenance: "sitecore-content-sdk@6ec243fc709bfb917e7ce9be6151e63d0f33c5b6; contentstack-kickstart@0c9aca728b7113a6a64a2ccea2b3b448c45529fa; contentful-skills@1e40a4c0e841faa5e7f1146a70c5eb605c7802d0; optimizely-sdk@5ef6268e688b35959d84b901c0bd6e81cb3669ef"
---

# Choose CMS guidance by product and integration

## When to use this

Use this before applying a CMS skill or SDK example to an integration, content model, rendering task, or migration.

## What to do

Identify the exact CMS product, authoring or delivery surface, installed SDK, and application workspace. Select the corresponding hub:

| Target | Available Brain guidance | Applicability check |
| --- | --- | --- |
| [SitecoreAI](../cms/sitecore-ai/INDEX.md) | Official Content SDK source and constrained skill bundle | The registered bundle is the App Router + Cache Components template. In one selected application, confirm Content SDK 2.x, Next.js 16.x, enabled Cache Components, required scripts and paths. Installed versions and declared-only ranges remain different evidence. |
| [Sitecore XP](../cms/sitecore-xp/INDEX.md) | Official website pointer | Do not substitute SitecoreAI or Content SDK guidance for XP without product-specific evidence. |
| [Optimizely SaaS](../cms/optimizely-saas/INDEX.md) | Official JavaScript SDK documentation and SaaS/Graph catalogs | This source is documentation, not an installable skill. Check the target SDK version and API surface. |
| [Contentstack](../cms/contentstack/INDEX.md) | Official kickstart references and documentation link catalog | The kickstart skills are reference-only; template assumptions need confirmation. |
| [Contentful](../cms/contentful/INDEX.md) | Official skill references and website pointer | These skills are reference-only in the current registry; verify the SDK and whether the task concerns delivery, management, or preview. |

For Contentful, choose delivery or Preview before copying an example; see [Choose Contentful delivery or Preview before copying examples](../cms/contentful/preview-api-surface.md).

Read only the relevant source sections. Keep authoring labels, model identities, SDK delivery shapes, and renderer behavior separate until evidence connects them. A source refresh is a new documentation observation, not permission to rewrite a project's content model or upgrade its packages.

## Evidence and limits

The table describes this Brain registry and matcher on the evidence date. It does not claim that every upstream skill has been technically evaluated or that all product versions are covered. The local matcher selects one application and rejects an ambiguous monorepo root; it never combines sibling dependencies. Its Content SDK 2.x/Next.js 16.x checks are a conservative local filter, not an upstream guarantee or permission to install. Confirm exact installed packages and the consuming repository's contract before application. Use `lookup --project <root> --workspace <app> --query <terms>` on demand; never infer precise compatibility from a rolling catalog or declared-only range.

The Contentful Preview evidence now lives with its note. The earlier Sitecore and Optimizely entry-point checks remain bounded historical evidence. The Contentful guide separates management, delivery and preview; the Optimizely overview separates CMS type definitions, Graph delivery and rendering. The Sitecore overview raw response differs from its archived snapshot only in CRLF/LF line endings; no exact response-byte equality is claimed. The selected Contentful and Optimizely entry-point responses matched their recorded hashes when checked. Source-specific claims are bounded to these entry points, not every upstream example or a consuming application run. See [the official Sitecore overview](https://github.com/Sitecore/content-sdk/blob/6ec243fc709bfb917e7ce9be6151e63d0f33c5b6/packages/create-content-sdk-app/src/templates/nextjs-app-router-cache-components/.agents/docs/AGENTS-overview.md), [Contentful API guide](https://github.com/contentful/skills/blob/1e40a4c0e841faa5e7f1146a70c5eb605c7802d0/skills/contentful-api/SKILL.md), and [Optimizely SDK overview](https://github.com/episerver/content-js-sdk/blob/5ef6268e688b35959d84b901c0bd6e81cb3669ef/docs/README.md). Website pointers require live access; a website-probe rate limit is separate from this focused API-reference retrieval and pinned repository verification.
