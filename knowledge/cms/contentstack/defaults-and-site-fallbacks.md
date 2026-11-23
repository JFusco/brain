---
title: "Separate CMS defaults from site rendering fallbacks"
format: "note"
domain: "cms/contentstack"
aliases: ["stack-specific defaults", "empty field fallback", "shared content model defaults"]
evidence_date: "2026-11-23"
applicability: "Contentstack headless CMS defaults and proposed application fallbacks for shared schemas across sites"
provenance: "contentstack-docs@48c0691b708c6f774789d98cae134a11fad04b1ae5947b74bcf0de03714c58ea; current Default Value reference reviewed 2026-11-23; sanitized application configuration proposal"
status: "current"
versions: []
reviewed_at: "2026-11-23"
---

# Separate CMS defaults from site rendering fallbacks

## When to use this

Use this when sites reuse a content model but need different presentation defaults. First decide whether authors need a stored initial value in the CMS or consumers need an effective value at rendering time.

## What to do

**Documented:** Contentstack's [Default Value property](https://www.contentstack.com/docs/headless-cms/default-value) supplies an editable initial field value when a new entry is created. Changing the configured default affects new entries; existing entries keep their values.

**Proposed practice:** when a shared schema should remain identical and the difference is presentation policy, consider resolving explicitly empty fields through site configuration in the application:

1. Select the site configuration explicitly; do not infer it from an unrelated entry.
2. Define which values count as empty for that field. Preserve meaningful authored values, including `false` and `0`, instead of using a blanket truthiness fallback.
3. Document the effective fallback and apply the same policy to relevant preview and delivery consumers. Verify those consumers with authored, missing and intentionally empty values.
4. If the value must be stored or visible as a CMS prefill, address that requirement separately. A rendering fallback neither writes entries nor changes the native field default.

## Evidence and limits

The vendor reference establishes creation-time defaults and the effect of later default changes. Site configuration, emptiness rules and consumer consistency are proposals, not native Contentstack guarantees. No custom-field SDK property, automatic backfill, stack-aware prefill or deployed implementation is asserted.

See [editor guidance from field definitions](editor-guidance-from-field-definitions.md) for keeping defaults, placeholders, validation and instructions distinct. Changing a rendering policy may alter output for existing empty entries even though their stored data is unchanged; review that behavior before adoption.
