---
title: "Choose CMS guidance by product and integration"
domain: "_unsorted"
aliases: ["CMS best practices","CMS skills","SDK guidance"]
evidence_date: "2026-10-21"
reviewed_at: "2026-10-21"
status: "current"
versions: []
applicability: "CMS source selection; current registry coverage does not establish API compatibility"
provenance: "sitecore-content-sdk@27af66d9c81f143927c96d8dc543d852b5c30b69; contentstack-kickstart@0c9aca728b7113a6a64a2ccea2b3b448c45529fa; contentful-skills@0cfae213be9117da4b5b42451d8c0515d363f894; optimizely-sdk@9caeb460e8de4911f1c5fac13b6174c8036995fa; sitecore-xp-docs@08b5fa1d9b1bdcd8dbfc634f4b626e214b12eb21a70f96dcec5c7b86c0f07ff1"
---

# Choose CMS guidance by product and integration

## When to use this

Use this before applying a CMS skill or SDK example to an integration, content model, rendering task, or migration.

## What to do

Identify the exact CMS product, authoring or delivery surface, installed SDK, and application workspace. Select the corresponding hub:

| Target | Available Brain guidance | Applicability check |
| --- | --- | --- |
| [SitecoreAI](../cms/sitecore-ai/INDEX.md) | Official Content SDK source and constrained skill bundle | The registered bundle is the App Router + Cache Components template. In one selected application, confirm Content SDK 2.x, Next.js 16.x, enabled Cache Components, required scripts and paths. Installed versions and declared-only ranges remain different evidence. |
| [Sitecore XP](../cms/sitecore-xp/INDEX.md) | Official Experience Manager 10.4 developer-manual link catalog | Keep the selected product and version in scope; this is not every XP manual. Do not substitute SitecoreAI or Content SDK guidance for XP without product-specific evidence. |
| [Optimizely SaaS](../cms/optimizely-saas/INDEX.md) | Official JavaScript SDK documentation and SaaS/Graph catalogs | This source is documentation, not an installable skill. Check the target SDK version and API surface. |
| [Contentstack](../cms/contentstack/INDEX.md) | Official kickstart references and documentation link catalog | The kickstart skills are reference-only; template assumptions need confirmation. |
| [Contentful](../cms/contentful/INDEX.md) | Official skill references and focused API/JavaScript documentation pointers | These skills are reference-only in the current registry; verify the SDK and whether the task concerns delivery, management, or preview. |

For Contentful, choose delivery or Preview before copying an example; see [Choose Contentful delivery or Preview before copying examples](../cms/contentful/preview-api-surface.md).

Read only the relevant source sections. Keep authoring labels, model identities, SDK delivery shapes, and renderer behavior separate until evidence connects them. A source refresh is a new documentation observation, not permission to rewrite a project's content model or upgrade its packages.

## Evidence and limits

The table describes this Brain registry and matcher on the evidence date. It does not claim that every upstream skill has been technically evaluated or that all product versions are covered. The local matcher selects one application and rejects an ambiguous monorepo root; it never combines sibling dependencies. Its Content SDK 2.x/Next.js 16.x checks are a conservative local filter, not an upstream guarantee or permission to install. Confirm exact installed packages and the consuming repository's contract before application. Use `lookup --project <root> --workspace <app> --query <terms>` on demand; never infer precise compatibility from a rolling catalog or declared-only range.

**Revalidated October 21, 2026:** the current pinned [Contentful API guide](https://github.com/contentful/skills/blob/0cfae213be9117da4b5b42451d8c0515d363f894/skills/contentful-api/SKILL.md) distinguishes management, published delivery and preview. The October 21 check retrieved and read the API guide and Preview example at the refreshed pin; management, published delivery and draft Preview remain distinct. It remains useful for source selection, but the linked Preview overview still contains a Sync example that conflicts with the live API contract; follow the [separate Preview note](../cms/contentful/preview-api-surface.md) before using it.

**Documented entry points:** the pinned [Sitecore overview](https://github.com/Sitecore/content-sdk/blob/27af66d9c81f143927c96d8dc543d852b5c30b69/packages/create-content-sdk-app/src/templates/nextjs-app-router-cache-components/.agents/docs/AGENTS-overview.md) describes the selected App Router/Cache Components scaffold, not every Sitecore application. The pinned [Optimizely SDK overview](https://github.com/episerver/content-js-sdk/blob/9caeb460e8de4911f1c5fac13b6174c8036995fa/docs/README.md) distinguishes code-defined content types, CMS authoring, Graph delivery and registered rendering components. The scheduled source check read both refreshed entry points again: Sitecore still limits the overview to that scaffold, and Optimizely still describes code-defined types, CMS authoring, Graph delivery and registered components. The current SDK overview links a CMS 13 PaaS guide, but its opening workflow remains explicitly SaaS; that link does not turn this SaaS routing row into a PaaS compatibility claim. These entry points do not certify every linked example.

**Local observation:** the table was compared with Brain's current registry, catalogs and hubs. Sitecore XP now has a selected Experience Manager 10.4 developer-manual catalog, rather than only a pointer. Contentstack's kickstart bundle and Contentful's skills remain reference-only. Inspection of Brain's project-context and skill-selection code confirmed application selection, installed-versus-declared confidence and the conservative Sitecore filter; no consuming project was inspected or executed. Historical response-byte comparisons remain in Git history, not evidence of current application correctness. No source refresh authorizes installing a skill or changing another repository.
