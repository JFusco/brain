---
title: "Share repeated CMS content by editorial ownership"
domain: "cms/optimizely-saas"
aliases: ["shared blocks", "inline blocks", "content reuse", "editorial ownership"]
evidence_date: "2026-10-19"
reviewed_at: "2026-11-21"
status: "current"
versions: []
applicability: "Optimizely CMS SaaS block reuse and migration planning; hosted version unknown; no SDK compatibility range established"
provenance: "optimizely-cms-saas-docs@6a05595c6fc6ffb7d0543ca469f350ba3435ad6a19fab194a5b2584c40cd20e3; official blocks page re-read 2026-11-21; sanitized authored migration observation"
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

**Revalidated October 22, 2026:** the current official blocks and folders pages were read. Shared and inline publishing lifecycles, shared edit propagation and folder availability still support the documented decisions above. The refreshed index changed unrelated API locators; that alone was not the revalidation evidence. No migration behavior or CMS write was rerun.

**Revalidated October 23, 2026:** The current blocks/folders pages still distinguish shared versus inline publishing, propagation of shared edits and global/application/local availability. Grouping and destination-identity proposals remain unexercised here.

**Revalidated November 21, 2026:** The current official blocks page confirms the separate shared lifecycle, page-bound inline publishing, shared-edit propagation and folder availability. It also says unpublished shared blocks are not visible to visitors. **Proposed:** verify the shared item's publication state alongside its containing page before accepting migrated content. Create/view rights and supported block types are separate constraints; selecting a shared destination does not establish editor access. No conversion, permissions test or connected rendering ran. The complete-value grouping and stable-mapping recommendations remain proposed practices.
