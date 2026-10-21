---
title: "Generate editor guidance from reviewed field definitions"
domain: "cms/contentstack"
aliases: ["field help text", "Instruction Value", "functional specification guidance"]
evidence_date: "2026-10-21"
reviewed_at: "2026-10-21"
status: "current"
versions: []
applicability: "Contentstack authoring guidance and proposed CMS-neutral specification generation; target product/version and adapter behavior require verification"
provenance: "contentstack-docs@27fb06e5aabe557865140dfcf163b8576b091a0711ecf2d98737750645f1543d; official Academy and field-property pages read 2026-10-21; sanitized generator proposal, no metadata deployment validated"
---

# Generate editor guidance from reviewed field definitions

## When to use this

Use this when a functional specification defines CMS fields and editors repeatedly need explanations, or separately maintained authoring documents diverge from the configured model. Reuse the approved field definition as the proposed source of overlapping guidance.

## What to do

1. **Documented recommendation:** Contentstack Academy’s [collaboration lesson](https://www.contentstack.com/academy/courses/cms-developer-foundations/collaboration-patterns-that-work-and-fail) recommends content-type descriptions and contextual field guidance, updated when editors ask recurring questions. This is curriculum advice, not an API requirement for nonempty prose on every field.
2. **Proposed:** write concise guidance for editor-facing fields: purpose, expected value, where it appears, applicable format/constraints, empty behavior and a useful example. Avoid filler for obvious fields and instructions that pretend internal fields require editor input. Have editors review the wording with realistic content.
3. **Documented:** [Instruction Value](https://www.contentstack.com/docs/headless-cms/instruction-value) appears beneath the field in the entry form. [Help Text](https://www.contentstack.com/docs/headless-cms/help-text) appears through a question-mark tooltip beside the field name. **Proposed:** put essential directions in visible instructions and supplementary explanations in help text; do not conflate the two target properties.
4. **Documented:** the [Single Line Textbox reference](https://www.contentstack.com/docs/headless-cms/single-line-textbox) separately lists instructions, help, validation, validation messages, defaults and placeholders. **Proposed:** keep these concepts, requiredness and examples distinct in the reviewed source definition. Prose does not enforce a rule; suggested copy lengths do not automatically become validation limits. Do not invent unknown requirements.
5. **Proposed:** add first-class editor guidance and an author-facing content-type purpose to the existing field-definition contract. Render approved text into the functional spec, authoring reference and supported CMS model properties. Keep that contract CMS-neutral and map each concept with a target-specific adapter; report unsupported properties instead of silently discarding them or claiming deployment succeeded.
6. **Proposed:** review guidance with field behavior changes. Reconcile editor answers into the approved definition before regeneration. Compare generated and configured text and preserve newer editor changes for reconciliation rather than overwriting them. Start with the existing generator/model-review workflow; a separate synchronization service needs a demonstrated requirement.

## Evidence and limits

The official pages establish the recommendation and native presentation mechanisms. Academy language about guidance being current or visible is not a guarantee: CMS text can become stale, and tooltip-only help is neither continuously visible nor proof of accessible authoring. Do not generalize an illustrative SEO character count into a universal rule.

**Proposed:** keep functional specifications for behavior, dependencies, accessibility, acceptance criteria, migration decisions and rationale; put concise field-authoring guidance at the point of use. Generating shared text from one reviewed definition aims to reduce duplication, not replace every external document.

A private capture reports a targeted interface inspection, not a complete generator audit. That historical report and its incidental application version do not establish a missing feature in every output. No generator extension, CMS-neutral adapter, drift reconciliation, metadata write, editor visibility, accessibility result or support reduction was implemented or verified here. Confirm the target product/version and installed SDK independently before applying this proposal.
