---
title: "Derive Contentstack delivery types from the actual schema"
format: "playbook"
domain: "cms/contentstack"
aliases: ["types-generator", "ref_multiple", "reference cardinality", "editable tags"]
evidence_date: "2026-11-08"
reviewed_at: "2026-11-08"
applicability: "Contentstack upgraded reference fields, TypeScript Delivery SDK 5.x integration planning, and types-generator source declaring 3.10.6 at the cited commit; validate the installed artifact"
provenance: "contentstack-docs@1bbcba6a610fa0f5d9e5da1016725d7462d0a92c09ef754a2747f506db6abcb9; contentstack/types-generator@e1196a8b920c21da351f164bd38b2434b64ea54b source inspection; official pages read 2026-11-08; no generator or CMS mutation executed"
status: "current"
versions: []
---

# Derive Contentstack delivery types from the actual schema

## When to use this

Use when building typed components from Contentstack content types and global fields. Align the generator input with the schema actually stored in the intended stack and branch; an authoring model is not automatically a complete delivery response.

## What to do

1. **Proposed:** read back and compare the pushed schema before generating types. The [Delivery SDK entry reference](https://www.contentstack.com/docs/developers/sdks/content-delivery-sdk/typescript/reference/entry) shows `fetch<T>()`; supplying a TypeScript type argument does not itself validate JSON. Keep runtime validation or representative response checks separate from generic result typing, including query `find<T>()` usage supported by the selected SDK.
2. **Documented:** the [Reference schema example](https://www.contentstack.com/docs/headless-cms/json-schema-for-creating-a-content-type#reference) uses `multiple: false` and `field_metadata.ref_multiple`. **Proposed:** use the reference-specific cardinality control rather than treating generic `multiple` as interchangeable. Confirm single versus multi-entry constraints against stored schema and values.
3. **Documented:** [upgraded references](https://www.contentstack.com/docs/headless-cms/reference-field-upgradation) use arrays of objects containing `uid` and `_content_type_uid`, replacing the older string-array input. Stacks created after July 29, 2019 use the upgraded field. The page states limits of 50 content types, 200 entries and include depth three for that multi-content-type surface. **Unverified historical report:** inspected stack exports used array `reference_to`, `ref_multiple_content_types: true` and `multiple: false`. Confirm those actual flags for the target; this report is not proof of how CMA handles invalid `multiple: true` input.
4. **Source inspection:** the [offline generator entry](https://github.com/contentstack/types-generator/blob/e1196a8b920c21da351f164bd38b2434b64ea54b/src/generateTS/index.ts) accepts supplied content types/global fields through asynchronous `generateTSFromContentTypes`, with `systemFields`, `isEditableTags` and `includeReferencedEntry` options. This path is distinct from connected schema fetching. **Proposed:** evaluate the installed official generator before writing an emitter; preserve diagnostics and compare generated output with actual response shapes.
5. **Source inspection:** [reference generation](https://github.com/contentstack/types-generator/blob/e1196a8b920c21da351f164bd38b2434b64ea54b/src/generateTS/factory.ts) already constructs an array; the generic `multiple` transformation can add another array layer. This explains a risk of nested arrays, without reproducing the captured generator run. [Built-in types](https://github.com/contentstack/types-generator/blob/e1196a8b920c21da351f164bd38b2434b64ea54b/src/generateTS/stack/builtins.ts) require much more asset metadata than `uid`, `url` and `title`. Do not weaken vendor types solely to fit old fixtures.
6. **Proposed:** preserve modular-block UID wrappers and applicable `_metadata.uid`, distinguish unexpanded reference identities from expanded entries, and generate editable-tag types from the selected release. The [inspected helper](https://github.com/contentstack/types-generator/blob/e1196a8b920c21da351f164bd38b2434b64ea54b/src/generateTS/shared/cslp-helpers.ts) permits string mappings or objects with optional `data-cslp` and `data-cslp-parent-field`; a required single-attribute object is too narrow.

## Evidence and limits

For preview, reuse [request-local stack guidance](kickstart-skill-applicability.md). The official [SSR App Router guide](https://www.contentstack.com/docs/headless-cms/live-preview-implementation-for-nextjs-ssr-app-router) creates a client per request, applies `livePreviewQuery`, then fetches through that client; initialize browser preview utilities in a dedicated client component. Its JavaScript SDK syntax must not be copied unchanged into the TypeScript SDK. No concurrent preview was tested.

The [change-management guide](https://www.contentstack.com/docs/headless-cms/content-type-change-management) warns about schema changes and reference impact. Prefer a reviewed new-field-and-migrate plan for incompatible changes; a type mismatch is not permission to overwrite live schema. Historical stack exports and generator outputs remain unverified reports. No package installation, generator execution, CMS write or migration acceptance was performed for this note.
