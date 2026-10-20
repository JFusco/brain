---
title: "Choose Contentful delivery or Preview before copying examples"
domain: "cms/contentful"
aliases: ["Contentful Preview API", "draft content", "preview token", "Contentful Sync"]
evidence_date: "2026-10-20"
reviewed_at: "2026-10-20"
status: "current"
versions: []
applicability: "Contentful Content Delivery and Content Preview APIs; does not establish support in a particular JavaScript SDK version"
provenance: "contentful-skills@6dc5d75db7fc6515658e8f8eb2394d76292cfdf3; official Content Preview API reference checked 2026-10-20; moved from knowledge/_unsorted/cms-guidance.md"
---

# Choose Contentful delivery or Preview before copying examples

## When to use this

Use this before copying a Contentful data-loading example into a feature that shows published content, draft content, or both, for example a preview mode for editors.

## What to do

1. Decide which API surface the feature reads. Use the Content Delivery API for published content, and the Content Preview API for draft and changed content.
2. For Preview, use the appropriate regional preview host and a Preview access token. A production delivery token does not work with Preview, so keep the two tokens and hosts separate in configuration.
3. Don't carry a Sync-only data-loading design into Preview. The [official Preview API reference](https://www.contentful.com/developers/docs/references/content-preview-api/overview/) explicitly excludes Sync, so a preview path built on Sync needs a query-based design instead.
4. At the pinned revision cited here, treat the Contentful skill's [preview overview](https://github.com/contentful/skills/blob/6dc5d75db7fc6515658e8f8eb2394d76292cfdf3/skills/contentful-api/references/content-preview/overview.md), which shows a Sync request against the preview host, as conflicting reference material. Prefer the API reference for this decision.

Choosing the surface first avoids building a loader that works against delivery and then fails, or silently diverges, in preview.

## Evidence and limits

**Documented:** the official Preview API reference excludes Sync. The [Contentful API guide](https://github.com/contentful/skills/blob/6dc5d75db7fc6515658e8f8eb2394d76292cfdf3/skills/contentful-api/SKILL.md) separates management, delivery and preview.

**Revalidated in the October 20 scheduled source check:** the refreshed pinned API entry point still separates management, delivery and preview. Both that entry point and its Preview example were retrieved and read again; their unchanged bytes are an integrity observation, while the following API comparison establishes the advice. Its linked Preview overview still includes a Sync request against the preview host and overstates parity with all delivery features. The live official API reference continues to exclude Sync, so the warning remains necessary at this newer revision. The US/EU preview hosts and separate Preview token were also checked against that API reference. Use query endpoints for Preview instead of adopting the conflicting Sync example. This is a claim comparison, not a conclusion inferred from changed file hashes.

The October 18 comparison remains historical evidence in Git history. This revalidation does not make the copied skill's other examples authoritative or establish their correctness.

These are API-surface checks, not proof that a particular JavaScript SDK version supports the application. Confirm the consuming application's installed SDK and the API it selects. This note doesn't cover GraphQL preview, Live Preview tooling, or token storage.
