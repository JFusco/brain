---
title: "Keep CMS rendering contracts and generator choices distinct"
format: "playbook"
domain: "tooling"
aliases: ["cms-field-vocabulary", "rendering-surface profile", "field type generation"]
evidence_date: "2026-11-08"
reviewed_at: "2026-11-08"
applicability: "cms-field-vocabulary 1.4.0 inspected as package data; consuming generators must select their exact installed profile and SDK version"
provenance: "Installed cms-field-vocabulary 1.4.0 README, profile JSON and react-nextjs policy inspected without executing vendor code; sitecoreai-docs@9fd006f795cca43a5e859d3a227d03693b965bc1df04046bf18d0654e36695d4; proposed consumer mapping and provenance procedure"
status: "current"
versions: []
---

# Keep CMS rendering contracts and generator choices distinct

## When to use this

Use when a generator derives props, renderer imports or fixtures from canonical CMS field IDs. An authoring field's name does not establish its SDK delivery shape.

## What to do

1. **Documented package contract:** the [versioned README](https://github.com/JFusco/cms-field-vocabulary/blob/v1.4.0/README.md) separates product version, surface, transport and consumer policy. **Proposed:** select the exact rendering/SDK profile, then establish correspondence to the authoring field using the native token and reviewed product mapping. Do not derive authority from ID suffixes or assume equal tokens across different products imply equivalence. No automatic authoring-to-SDK crosswalk is established by the inspected data.
2. **Observed package data:** fields carry `claims.valueShape` with status/evidence and, when documented, shape details; `renderingOperations` carry paths, renderer IDs, prohibitions and sometimes selection discriminators. The `react-nextjs` policy maps renderer IDs to package/export bindings. **Proposed:** consume the selected contract and its actual shape, including wrappers and nullability, rather than copying catalog tables into permanent generator rules.
3. **Proposed provenance labels:** use `rendering-contract` for a documented rendering shape, `contract-operation+native-schema` when a documented operation needs member details established by the actual schema, and `consumer-choice` for an application decision unsupported by either. These labels are suggested consumer bookkeeping, not vendor requirements or package API fields. Preserve the exact profile, package version and evidence locator with each decision.
4. **Documented package contract:** `resolveFieldContracts` accepts an agent profile and explicit `renderingSelections`; mutually exclusive branches fail closed without a supported choice. **Proposed:** inspect all applicable operations and their authority. A policy scoped to SDK 2 cannot be assumed to govern SDK 3 media references. A missing shape stays unknown until a separate official contract or native schema supports it.

## Evidence and limits

At the inspected release, Contentstack's profile is a management surface; that is not a complete Delivery SDK response contract. **Separately documented:** SitecoreAI's [rendering-data field reference](https://doc.sitecore.com/sai/en/developers/sitecoreai/introduction-to-framework-agnostic-sitecore-development/content-rendering/field-types-in-rendering-data.html) represents Number/Integer values as strings, Checkbox as `"1"` or `""`, and Multilist/Treelist values as item arrays without a `value` wrapper. Resolver configuration still determines where fields come from. Where the package leaves a list shape undocumented, record this separate official evidence instead of claiming the package supplied it. Token matching and provenance labels remain proposed implementation choices.

The historical capture inspected an older package. Its field counts and application-specific label are not promoted as a current universal crosswalk. Resolve selected fields from the installed package and follow their vendor locators. No generator output, native CMS response or rendering was executed here. See [Contentstack schema-derived types](../cms/contentstack/schema-derived-delivery-types.md) and [Optimizely component contracts](../cms/optimizely-saas/sdk-component-contracts.md).
