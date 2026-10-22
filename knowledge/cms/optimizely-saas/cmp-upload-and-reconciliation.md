---
title: "Separate CMP upload transfer from asset creation"
domain: "cms/optimizely-saas"
aliases: []
evidence_date: "2026-10-22"
reviewed_at: "2026-10-22"
status: "current"
versions: []
applicability: "Optimizely CMP v3 image migration planning; official API documentation only; no connected execution"
provenance: "optimizely-cms-saas-docs@4e7dd5eeae36577bcb4d08f1f2617b4dfeab71f0541e212710ea48b8a233ba92; directly read official CMP pages 2026-10-22; CMP is not registered as a source; proposed recovery procedure"
---

# Separate CMP upload transfer from asset creation

## When to use this

Use this when importing files into CMP DAM or moving existing assets. Transfer completion and creation of a library asset are different steps.

## What to do

1. **Documented:** the [upload guide](https://docs.optimizely.com/content-marketing-platform/docs/upload-assets-to-library-or-task) specifies `GET /v3/upload-url` (valid for 60 minutes), a multipart POST preserving returned meta-field order with `file` last (204 success), then `POST /v3/assets` using the key and title. Reusing the key in another creation request creates another asset.
2. **Proposed:** retain the upload key and attempt state. After an uncertain creation response, reconcile the destination before retrying; do not assume a lost acknowledgement means no asset. Failure during transfer does not by itself establish successful library creation. Use a fresh ticket when the old one expired.
3. **Documented:** [multipart upload](https://docs.optimizely.com/content-marketing-platform/docs/multipart-upload) supports parallel parts and resume: initiate, upload parts, call `/complete`, and poll `/status` to a final result before registering the key. Its documented part range is 5 MiB to 5 GiB, with a smaller last part permitted and at most 10,000 parts. **Proposed:** retain the simpler flow for ordinary images and evaluate multipart for large files; this feature has not been exercised here. Check its current availability rather than assuming experimental status from an older reference.
4. **Documented:** [folder creation](https://docs.optimizely.com/content-marketing-platform/api/post-folders) takes a name and supports nesting with `parent_folder_id`. The [image PATCH reference](https://docs.optimizely.com/content-marketing-platform/api/patch-imagesid) lists title, description, alt text, attribution, tags, visibility/archive/indexing flags, folder and expiry fields. **Proposed:** retain resolved folder IDs and use a folder-only metadata update for a move rather than transferring the binary again. Confirm update and tag-replacement semantics before sending changes.
5. **Proposed:** check editor access to the chosen folders, selected CMS reference types, rendition availability and exact approved download/upload hosts during the pilot. Approve only the necessary hosts and narrowly scoped patterns; numbered CDN hosts in one historical import do not authorize a broad wildcard for every project.

## Evidence and limits

Official documentation was reviewed, not executed. Direct retrieval of the image PATCH page timed out/returned 403; the browser search service returned its official indexed body, including the parameter list. That is documentation evidence, not a connected API check. The current [folder guide](https://docs.optimizely.com/content-marketing-platform/docs/manage-folders) documents organization and moves but did not establish a universal private-by-default rule. Do not assume name uniqueness, folder-depth limits or access from those pages.

No CMP rate ceiling, field-deprecation rule, create-time metadata beyond key/title, or official bulk CLI absence is established here. Discover current constraints before implementation. Multipart completion is not asset creation. Registration of a CMP catalog is a separate reviewed source change, not part of this delivery. For CMS delivery/alt text and Content Area restrictions, see [media destination and placement](media-destination-and-placement.md).
