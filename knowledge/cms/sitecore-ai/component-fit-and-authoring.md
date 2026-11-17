---
title: "Verify component fit and structured authoring"
format: "playbook"
domain: "cms/sitecore-ai"
aliases: ["native component eligibility", "parent slot permissions", "structured authoring measurement"]
evidence_date: "2026-11-17"
reviewed_at: "2026-11-17"
applicability: "SitecoreAI headless component mapping and CMS migration review; inspect the actual destination library, deployed frontend and template configuration; installed SDK versions unknown"
provenance: "sitecoreai-docs@990c292d5263b8072170408901f746c55a1e01403696b69cbf36e52f92467d77; official variant documentation read 2026-11-17; sanitized proposed mapping and measurement practices"
status: "current"
versions: []
---

# Verify component fit and structured authoring

## When to use this

Use when replacing source galleries, navigation groups, directories or integrations with an existing CMS component library, or reporting how much content editors can maintain through meaningful fields. [Publication-stage acceptance](publication-stage-and-route-acceptance.md) governs which environment and surface to verify; this page governs component choice and the measurement denominator.

## What to do

### Establish legal placement and deployed behavior

**Documented:** Sitecore's [variant procedure](https://doc.sitecore.com/sai/en/developers/sitecoreai/content-modeling-and-presentation/sitecoreai-for-developers/content-editor-items/components/create-a-variant-for-a-component.html) requires component code plus a matching Content Editor variant definition. Variant Details can select page templates; an empty selection makes the variant available for all pages. Its example renders text in one variant and text plus a link in another. A stored link field therefore needs the appropriate rendering implementation.

**Proposed:** keep component registration, frontend implementation, site/page-template eligibility, exact parent-slot permission and observed browser behavior as separate evidence. A component name or column ratio cannot establish legal placement. Inspect fields, inherited defaults, rendering parameters, named variants and child-slot definitions separately. Select a permitted composition that preserves meaningful image, title, link, target and ordering roles.

**Proposed:** pilot the selected variant in its actual page context with representative item counts and normal editor controls. Verify displayed images, usable link actions and the result of a representative author edit. Record incomplete fit as unfinished work for that configuration, not a universal platform restriction. Reuse a verified mapping inventory at the same known revision; refresh affected evidence after schema, configuration or deployment changes. This does not require a second discovery engine. Keep [field/SDK contract provenance](../../tooling/cms-rendering-contract-provenance.md) separate from these placement checks.

### Measure active source features

**Proposed:** define the source feature sections and their crosswalk before reporting a structured-authoring percentage. Evaluate each gallery, directory or navigation group by its image/title/link/item/order fields and editor controls, not merely its native outer renderer or number of supporting records. State the denominator, classification rules and unassessed features with the result.

Report structured features, opaque feature HTML, ordinary editorial rich text and external integrations separately. Paragraphs, headings, editorial links and suitable technical tables are not automatically custom widgets. An iframe can expose editable integration settings without making the provider's form fields CMS-authored.

Count only the current effective layout and its actual datasource dependencies. Retained originals, inactive alternatives and conditional restorations are recovery evidence, not current feature usage. Resolve final-layout, design and inherited-reference uncertainty before claiming a complete percentage. Source preservation, structured storage, rendered behavior and client acceptance remain separate outcomes. Follow the consuming project's styling policy; this is no universal ban on rich text or embedded styles.

## Evidence and limits

The vendor page establishes variant configuration, not a destination's complete slot contract or authoring quality. All mapping and measurement procedures are proposed and unexercised in this curation. Historical reports of rejected placements, missing rendered actions, cardinality-sensitive behavior, native remapping and successful readback are deliberately omitted as incident outcomes; their reusable checks are represented above. No whole-site percentage, automatic classifier, cache-invalidation implementation or migration-speed benchmark is established. Incidental execution-runtime versions do not establish frontend compatibility.
