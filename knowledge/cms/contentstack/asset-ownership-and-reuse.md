---
title: "Organize Contentstack assets by ownership and reuse"
domain: "cms/contentstack"
aliases: ["asset folders", "asset metadata", "editorial asset library"]
evidence_date: "2026-10-21"
reviewed_at: "2026-10-26"
status: "current"
versions: []
applicability: "Editorial asset-library planning; distinguish stack assets from the separately enabled Assets service"
provenance: "contentstack-docs@4d7e54b65fe30d5c61704a2a22f9b19b91d49c345276593c93c1866ac9d12eb0; relevant rolling official pages read 2026-10-21; sanitized capture proposals, no bulk runtime validation"
---

# Organize Contentstack assets by ownership and reuse

## When to use this

Use this before a large import or when editors cannot reliably find, maintain or reuse existing assets. Confirm which asset service and capabilities the account actually has.

## What to do

1. **Proposed:** use shallow, stable folders for ownership and stewardship, with descriptive filenames/titles and a controlled vocabulary for discovery. Agree with editors on useful owner, department, topic, campaign, language, copyright, credit, expiration and review fields; implement only fields the enabled service supports. A hierarchy such as shared brand, departments and campaigns is illustrative, not a vendor mandate.
2. **Documented:** [stack assets](https://www.contentstack.com/docs/headless-cms/about-assets) can be reused across entries and have branch-specific behavior. **Proposed:** keep one authoritative home for the same reusable file, retaining source identity and destination UID during import rather than duplicating it for every placement.
3. **Documented:** the [JSON RTE asset guide](https://www.contentstack.com/docs/headless-cms/assets) recommends descriptive metadata, organized folders and compressed images, and warns that library deletion invalidates linked JSON instances. **Proposed:** define replacement/review ownership and inspect references before deletion.
4. **Proposed:** keep context-dependent alt text, captions and decorative status with the placement when meaning changes. Keep source and rights information at asset level. Preserve a master and evaluate supported delivery transformations; use separate editorial crops where composition changes. These are modeling proposals requiring target CMS/frontend validation.
5. **Proposed:** adopt native folders, tags, fields, references and importer mappings incrementally; require a demonstrated gap before custom organization tooling. Establish replacement/versioning and retirement responsibilities with editors.
6. **Proposed:** ask editors whether they can find the asset, determine permitted use and reuse it confidently. This review does not establish accessibility compliance or legal rights.

## Evidence and limits

[Getting Started with Assets](https://www.contentstack.com/docs/assets/getting-started-with-assets) describes spaces, metadata and links to multiple CMS stacks for the newer Assets service. Do not infer those entitlements or cross-stack behaviors from ordinary stack assets; verify availability and field support. Its illustrative taxonomy is not a universal requirement.

Official pages were read on October 21. No account entitlement, production taxonomy, editor acceptance or asset delivery was exercised. Private pilot observations were not independently rerun. The proposed folder depth, vocabulary and placement/master strategy extend documented mechanisms; they are not vendor requirements. For transfer state and UID mapping, see [native import guidance](asset-import-state.md).


**Proposal boundary:** the vocabulary is a set of candidates for editor review, not a required schema or a claim that every field type is available. The master-file/crop and placement-text decisions are proposed modeling choices. Historical pilot details and unrelated frontend package versions supply no entitlement, taxonomy or delivery proof and are not adopted as reusable requirements.

## Plan capacity before expansion

**Documented:** [stack asset limits](https://www.contentstack.com/docs/headless-cms/asset-limitations) currently list 10,000 assets per stack, 100 MB per API upload and 700 MB through the UI; restricted filename characters are replaced with underscores. The same page distinguishes newer Assets service allowances of 500,000 per workspace and 1.5 GB per asset. These are documented defaults, not account entitlement proof. **Proposed:** count distinct intended binaries after identity review before expansion; request a limit review or narrow scope rather than assuming every image URL is a unique file. Keep stack assets and the newer service separate. For a concrete, adaptable folder proposal and product-specific limits, see [organization by editorial use](../../_unsorted/asset-organization-by-use.md). These pages were checked October 22; no account limits or folder behavior were exercised.

## Verify native placement separately from labels

**Documented:** the [CMA asset reference](https://www.contentstack.com/docs/developers/apis/content-management-api/assets) supports nested folder `parent_uid`, multipart `asset[parent_uid]`, returned asset identity/filename/size/parent fields and folder retrieval with an optional UID/name path. **Proposed:** retain the intended parent UIDs, then independently retrieve each resulting parent-child relationship and asset metadata in the intended branch. Compare filename and size with the input record; size alone does not prove byte equality. A familiar folder label or screenshot cannot prove native parentage. Use editor inspection as complementary visibility evidence for the specific signed-in role.

**Unverified historical report:** a private small-image pilot reported matching native folder/asset readback and editor placement. It was not reproduced here and does not establish production scale, throughput or all roles. The reusable procedure above is proposed practice. Incidental tooling versions and image counts are not compatibility evidence.

**Revalidated October 26, 2026:** Stack asset reuse, JSON RTE library behavior, the separate Assets service, stack/service capacity limits and CMA parent/branch metadata were checked against the current official pages. The documented limits remain defaults rather than account entitlement proof; ownership, placement text and native-readback procedures remain proposed. No native write, pilot reproduction or editor acceptance ran.
