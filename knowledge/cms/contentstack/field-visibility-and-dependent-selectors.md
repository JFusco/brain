---
title: "Check field visibility limits before dependent selectors"
format: "note"
domain: "cms/contentstack"
aliases: ["field visibility rules", "dependent taxonomy selector"]
evidence_date: "2026-11-23"
applicability: "Contentstack headless CMS field visibility rules in current documentation; custom selector design remains proposed"
provenance: "contentstack-docs@48c0691b708c6f774789d98cae134a11fad04b1ae5947b74bcf0de03714c58ea; current field visibility limitations and Custom Field location references reviewed 2026-11-23"
status: "current"
versions: []
reviewed_at: "2026-11-23"
---

# Check field visibility limits before dependent selectors

## When to use this

Use this when one field selection should change an author's available fields or choices, particularly when a taxonomy term appears to be the controlling value.

## What to do

**Documented:** Contentstack's [field visibility limitations](https://www.contentstack.com/docs/headless-cms/limitations-of-field-visibility-rules) allow at most ten rules per content type, five conditions per rule and five target fields per rule. Taxonomy fields cannot be operands. Multiple fields and several other types are also excluded as operands; check the complete list for the actual model.

**Proposed:** list the controlling field, its type and multiplicity, the intended targets, and whether the requirement concerns whole-field visibility or the options inside a selector. Count targets per rule. Five target fields is not a five-site or five-taxonomy-term limit.

If the controlling field is unsupported, reconsider the authoring model or evaluate a custom selector. Contentstack documents a [Custom Field app location](https://www.contentstack.com/docs/developer-hub/custom-field-location), but this alone does not establish a working dependent-selector implementation. Define value persistence, invalid combinations and changes to the controlling value before committing to that design. Do not assume hiding a field provides authorization or validates every content-writing route.

## Evidence and limits

The numeric limits and operand exclusions are documented facts checked on the review date. The decision procedure and custom-selector evaluation are proposed practices. No custom field, dynamic option loading, permission boundary or migration was implemented or tested; no effort estimate or universal product-version compatibility is implied.

This complements [editor guidance from field definitions](editor-guidance-from-field-definitions.md): instructional prose explains authoring intent, while visibility conditions and validation require their own explicit contracts.
