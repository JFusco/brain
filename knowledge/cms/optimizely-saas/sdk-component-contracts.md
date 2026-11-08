---
title: "Use Optimizely SDK component and validation contracts"
format: "playbook"
domain: "cms/optimizely-saas"
aliases: ["ContentProps", "component registry", "Optimizely Storybook"]
evidence_date: "2026-11-08"
reviewed_at: "2026-11-08"
applicability: "Optimizely CMS JavaScript SDK 3 documentation at the cited commit; verify the installed package's declarations and content model"
provenance: "optimizely-sdk@8df53b9af159f2a44d9c88f5157fd769362bc666; official rendering, display-template, property and validation references read 2026-11-08; proposed fixture/browser integration"
status: "current"
versions: []
---

# Use Optimizely SDK component and validation contracts

## When to use this

Use for React components backed by `contentType(...)` definitions, including fixtures rendered in Storybook. Keep SDK-version contracts separate from CMS authoring types and project choices about reference usage.

## What to do

1. **Documented:** [rendering guidance](https://github.com/episerver/content-js-sdk/blob/8df53b9af159f2a44d9c88f5157fd769362bc666/docs/learn/render-with-react.md) types the component's `content` prop as `ContentProps<typeof MyContentType>`. **Proposed:** derive props and fixtures from the installed declaration instead of maintaining a parallel field table. For complete Graph content items, preserve nullability and the required `_id`, `_metadata` and `__typename` envelope; do not use an assertion to conceal missing fixture metadata. **Documented exception:** the [property reference](https://github.com/episerver/content-js-sdk/blob/8df53b9af159f2a44d9c88f5157fd769362bc666/docs/reference/property-types.md) says embedded `component` values are typed as full `ContentProps`, but their query fetches only component properties, without `_metadata`. Match fixtures to that queried surface rather than manufacturing metadata.
2. **Documented:** the [React reference](https://github.com/episerver/content-js-sdk/blob/8df53b9af159f2a44d9c88f5157fd769362bc666/docs/reference/react-components.md) registers all components in one `initReactComponentRegistry({ resolver })` call. Later calls replace the registry. Keys are content-type keys; variants use `Type:Tag` or `{ default, tags }`. Route content through `OptimizelyComponent`, which needs `__typename`. Experience rendering passes `content.composition.nodes ?? []` to `OptimizelyComposition`.
3. **Documented:** [display templates](https://github.com/episerver/content-js-sdk/blob/8df53b9af159f2a44d9c88f5157fd769362bc666/docs/guides/display-templates.md) likewise need one complete `initDisplayTemplateRegistry` registration before rendering; a later call replaces its list. **Proposed:** centralize initialization without making stories import application startup.
4. **Documented:** the [property reference](https://github.com/episerver/content-js-sdk/blob/8df53b9af159f2a44d9c88f5157fd769362bc666/docs/reference/property-types.md) distinguishes link/reference destinations at `url.default` from a URL value's `default`. **Proposed:** preserve that shape and null handling. A content-reference type alone does not select link versus media rendering; record the intended usage and applicable renderer.
5. **Documented:** [`toSchema(...).safeParse`](https://github.com/episerver/content-js-sdk/blob/8df53b9af159f2a44d9c88f5157fd769362bc666/docs/guides/validating-external-data.md) checks external items such as fixtures and cached JSON. It is not complete domain validation: null/missing properties pass even with `isRequired`, disabled-indexing properties are skipped, JSON/binary internals are unchecked, and URL/link checks only establish an object. **Proposed:** add the missing checks your application requires.

## Evidence and limits

The `/react/server` entry is server-only. For Storybook, follow [module-boundary guidance](../../nextjs/cms-preview-and-storybook-boundaries.md): import presentation and explicitly mock required exports, potentially `getPreviewUtils`, `withAppContext` or registry initialization, with behavior appropriate to the story. This is a proposed browser integration, not a vendor-provided universal stub.

The captured generated-app typecheck and detailed metadata checklist were not reproduced. Use the selected release's complete declaration instead of freezing that historical member list here. No SDK installation, connected preview, rendering or fixture acceptance was performed.
