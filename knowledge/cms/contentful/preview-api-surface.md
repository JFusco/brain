---
title: "Choose Contentful delivery or Preview before copying examples"
format: "playbook"
domain: "cms/contentful"
aliases: ["Contentful Preview API", "draft content", "preview token", "Contentful Sync"]
evidence_date: "2026-10-31"
reviewed_at: "2026-10-31"
status: "current"
versions: []
applicability: "Contentful Content Delivery and Content Preview REST APIs; SDK-version support and application behavior require separate verification"
provenance: "contentful-skills@8fc4acbc5fb9c180930ec4ea78be387acfacfe75; official Content Preview API overview checked 2026-10-31 America/New_York"
---

# Choose Contentful delivery or Preview before copying examples

## When to use this

Use this before choosing a REST data-loading path for published content or an editor's draft preview. Confirm the consuming application's installed SDK separately; a reference example does not establish version compatibility.

## What to do

1. Select the API for the content state: Content Delivery for published content, or Content Preview when the latest drafts must be available alongside published content.
2. Configure the regional Preview host and a Preview token together. The US host is `preview.contentful.com`; EU data-residency customers use `preview.eu.contentful.com`. Production delivery tokens do not authenticate Preview requests.
3. For a Preview loader, use the documented query endpoints instead of assuming a delivery Sync implementation can be reused. The [official Preview API overview](https://www.contentful.com/developers/docs/references/content-preview-api/overview/) excludes Sync.
4. Compare copied examples with that API contract. At the reviewed pin, the [skill's Preview overview](https://github.com/contentful/skills/blob/8fc4acbc5fb9c180930ec4ea78be387acfacfe75/skills/contentful-api/references/content-preview/overview.md) still includes a Sync request against Preview and overstates delivery-feature parity. Do not adopt that conflicting example.

Selecting the content state, host, token and supported loading API together avoids treating a working delivery loader as proof that preview will work.

## Evidence and limits

**Documented facts, checked October 31, 2026 (America/New_York):** the live Preview API overview describes draft/published reads, separate Preview credentials, the US/EU hosts and the exclusion of Sync. The [pinned API guide](https://github.com/contentful/skills/blob/8fc4acbc5fb9c180930ec4ea78be387acfacfe75/skills/contentful-api/SKILL.md) separates management, published delivery and Preview. Its linked Preview example conflicts with the live API limitation; the conflict remains explicit at this revision.

Both pinned files were retrieved and read, and their Git blob identities matched the catalog. Identity verification establishes which files were examined; the comparison with the API contract establishes the documented conflict. Earlier revalidations remain in Git history.

**Proposed application practice:** verify an entry-query preview path with representative draft and published content in the consuming project before relying on it. This review did not run an SDK, authenticate to a space, execute the conflicting Sync request or test a connected application. It does not cover GraphQL preview, Live Preview tooling or token storage, and it does not validate the skill's other examples.
