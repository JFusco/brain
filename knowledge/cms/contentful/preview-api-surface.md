---
title: "Choose Contentful delivery or Preview before copying examples"
domain: "cms/contentful"
aliases: ["Contentful Preview API", "draft content", "preview token", "Contentful Sync"]
evidence_date: "2026-10-21"
reviewed_at: "2026-10-24"
status: "current"
versions: []
applicability: "Contentful Content Delivery and Content Preview APIs; does not establish support in a particular JavaScript SDK version"
provenance: "contentful-skills@68d8cb6d92d9b7b2a97478cb2e97e7ab4aac33c6; official Content Preview API reference checked 2026-10-24; moved from knowledge/_unsorted/cms-guidance.md"
---

# Choose Contentful delivery or Preview before copying examples

## When to use this

Use this before copying a Contentful data-loading example into a feature that shows published content, draft content, or both, for example a preview mode for editors.

## What to do

1. Decide which API surface the feature reads. Use the Content Delivery API for published content, and the Content Preview API for draft and changed content.
2. For Preview, use the appropriate regional preview host and a Preview access token. A production delivery token does not work with Preview, so keep the two tokens and hosts separate in configuration.
3. Don't carry a Sync-only data-loading design into Preview. The [official Preview API reference](https://www.contentful.com/developers/docs/references/content-preview-api/overview/) explicitly excludes Sync, so a preview path built on Sync needs a query-based design instead.
4. At the pinned revision cited here, treat the Contentful skill's [preview overview](https://github.com/contentful/skills/blob/68d8cb6d92d9b7b2a97478cb2e97e7ab4aac33c6/skills/contentful-api/references/content-preview/overview.md), which shows a Sync request against the preview host, as conflicting reference material. Prefer the API reference for this decision.

Choosing the surface first avoids building a loader that works against delivery and then fails, or silently diverges, in preview.

## Evidence and limits

**Documented:** the official Preview API reference excludes Sync. The [Contentful API guide](https://github.com/contentful/skills/blob/68d8cb6d92d9b7b2a97478cb2e97e7ab4aac33c6/skills/contentful-api/SKILL.md) separates management, delivery and preview.

**Revalidated in the October 21 scheduled source check:** the refreshed pinned API entry point still separates management, delivery and preview. Both that entry point and its Preview example were retrieved at the October 21 pin and verified against their catalog Git blobs. Their separation of delivery and Preview was read, then the Sync claim was compared with the live API reference; blob identity alone does not establish correctness. Its linked Preview overview still includes a Sync request against the preview host and overstates parity with all delivery features. The live official API reference continues to exclude Sync, so the warning remains necessary at this newer revision. The US/EU preview hosts and separate Preview token were also checked against that API reference. Use query endpoints for Preview instead of adopting the conflicting Sync example. This is a claim comparison, not a conclusion inferred from changed file hashes.

The October 18 comparison remains historical evidence in Git history. This revalidation does not make the copied skill's other examples authoritative or establish their correctness.

These are API-surface checks, not proof that a particular JavaScript SDK version supports the application. Confirm the consuming application's installed SDK and the API it selects. This note doesn't cover GraphQL preview, Live Preview tooling, or token storage.

**Contentful revalidation October 24, 2026:** The exact pinned API guide and linked Preview overview were retrieved and read again. The guide separates management, published delivery and draft Preview. The Preview overview still gives a Sync request and overstates delivery-feature parity; the live official Preview API reference still excludes Sync and specifies separate Preview credentials and regional hosts. The conflict remains explicit. Other product evidence dates and application compatibility limits above are unchanged. No consuming SDK or connected application was exercised.
