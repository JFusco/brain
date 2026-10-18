---
title: "Choose Contentful delivery or Preview before copying examples"
domain: "cms/contentful"
aliases: ["Contentful Preview API", "draft content", "preview token", "Contentful Sync"]
evidence_date: "2026-10-18"
reviewed_at: "2026-10-18"
status: "current"
versions: []
applicability: "Contentful Content Delivery and Content Preview APIs; does not establish support in a particular JavaScript SDK version"
provenance: "contentful-skills@1e40a4c0e841faa5e7f1146a70c5eb605c7802d0; official Content Preview API reference checked 2026-10-18; moved from knowledge/_unsorted/cms-guidance.md"
---

# Choose Contentful delivery or Preview before copying examples

## When to use this

Use this before copying a Contentful data-loading example into a feature that shows published content, draft content, or both, for example a preview mode for editors.

## What to do

1. Decide which API surface the feature reads. Use the Content Delivery API for published content, and the Content Preview API for draft and changed content.
2. For Preview, use the appropriate regional preview host and a Preview access token. A production delivery token does not work with Preview, so keep the two tokens and hosts separate in configuration.
3. Don't carry a Sync-only data-loading design into Preview. The [official Preview API reference](https://www.contentful.com/developers/docs/references/content-preview-api/overview/) explicitly excludes Sync, so a preview path built on Sync needs a query-based design instead.
4. Treat the copied Contentful skill's [preview overview](https://github.com/contentful/skills/blob/1e40a4c0e841faa5e7f1146a70c5eb605c7802d0/skills/contentful-api/references/content-preview/overview.md), which shows a Sync request against the preview host, as conflicting reference material. Prefer the API reference for this decision.

Choosing the surface first avoids building a loader that works against delivery and then fails, or silently diverges, in preview.

## Evidence and limits

**Documented:** the official Preview API reference excludes Sync. The [Contentful API guide](https://github.com/contentful/skills/blob/1e40a4c0e841faa5e7f1146a70c5eb605c7802d0/skills/contentful-api/SKILL.md) separates management, delivery and preview.

**Observed:** the October 18 revalidation checked the refreshed Contentful API entry point and preview overview against the live official Preview API reference. Both pinned Contentful files matched their recorded SHA256 values. Byte integrity did not establish the preview overview's Sync claim as correct.

These are API-surface checks, not proof that a particular JavaScript SDK version supports the application. Confirm the consuming application's installed SDK and the API it selects. This note doesn't cover GraphQL preview, Live Preview tooling, or token storage.
