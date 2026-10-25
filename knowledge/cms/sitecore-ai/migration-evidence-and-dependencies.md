---
title: "Plan SitecoreAI migration evidence and dependencies"
format: "playbook"
domain: "cms/sitecore-ai"
aliases: ["serialization transport", "deferred media", "mapping evidence", "migration acceptance"]
evidence_date: "2026-10-24"
reviewed_at: "2026-10-24"
status: "current"
versions: []
applicability: "Proposed planning for authored content in existing SitecoreAI models; target server, CLI, plugin and rendering SDK versions must be confirmed"
provenance: "sitecoreai-docs@70bb71bac4acc8a15e85e2f8ec2e11ed186d309fd527df48fdf956c43ce473f6; relevant official pages read 2026-10-24, including unregistered api-docs.sitecore.com Content Transfer and Item Transfer pages; sanitized private capture recommendations, no connected acceptance"
---

# Plan SitecoreAI migration evidence and dependencies

## When to use this

Use this when mapping authored content into an existing SitecoreAI model, deciding whether serialized definitions are needed, or preparing image references before destination media exists. It also applies when an AI draft reports missing layout or metadata contracts despite a retained destination snapshot. These are proposed migration practices supported by the documented mechanisms below, not a validated migration implementation.

## What to do

### Choose evidence and transport separately

**Documented:** [Sitecore Content Serialization](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecore-content-serialization/sitecore-content-serialization.html) represents items as YAML and supports pull/push synchronization. Its primary role includes versioning structural items with application code. The [Authoring API examples](https://doc.sitecore.com/sai/en/developers/sitecoreai/content-modeling-and-presentation/sitecore-authoring-and-management-graphql-api/query-examples-for-authoring-operations.html) separately show item retrieval and creation with a template, parent, language and field values.

**Proposed:** choose serialization when version-controlled structural synchronization is required. For authored content targeting existing templates, consider bounded live discovery of the destination contracts and native Authoring API operations. YAML can be one evidence input without becoming a universal prerequisite for mapping. Keep mappings independent when comparing serialized and live evidence. Neither choice eliminates source extraction, field mapping, media, layout or authorization work; this does not establish that one transport is faster or always suitable.

### Plan media dependencies without guessing identities

**Documented:** the same Authoring API page describes `uploadMedia` returning a pre-signed URL, followed by a binary POST. Successful upload returns a native media item ID, name and full path. Obtaining the URL alone does not complete that sequence.

**Proposed:** distinguish a missing field contract from a valid Image field whose destination media does not yet exist. For a new asset, capture bytes under an allowed-host policy, retain their hash, stage a media operation and express dependent field values through the migration application's supported deferred-reference mechanism. Resolve the actual destination identity after verifying the asset outcome. An offline plan need not invent an already-created media ID. Reuse instead requires an evidenced association to existing destination media; do not infer a media GUID from a source URL revision, presentation variant or sample image.

Deferred-reference syntax is application-specific, not a Sitecore wire format. Preserve native Image serialization, approvals, attempt reconciliation and readback guards. A field-only harness that accepts strings/null but stages no media operations cannot establish dependency acceptance. Different URLs can serve identical bytes; evaluate deduplication against captured byte hashes.

### Choose the media upload route by its contract

**Documented:** the [Content Transfer API](https://api-docs.sitecore.com/sai/content-transfer-api/section/migrating-content/wait-for-the-transfer-to-be-ready) moves content between SitecoreAI environments in chunks. Chunks can be retrieved in parallel and saved in parallel with retrieval, but every chunk must be saved before the chunk set completes. The [Item Transfer API](https://api-docs.sitecore.com/sai/item-transfer-api/section/migrating-content/monitor-the-transfer) consumes the generated `.raif` files, each representing one item or an item with its descendants.

**Proposed:** treat the per-file `uploadMedia` sequence, editor uploads and environment transfer as separate contracts. Use environment transfer for supported environment-to-environment moves, not as a route for loose source files; do not invent `.raif` generation for them. Do not infer that the authoring upload accepts archives or several binaries per request from what an editor UI offers. The authoring pages reviewed for this note state no concurrent-upload limit, which is an absence of guidance, not permission. Before parallelizing uploads, seek endpoint-specific vendor guidance; start from one operation at a time, serialize shared folder creation, record pending attempts before dispatch and read every result back. Compare complete verified applies, not raw upload time. Parallel chunk transfer does not establish parallel Authoring API behavior.

### Diagnose the evidence boundary before changing CMS configuration

**Proposed:** compare the complete retained destination snapshot with the projection actually supplied to the mapping model. Preserve the site/start-item, device, layout-field and native-reference contracts required by the selected mapping, while excluding authored sample business content. Read still-needed literal references only within explicit bounds. A referenced GUID without its retrieved item is an evidence gap, not proof the item is absent; a snapshot can also be stale.

Reconcile each reported issue against evidence and authorized scope using the application's existing notes/exceptions contract. Distinguish repeated gaps, preserved source conflicts and untested frontend behavior from missing required coverage. Do not mass-exclude blockers, route ambiguous prose by keywords or relax compiler guards to obtain a pass. Observations belong in notes only when that disposition is justified; unresolved required coverage remains blocking.

### Report acceptance separately

**Documented:** Sitecore's [Preview/Delivery comparison](https://doc.sitecore.com/sai/en/developers/sitecoreai/experience-edge/experience-edge-apis/differences-between-the-preview-and-the-delivery-graphql-apis.html) describes differences in field availability, published context and link resolution. Authoring operations and these query surfaces answer different questions.

**Proposed:** report source fidelity, native field syntax, full compiler/dependency acceptance, content-management write/readback and rendered preview/interaction as separate results. Local field validity does not prove components, editor tabs or interactions render correctly. A fixture that simulates media creation/readback/resume is local evidence only, not connected upload acceptance.

## Evidence and limits

The cited official passages were read on the evidence date. Target server, CLI/plugin and rendering SDK versions remain unknown; no compatibility range is asserted. The proposed transport, projection and dependency procedures were not exercised against a connected CMS during curation. Private experiment outcomes and incidental application runtime versions are deliberately not adopted as public success claims. No throughput, exactly-once recovery or complete migration guarantee follows. The upload-route guidance asserts no editor archive (ZIP) upload behavior; the current [media upload page](https://doc.sitecore.com/sai/en/users/sitecoreai/manage-media/modern-media-library/upload-a-media-file.html) describes selecting several files in one upload dialog, but no archive upload or extraction. The Content Transfer and Item Transfer pages are on `api-docs.sitecore.com`, which is not a registered Brain source, so a change there will not flag this note automatically.

The [Contentstack import-state guidance](../contentstack/asset-import-state.md) also separates retained mappings from safe recovery, and [Optimizely media destination guidance](../optimizely-saas/media-destination-and-placement.md) separates destination identities from renderer behavior. Their vendor-specific payloads and tools do not apply to SitecoreAI. This playbook keeps the distinct Sitecore evidence and transport decisions together.
