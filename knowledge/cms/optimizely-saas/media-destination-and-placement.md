---
title: "Choose Optimizely media destination and placement text"
domain: "cms/optimizely-saas"
aliases: []
evidence_date: "2026-10-22"
reviewed_at: "2026-10-26"
status: "current"
versions: []
applicability: "CMS SaaS and CMP integration planning; SDK documentation at the cited commit; hosted versions and consuming application behavior unverified"
provenance: "optimizely-sdk@90ba04cfb89be124c34e6598b3a5ff0989b36f2b; optimizely-cms-saas-docs@ae548b9dfcc952b0ce044cc0331517c2155d9a8da61cacb1b11285231415ac9e; official pages read 2026-10-22; sanitized authored reports and proposed procedures"
---

# Choose Optimizely media destination and placement text

## When to use this

Use this before importing images into CMS media or CMP DAM, especially when the same binary appears in several languages or placements.

## What to do

1. **Proposed:** choose the destination explicitly per project, normally one path for the migration. Confirm entitlement, credentials, folder scope and frontend support before mapping references. A CMS media default is a proposed project choice, not a vendor rule; existing mixed sites still need both rendering paths.
2. **Documented:** the [pinned SDK DAM guide](https://github.com/episerver/content-js-sdk/blob/d85caa8a0dce2291204417dd8ec9bc4f95963fdd/docs/guides/dam-assets.md) distinguishes DAM references with an `item` of type `cmp_PublicImageAsset`, `cmp_PublicVideoAsset` or `cmp_PublicRawFileAsset` from CMS media references with `item: null` and `url.default`. These delivery shapes do not define the REST write contract.
3. **Documented:** the [REST creation example](https://docs.optimizely.com/cms-saas/docs/create-content-and-a-page-using-the-api) places `key`, `contentType` and `container` on the item and wraps example properties as `{ "value": ... }` under `initialVersion.properties`. It demonstrates a page, not a complete media-upload procedure.
4. **Proposed:** deduplicate binaries with a stable source hash, retain destination identity, and reuse one media record across locales where the target supports it. Confirm invariant-media and reference payload behavior separately before relying on them.
5. **Proposed:** model localized, context-dependent alt text beside the consuming image reference. Check an explicit placement override before the SDK helper, preserving an intentionally empty decorative override rather than using a truthiness fallback. The pinned guide documents `getAlt` as DAM `AltText`, then supplied fallback, then empty string; a fallback argument alone does not override DAM text.
6. **Documented:** the [DAM picker](https://docs.optimizely.com/cms-saas/docs/dam-assets) requires a block containing a content reference for DAM use in a Content Area. Renditions must already exist in DAM. [Renditions](https://docs.optimizely.com/cms-saas/docs/manage-assets-with-dam) apply to images and videos, not raw files. **Proposed:** preserve the original asset and let an editor select a supported rendition or the frontend select delivery sizes; do not confuse renditions with replacement versions.

## Evidence and limits

**Unverified reports:** reviewed private plans described invariant `_image` media under an application root, cross-locale reuse and `cms://content/<key>` references; a DAM plan used `cms://content/DamImageSource/<asset-id>` and analogous video/file forms. A later report described empty-alt invariant-media readback without `locale` or `properties`. None was reproduced here, and plan inspection is not connected acceptance. These strings are reported examples, not validated payload recipes.

Non-empty asset-level localized alt persistence, Graph exposure of CMS media alt, CMP metadata translation and upload limits remain unverified. The historical empty-alt report does not prove that every media type rejects localized fields. No application SDK range is inferred from a single reported installation. Before implementation, check a bounded target readback and the consuming renderer. See [CMP upload boundaries](cmp-upload-and-reconciliation.md) and the [proposed organization policy](../../_unsorted/asset-organization-by-use.md).

**Revalidated October 23, 2026:** The current CMS REST page example, DAM picker and rendition guidance were re-read. Property value wrappers in the page example, Content Area block workaround and existing image/video renditions remain supported; these pages do not validate the historical media URI recipes or localized-alt persistence. Existing pinned SDK evidence is unchanged.

**Revalidated October 26, 2026:** The refreshed pinned DAM guide still distinguishes populated CMP asset items from CMS media item:null and url.default, and getAlt still selects DAM AltText before a supplied fallback. Live REST page wrappers, Content Area block workaround and image/video-only renditions were rechecked. Historical media URI recipes, localized-alt persistence and target compatibility remain unverified.
