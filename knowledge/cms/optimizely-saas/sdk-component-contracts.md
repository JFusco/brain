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

## Expand constrained images only when custom properties are needed

**Documented:** at [the November 12 pinned property reference](https://github.com/episerver/content-js-sdk/blob/4f006d52ef4c3ec89ad07654fc42eed84736e786/docs/reference/property-types.md#content), `contentReference` selects a key and URLs; its `item` holds an enabled DAM asset, not arbitrary custom CMS Image fields. `content` selects the target's own properties. It requires nonempty `allowedTypes` or `restrictedTypes` constraints, and accepted types must be registered in `initContentTypeRegistry()` for fragment construction. Its TypeScript value is broad even though runtime content contains the target's properties. For arrays, place the type constraint on `items`.

**Proposed:** when a renderer needs localized alternative text or decorative intent owned by a custom Image item, consider an array of `content` constrained to that existing Image type. Keep reference-only selection when key/URL data is sufficient. Preserve localization and optionality, and review the persisted field/query contract before CMS synchronization; this is not evidence that an in-place production field conversion is safe. Prefer the existing typed query path over a per-image fetch loop, parallel alternative-text array or custom resolver unless a concrete requirement warrants one.

**Documented:** the [pinned React reference](https://github.com/episerver/content-js-sdk/blob/4f006d52ef4c3ec89ad07654fc42eed84736e786/docs/reference/react-components.md) maps content types to their components through the component registry. **Proposed:** register the Image view in the existing complete registry, and retain the installed SDK URL helper with the expanded item's native URL value. Verify that helper's accepted shape for the installed release. Share the actual view with controlled Storybook data through the existing server-only boundary rather than creating a second renderer.

**Proposed checks:** inspect the generated query for the constrained Image fragment and required custom fields before dispatch. Exercise the actual view with localized, decorative, absent-media and missing-alt cases; follow [image-purpose guidance](../../accessibility/image-purpose-and-missing-alt.md). Query generation and disconnected fixtures establish neither deployed schema nor published content, live delivery or editorial preview. Validate each connected stage separately.

**Evidence and limits:** the current property and React references were read at `optimizely-sdk@4f006d52ef4c3ec89ad07654fc42eed84736e786`. A private SDK 3 report described local query and rendering checks; the curator did not reproduce them. Its incidental frontend/tool versions and success counts are not compatibility ranges or production proof. Existing sections retain their earlier pinned documentation evidence.
