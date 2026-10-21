---
title: "Organize Contentstack assets by ownership and reuse"
domain: "cms/contentstack"
aliases: ["asset folders", "asset metadata", "editorial asset library"]
evidence_date: "2026-10-21"
reviewed_at: "2026-10-21"
status: "current"
versions: []
applicability: "Editorial asset-library planning; distinguish stack assets from the separately enabled Assets service"
provenance: "contentstack-docs@27fb06e5aabe557865140dfcf163b8576b091a0711ecf2d98737750645f1543d; relevant rolling official pages read 2026-10-21; sanitized capture proposals, no bulk runtime validation"
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
