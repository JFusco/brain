---
title: "Check screenshot resolution before a vision judgment"
format: "playbook"
domain: "tooling"
aliases: ["full-page screenshot limits", "vision image detail", "screenshot tiles"]
evidence_date: "2026-10-29"
reviewed_at: "2026-10-29"
applicability: "Direct image inputs to documented OpenAI model/detail combinations and Claude API models; agent CLI preprocessing and unlisted models require separate verification"
provenance: "openai-agent-docs@cee2f0d46de2ef567418e2145606d882f1f321e0396afedf8471b7e7200e319d; anthropic-agent-docs@6b03d984c6d9b39eea32a4854af96b6d26babd30d8940af6fd16901d2b8eafa1; official vision pages read 2026-10-29; Claude request and image limits rechecked 2026-11-01; proposed capture preparation, no model comparison"
status: "current"
versions: []
---

# Check screenshot resolution before a vision judgment

## When to use this

Use before sending tall full-page screenshots for text, layout or component-boundary judgments. The same PNG can reach different models at different effective resolutions, so its original dimensions alone do not establish comparable visual evidence.

## What to do

1. **Proposed:** record pixel dimensions, model, provider surface, detail/transform settings and any known preprocessing. Compare the image with that exact contract before requesting a judgment. Keep an unknown CLI detail setting unknown rather than inferring it from API defaults.
2. **Documented:** the [OpenAI image guide](https://developers.openai.com/api/docs/guides/images-vision) computes patch counts using `ceil(width/32) * ceil(height/32)` after the selected sizing rules. Astra's `high` allows 2,500 patches and a 65,535-pixel dimension limit; the listed GPT-5.6 variants instead use 2,048 by 2,048 plus 2,500 patches. For these listed families, `auto` follows `original`: native dimensions are retained within the 65,535-pixel limit, but a result over 30,000 patches is rejected rather than resized to that patch cap. Do not transfer these rules to unlisted GPT-6.1 models.
3. **Documented:** [Claude vision](https://platform.claude.com/docs/en/build-with-claude/vision) assigns Claude 4.7 and later, including Opus 5.5, a high-resolution tier with a 2,576-pixel long edge and 4,784 visual tokens. Ordinary larger images are downscaled to fit both limits; computer/browser tool-result screenshots exceeding model limits are rejected instead. General request limits also apply, including an 8,000-pixel dimension maximum and stricter many-image constraints.
4. **Proposed:** when a full-page image loses needed detail, provide a page overview plus overlapping, identified viewport tiles. Bound each tile by both the model's dimension and token limits, and preserve coordinates/overlap so findings can be mapped back to the page. A 2,576-pixel edge alone does not guarantee a Claude tile fits its visual-token budget.
5. **Proposed:** compare engines on an explicitly recorded input policy; inspect text and boundaries at the effective resolution. Report visual evidence using [the acceptance-claim guidance](../frontend/match-evidence-to-claim.md). Do not claim improved judgment accuracy merely because a request is accepted or a tile has more pixels.

## Evidence and limits

These are dated API documentation facts supporting an unexercised preparation workflow. The current Astra `high` dimension rule differs from older blanket 2,048-pixel advice. Claude's published downscaling/rejection distinction replaces uncertainty about ordinary image processing, but does not establish a CLI's behavior.

No screenshots, model calls, tiling benchmark or accuracy comparison ran here. Historical private capture dimensions and illustrative scaling calculations are not application acceptance. Check current limits, formats, byte budgets and the selected provider before use.


## Budget image requests separately from resolution

**Documented, November 1, 2026:** the [Claude API error reference](https://platform.claude.com/docs/en/api/errors) gives first-party Messages requests a 128 MB maximum. The [vision guide](https://platform.claude.com/docs/en/build-with-claude/vision) limits base64 images to 10 MB each on the Claude API and Google-managed Claude Models on Google Cloud, and 5 MB on Amazon Bedrock. It permits 600 images per API request, or 100 on 200k-context models, with an 8000-by-8000 pixel maximum. Above 20 images, its cross-platform recommendation is no dimension above 3,000 pixels, or at most 20 blocks; resent and nested tool-result images count. Other platforms' total request limits need separate confirmation. The guide's later availability summary still groups Google-managed images under 5 MB; that internal conflict prevents treating 10 MB as unqualified cross-platform permission.

**Proposed:** measure serialized request bytes including base64, prompt, schema and history. Reserve explicit overhead below the verified endpoint cap; an image allowance such as 118 MB with a 120 MB local refusal is a caller policy, not a vendor guarantee. Avoid both obsolete blanket caps and inferred CLI/provider limits. Keep token/context budgeting separate; cumulative multi-turn usage is not one request's occupancy. See [capacity diagnosis](review-capacity-recovery.md).

No near-limit CLI request, partner-platform limit or image-heavy pilot was reproduced. Historical reports of an accepted larger batch and cumulative usage totals are deliberately not generalized as measured capacity or compatibility.
