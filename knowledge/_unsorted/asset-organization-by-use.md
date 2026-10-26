---
title: "Plan migrated asset folders by editorial use"
domain: "_unsorted"
aliases: []
evidence_date: "2026-10-22"
reviewed_at: "2026-10-26"
status: "current"
versions: []
applicability: "Proposed CMS media and DAM organization policy; adapt to Optimizely CMS SaaS, CMP and Contentstack capabilities; no implementation acceptance"
provenance: "optimizely-cms-saas-docs@ae548b9dfcc952b0ce044cc0331517c2155d9a8da61cacb1b11285231415ac9e; contentstack-docs@4d7e54b65fe30d5c61704a2a22f9b19b91d49c345276593c93c1866ac9d12eb0; official organization pages read 2026-10-22; authored policy proposal"
---

# Plan migrated asset folders by editorial use

## When to use this

Use this when a migration would otherwise copy legacy paths or leave a flat asset dump. Agree on editorial ownership and access before choosing names or containers.

## What to do

1. **Proposed policy:** for a destination whose governance permits it, use a migration project root, one `_Shared` folder for global chrome or binaries used across sections, and section/subsection folders selected by ordered, reviewed page-URL rules. Start with at most two levels below the root. This is an adaptable policy, not a universal product requirement.
2. **Proposed:** derive placement from where files are used, keeping one canonical binary identity. Stop unmatched page rules for review; report a leaf approaching 1,000 assets for a human decision, without automatically splitting it. Use tags/fields for cross-cutting facets. Confirm actual folder and metadata capabilities first.
3. **Proposed:** use readable source-derived names or editor-reviewed text, with deterministic short-hash suffixes for every member of a collision group. Keep full hashes in import identity rather than opaque editor titles. Avoid unreviewed dates, status words or personal names in stable folder paths. Do not blindly mirror legacy media URLs, duplicate locale-invariant binaries by language, or reorganize live folders without assessing references.
4. **Proposed:** compute assignments over the captured corpus before expansion and compare them with the pilot. Newly captured usage can move a file from a section to shared scope; review this change explicitly rather than silently moving production assets.
5. **Documented boundaries:** [Optimizely organization guidance](https://docs.optimizely.com/cms-saas/docs/best-practices-for-organizing-assets) prioritizes existing organizational standards, simple folders, readable names and global versus local reuse. Its [folder guide](https://docs.optimizely.com/cms-saas/docs/folders) says media/shared blocks share a tree, folders lack language versions, local folders inherit content rights, and external links/indexing may break on moves. **Proposed:** confirm CMS subfolder creation and chosen availability in the target API before planning writes; an observed root folder does not prove subfolder creation support.
6. **Documented boundaries:** Contentstack's [folder limits](https://www.contentstack.com/docs/content-managers/author-content/limitations-on-asset-folders) list 10,000 folders per stack and five nesting levels. [Adobe AEM guidance](https://experienceleague.adobe.com/en/perspectives/folder-structure-best-practices-for-aem-assets) instead favors governance-led, metadata-assisted organization and warns against ad-hoc project folders. Do not apply this illustrative project-root policy to AEM unchanged. CMS media folders and CMP folders are separate systems; verify CMP editor visibility rather than assuming CMS rights carry over.

## Evidence and limits

This policy has not run in a CMS. Its shared-folder rule, depth cap, URL routing, collision suffixes and review threshold are proposals, not vendor limits or measured optima. The AEM article's 500–1,000-assets guidance is product-specific context, not a cross-CMS ceiling. Existing governance may choose a different stable taxonomy. CMP depth and uniqueness rules, CMS SaaS subfolder writes, Contentstack folder-name characters and target access mappings require project validation. See [Contentstack ownership](../cms/contentstack/asset-ownership-and-reuse.md), [Contentstack import state](../cms/contentstack/asset-import-state.md) and [Optimizely media](../cms/optimizely-saas/media-destination-and-placement.md).

**Revalidated October 23, 2026:** Current Optimizely organization and folder pages still prioritize existing standards, reuse/access scope, descriptive names and a shared media/block tree without language variants. The index title changes do not establish behavior. The illustrative folder routing/depth/threshold policy remains proposed and product-dependent.

**Revalidated October 26, 2026:** The Contentstack folder page still states 10,000 folders and five nesting levels; Optimizely organization and folder guidance still distinguish governance, reuse and the shared block/media tree. The project-root policy and review thresholds remain proposals. The separate AEM context and unverified target-write/access limits are unchanged; no CMS operation ran.
