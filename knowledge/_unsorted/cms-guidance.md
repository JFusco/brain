---
title: "Choose CMS guidance by product and integration"
domain: "_unsorted"
aliases: ["CMS best practices","CMS skills","SDK guidance"]
evidence_date: "2026-10-15"
applicability: "CMS source selection; current registry coverage does not establish API compatibility"
provenance: "sitecore-content-sdk@e51294172719bbc0a2a71245539cf3d3bd872a1e; contentstack-kickstart@0c9aca728b7113a6a64a2ccea2b3b448c45529fa; contentful-skills@9100f17361fe0ed074b9ecd84aea9b210447e463; optimizely-sdk@01fb2b56ee24d54a4e1b3c0580727a2d07145bde"
---

# Choose CMS guidance by product and integration

## When to use this

Use this before applying a CMS skill or SDK example to an integration, content model, rendering task, or migration.

## What to do

Identify the exact CMS product, authoring or delivery surface, installed SDK, and application workspace. Select the corresponding hub:

| Target | Available Brain guidance | Applicability check |
| --- | --- | --- |
| [SitecoreAI](../cms/sitecore-ai/INDEX.md) | Official Content SDK source and constrained skill bundle | The current matcher requires Content SDK 2.x, Next.js 16.x, Cache Components, App Router layout, and required scripts and paths. Confirm these in the target application. |
| [Sitecore XP](../cms/sitecore-xp/INDEX.md) | Official website pointer | Do not substitute SitecoreAI or Content SDK guidance for XP without product-specific evidence. |
| [Optimizely SaaS](../cms/optimizely-saas/INDEX.md) | Official JavaScript SDK documentation | This source is documentation, not an installable skill. Check the target SDK version and API surface. |
| [Contentstack](../cms/contentstack/INDEX.md) | Official kickstart references and website pointer | The kickstart skills are reference-only; template assumptions need confirmation. |
| [Contentful](../cms/contentful/INDEX.md) | Official skill references and website pointer | These skills are reference-only in the current registry; verify the SDK and whether the task concerns delivery, management, or preview. |

Read only the relevant source sections. Keep authoring labels, model identities, SDK delivery shapes, and renderer behavior separate until evidence connects them. A source refresh is a new documentation observation, not permission to rewrite a project's content model or upgrade its packages.

## Evidence and limits

The table describes this Brain registry and matcher on the evidence date. It does not claim that every upstream skill has been technically evaluated or that all product versions are covered. The local Sitecore matcher is conservative and combines workspace dependency declarations; confirm the target workspace directly. Website pointers are not mirrored snapshots and may require live access. Missing or inaccessible evidence remains a documented limitation.
