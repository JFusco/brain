---
title: "Keep image purpose distinct from missing alternative text"
format: "playbook"
domain: "accessibility"
aliases: ["decorative images", "missing alt text", "localized image alternatives"]
evidence_date: "2026-11-12"
reviewed_at: "2026-11-12"
applicability: "HTML image rendering and CMS image migration review; purpose depends on placement, and production fallback policy requires a separate decision"
provenance: "w3c-accessibility@c2c7fa790e32156b38b445e98c5dbe7b96dccda9030b876ca7100d2c0874d6c8; W3C image and functional-image tutorials read 2026-11-12; unverified private fixture report and proposed review practices"
status: "current"
versions: []
---

# Keep image purpose distinct from missing alternative text

## When to use this

Use when a CMS image model provides localized alternatives and an explicit decorative flag. Distinguish an absent optional image from a present image with incomplete accessibility data. The same image can serve a different purpose in another placement.

## What to do

1. **Documented:** [W3C's image tutorial](https://www.w3.org/WAI/tutorials/images/) calls for alternatives conveying an informative image's essential information, and `alt=""` for decorative images. A [functional image's alternative](https://www.w3.org/WAI/tutorials/images/functional/) conveys its action or destination. Evaluate purpose in context; a filename, header position or array order does not establish it.
2. **Proposed:** make explicit decorative intent select empty alt, including when stale descriptive text remains in the record. Otherwise require meaningful localized text for a present informative image during migration review. Missing text should remain a visible validation problem, not silently recategorize the image as decorative. A functional image needs an accessible name appropriate to its function; do not automatically reuse a visual description.
3. **Proposed:** omit optional media when it has no usable URL, subject to the component's content contract. Decide the production response to missing alternatives separately with the product's accessibility and availability requirements. Throwing during render was one reported local choice, not a universal production requirement.
4. **Proposed:** reuse the actual application image view in disconnected fixtures. Cover multiple locales, explicit decoration with existing text, absent optional media and an informative image missing text. Check image loading, accessible alternatives and omitted output at relevant viewport sizes. Constrain fixture networking explicitly if the test is meant to be disconnected; a successful build alone does not establish that boundary.

## Evidence and limits

W3C documents purpose-based alternatives, not this CMS flag or exception policy. A private report described controlled application-view, desktop/mobile and image-specific accessibility checks with local GET-only networking. Those historical successes were not reproduced here. Exact test counts, incidental package versions and accepted-looking fixture artwork are deliberately not generalized.

Fixture assertions and automated image checks do not establish the editorial quality of real alternatives, screen-reader user experience, full WCAG conformance, design parity or connected CMS delivery. Proposed checks must be exercised in the receiving project before claiming those outcomes.

Keep context-dependent alternatives with their placement when meaning varies, as discussed in [Optimizely media placement](../cms/optimizely-saas/media-destination-and-placement.md) and [Contentstack asset ownership](../cms/contentstack/asset-ownership-and-reuse.md). For custom Image properties in SDK queries, see [Optimizely component contracts](../cms/optimizely-saas/sdk-component-contracts.md).
