---
title: "Verify branch isolation and credential cleanup separately"
domain: "cms/contentstack"
aliases: ["branch pilot", "credential rollback"]
evidence_date: "2026-10-23"
reviewed_at: "2026-10-23"
status: "current"
versions: []
applicability: "Contentstack CMA v3 unpublished pilot planning; account scope and installed SDK/CLI versions unverified"
provenance: "contentstack-docs@27fb06e5aabe557865140dfcf163b8576b091a0711ecf2d98737750645f1543d; official branch/token/asset pages read 2026-10-23; sanitized unverified report and proposed acceptance procedure"
---

# Verify branch isolation and credential cleanup separately

## When to use this

Use this when an authorized pilot uses a disposable Contentstack branch and temporary token access. Branch cleanup and credential cleanup are different outcomes.

## What to do

1. **Documented:** [child branches](https://www.contentstack.com/docs/headless-cms/about-branches) inherit source content, including assets, and child changes do not affect the parent. The [CMA asset reference](https://www.contentstack.com/docs/developers/apis/content-management-api/assets) supports branch-scoped requests and optional branch identification in applicable responses. **Proposed:** pin the actual branch UID, record the protected branch baseline and compare relevant native metadata afterward; labels alone do not establish request scope.
2. **Documented:** [management tokens](https://www.contentstack.com/docs/headless-cms/generate-a-management-token) can have selected branch/alias scope and read/write permissions. Date-based expiry occurs at midnight UTC on the chosen date. **Proposed:** record intended scope, permissions and expiry before an authorized temporary change, then verify the saved settings again after rollback. No token contents belong in published evidence.
3. **Proposed:** verify authorized branch removal and protected-branch state separately from token restoration or revocation. Report an exception rather than silently treating branch deletion as credential invalidation. Today's date in an expiry picker is not proof of immediate revocation; confirm actual saved policy and its timing.

## Evidence and limits

A private capture reports a small unpublished branch pilot, before/after metadata checks, authorized branch deletion and a separately reloaded token-settings UI. It also reports a past-expiry selection refusal requiring a human decision. These are explicitly unverified historical reports; no CMS write, deletion, token edit or rollback was executed here. The UI refusal is not generalized as a vendor guarantee. Branch isolation does not establish isolation for every account-wide resource, entitlement or user role. This is a proposed verification procedure, not authorization to mutate credentials or delete any branch. For upload uncertainty, see [import state](asset-import-state.md).
