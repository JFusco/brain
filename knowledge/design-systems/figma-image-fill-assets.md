---
title: "Retrieve Figma image fills for implementation"
format: "playbook"
domain: "design-systems"
aliases: ["Figma imageRef", "image fills", "design media assets"]
evidence_date: "2026-11-04"
reviewed_at: "2026-11-04"
applicability: "Figma REST file content with image paints; authorized read access and asset-use rights required; download and caching procedure is proposed"
provenance: "figma-developer-docs@004b40c2362aa43e3417f9e558b1862c176a72ce3aae3f68362c61e83912b912; official file endpoints and Paint reference read 2026-11-04; sanitized capture guidance, no asset download reproduced"
status: "current"
versions: []
---

# Retrieve Figma image fills for implementation

## When to use this

Use when a design handoff needs the actual photographs or bitmap artwork used in selected Figma nodes. Pair this with [component context](../frontend/design-component-context.md); identifying a component does not supply its media.

## What to do

**Documented:** Figma's [file endpoints](https://developers.figma.com/docs/rest-api/file-endpoints/) distinguish node rendering at `GET /v1/images/:key` from image-fill retrieval at `GET /v1/files/:key/images`. The latter maps image references to download URLs that expire within at most 14 days and requires `file_content:read`. The [Paint reference](https://developers.figma.com/docs/rest-api/file-property-types/#paint-type) describes `imageRef`, scale mode, transforms, rotation and filters. A downloaded bitmap alone does not reproduce its placement.

**Proposed procedure:**

1. Read selected nodes and their needed subtrees with `GET /v1/files/:key/nodes`. Collect visible `IMAGE` paints, deduplicate their `imageRef` values, and retain node-to-image mappings and placement properties. Check hidden ancestors as well as paint visibility.
2. Resolve the selected references through the file image-fill map. Retain authorized bytes promptly rather than embedding temporary URLs in fixtures. Use node renders as visual evidence; do not substitute a whole-frame screenshot for a required source bitmap. Exporting vector artwork is a separate decision.
3. Keep API authentication on API requests. For returned asset URLs, use a separate unauthenticated HTTPS download path, validate the destination against an explicitly approved storage-host policy, and refuse redirects unless separately reviewed. Do not assume every S3 bucket is trusted or that storage URLs use the API host. Preserve signed URLs privately and never log their query credentials.
4. Bound image count, per-image bytes and total bytes before downloading. A capture suggested 30 MiB per image and 50 images per run; these are illustrative project budgets, not Figma limits or universal safe defaults. Record exceeded limits instead of silently substituting placeholders.
5. Store retained assets by content hash with the file/version, image reference and placement mapping. Reuse verified retained bytes for the same input version; invalidate stale mappings when inputs change. Feed these assets to fixtures/stories and verify the intended crop and transform.

## Evidence and limits

No file, entitlement, storage-host contract or download was exercised here. The private report's image counts, sizes and successful pass are omitted as incident measurements. The endpoints establish a documented retrieval route, not an exclusive way to obtain every asset. Video/GIF handling, vector export and production optimization require separate checks. Rights and source identity remain distinct from successful retrieval.
