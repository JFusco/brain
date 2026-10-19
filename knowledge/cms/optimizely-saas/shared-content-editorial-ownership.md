---
title: "Share repeated CMS content by editorial ownership"
domain: "cms/optimizely-saas"
aliases: ["shared blocks", "inline blocks", "content reuse", "editorial ownership"]
evidence_date: "2026-10-19"
reviewed_at: "2026-10-19"
status: "current"
versions: []
applicability: "Optimizely CMS SaaS block reuse and migration planning; hosted version unknown; no SDK compatibility range established"
provenance: "optimizely-cms-saas-docs@a3b1d31d6bce9822bcaca13e4cee0e6d5a2f147dc555aff57464dfac702036d0; official blocks page checked 2026-10-19; sanitized authored migration observation"
---

# Share repeated CMS content by editorial ownership

## When to use this

Use this when repeated content in an Optimizely CMS SaaS migration could either share future edits or remain independently editable. Confirm the editors' intended ownership and language scope before grouping occurrences. These are content-model decisions, not instructions to convert an existing CMS automatically.

## What to do

1. **Documented:** choose between two publishing models. Shared blocks are separate items with their own publishing lifecycle; edits affect their usages. Inline blocks belong to their containing item and publish with it. See [Optimizely's shared and inline blocks](https://docs.optimizely.com/cms-saas/docs/blocks).
2. **Documented:** choose the shared block's folder for the required availability. Blocks under **For This Application** or **For All Applications** can be used on other pages; **For This Page** limits availability to the current page. Sharing and folder availability are separate decisions.
3. **Proposed practice:** plan shared records for complete, identical blocks only within a confirmed language and editorial ownership scope. Preserve explicit exceptions for independently managed occurrences. Identical appearance or content alone does not establish that future edits should propagate.
4. **Proposed practice:** compare complete authored values, including links, media identities and nested content. Preserve meaningful missing-versus-null differences. Do not automatically promote empty layout wrappers or individual primitive fields. Decide separately whether a repeated presentation wrapper and its already-referenced underlying record should be shared.
5. **Proposed practice:** derive matches from the captured inventory, persist ownership decisions and stable destination identities, then reconsider changed content and affected groups on later runs. Fingerprints help compare content; they should not replace the destination CMS identity on each edit. Avoid rescanning unchanged inputs solely to rediscover the same grouping.

## Evidence and limits

**Documented:** the official blocks page was read on October 19, 2026. It establishes shared/inline publishing behavior, effects of shared edits and folder availability. The rolling index revision above identifies the catalog observation, not an immutable revision of that page. It does not prescribe automatic deduplication or migration algorithms.

**Reported observation:** a sanitized authored capture from a private migration frontend described repeated complete newsletter, contact-section and disclaimer blocks, with contact information already referenced separately. The capture reported `@optimizely/cms-sdk@3.0.0` in that one frontend; the curator did not inspect its workspace or rerun that observation. Hosted CMS version is unknown. This is not evidence of compatibility with other versions.

**Proposed practices:** complete-value grouping, incremental matching and stable destination mapping require implementation and project-specific validation. No inline-to-shared conversion, connected CMS write or rendering acceptance is established here. Preserve independent ownership even where values match. For product/source selection, see [Choose CMS guidance by product and integration](../../_unsorted/cms-guidance.md); that note addresses source choice rather than this reuse decision.
