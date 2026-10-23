---
title: "Separate CMP upload transfer from asset creation"
domain: "cms/optimizely-saas"
aliases: []
evidence_date: "2026-10-22"
reviewed_at: "2026-10-23"
status: "current"
versions: []
applicability: "Optimizely CMP v3 image migration planning; official API documentation only; no connected execution"
provenance: "optimizely-cms-saas-docs@ae548b9dfcc952b0ce044cc0331517c2155d9a8da61cacb1b11285231415ac9e; directly read official CMP pages 2026-10-22; CMP is not registered as a source; proposed recovery procedure"
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

Official documentation was reviewed, not executed. Direct retrieval of the image PATCH page timed out/returned 403; the browser search service returned its official indexed body, including the parameter list. That is documentation evidence, not a connected API check. The folder-management page alone did not establish sharing defaults. The separately checked [sharing guide](https://docs.optimizely.com/content-marketing-platform/docs/share-folders-and-assets) documents private-by-default created folders and inherited folder permissions for assets. Check the actual intended role; do not infer access from the uploader's session, or name uniqueness and depth limits from these pages.

No CMP rate ceiling, field-deprecation rule, create-time metadata beyond key/title, or official bulk CLI absence is established here. Discover current constraints before implementation. Multipart completion is not asset creation. Registration of a CMP catalog is a separate reviewed source change, not part of this delivery. For CMS delivery/alt text and Content Area restrictions, see [media destination and placement](media-destination-and-placement.md).

**Revalidated October 23, 2026:** Official CMP upload, multipart, folder creation, asset listing and sharing passages were read. Transfer and final creation remain separate, repeating final creation can duplicate records, and multipart completion/status is a distinct phase. Image PATCH parameters were checked through the official indexed body after direct retrieval failed; no connected call was made.

## Verify originals, placement and visibility independently

**Documented:** the [asset listing API](https://docs.optimizely.com/content-marketing-platform/api/get-assets) supports folder scope, explicit subfolder inclusion and pagination. The upload guide separates the multipart file from the arbitrary title supplied during final creation. **Proposed:** preserve the intended multipart filename and collect independent native metadata after creation; do not reuse the create acknowledgement as its own readback. Check the native asset/folder identities, download the original bytes for hash comparison where required, and inspect the editor's Original File Name and intended folder separately. Expected input hashes, titles, file size or a successful create response do not substitute for independent observations.

**Proposed recovery:** record the pending final-create attempt before dispatch. Serialize conflicting writers by CMP organization. Reconcile within the known owned organization/folder, paginate observations and require a single identity-supported candidate with required native metadata and original-byte evidence. Missing or ambiguous candidates stay blocked; do not blindly resend a final create. Retain original operation identities and request history when a reviewed continuation corrects a host pin. Distinguish graceful interruption from an observer-process exit; neither proves an operation failed to create.

**Proposed network planning:** review API calls, pre-signed transfer endpoints and original-download hosts as separate phases. The sharing guide recommends broad vendor domain families for upload connectivity, but does not give an exhaustive original-image host contract for a strict application allowlist. A single probe cannot establish every original CDN host. Budget metadata reads, listings, original downloads, credentials/probes and recovery passes as well as creates. On a newly observed host or exhausted budget, retain evidence for a reviewed continuation; do not disable the host guard or repeatedly retry. Repeated reads are investigation candidates, not proven redundant work.

**Unverified historical reports:** three private captures describe small-image placement/original-filename checks, independent byte downloads, controlled wrong/missing/changed evidence refusals, final-create acknowledgement loss, later observer exits, a reviewed CDN correction and no-write resumes. Organization-level writer exclusion was reported in controlled tests. None was rerun by this curator. Exact asset/folder counts, numbered CDN hosts, request totals/caps and elapsed timings remain private incident measurements, not throughput benchmarks, permanent host contracts or general recovery proof. Editor visibility was reported only for the signed-in role. Large files, every role and the separate CMS media path remain unexercised. Proposed deduplication of observation requests must preserve independent native verification and drift detection.
