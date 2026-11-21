---
title: "Verify branch isolation and credential cleanup separately"
domain: "cms/contentstack"
aliases: ["branch pilot", "credential rollback"]
evidence_date: "2026-10-23"
reviewed_at: "2026-11-21"
status: "current"
versions: []
applicability: "Contentstack CMA v3 branch planning and cleanup; entry-migration guidance for CLI 2.0.0 and above; account scope and installed versions unverified"
provenance: "contentstack-docs@04d99e648a9c0c9cb6b94146945a2a6743a551a41d2a617bc8a758eb9e3d6291; official branch, merge, entry-migration, token and asset pages re-read 2026-11-21; sanitized unverified report and proposed acceptance procedure"
---

# Verify branch isolation and credential cleanup separately

## When to use this

Use this when an authorized pilot uses a disposable Contentstack branch and temporary token access. Branch cleanup and credential cleanup are different outcomes. Also use the branch-change checklist below when planning schema promotion or entry migration.

## What to do

1. **Documented:** [child branches](https://www.contentstack.com/docs/headless-cms/about-branches) inherit source content, including assets, and child changes do not affect the parent. The [CMA asset reference](https://www.contentstack.com/docs/developers/apis/content-management-api/assets) supports branch-scoped requests and optional branch identification in applicable responses. **Proposed:** pin the actual branch UID, record the protected branch baseline and compare relevant native metadata afterward; labels alone do not establish request scope.
2. **Documented:** [management tokens](https://www.contentstack.com/docs/headless-cms/generate-a-management-token) can have selected branch/alias scope and read/write permissions. Date-based expiry occurs at midnight UTC on the chosen date. **Proposed:** record intended scope, permissions and expiry before an authorized temporary change, then verify the saved settings again after rollback. No token contents belong in published evidence.
3. **Proposed:** verify authorized branch removal and protected-branch state separately from token restoration or revocation. Report an exception rather than silently treating branch deletion as credential invalidation. Today's date in an expiry picker is not proof of immediate revocation; confirm actual saved policy and its timing.

## Plan schema merges separately from entries

**Documented:** [branch comparison and merge](https://www.contentstack.com/docs/headless-cms/get-started-with-comparing-and-merging-branches) operate on content types and global fields. Merge strategies differ: prefer-base and prefer-compare retain base-only items, while overwrite-with-compare can remove them. The default merge creates a backup of the base branch. An alias can point to that backup for recovery.

**Documented:** the [CLI entry-migration guide](https://www.contentstack.com/docs/headless-cms/cli-entry-migration) requires CLI 2.0.0 or above and a completed schema merge. Generated scripts cover only content types involved in that merge and simple entry scenarios; complex cases need customization. Executing those scripts is a separate step, not proof that the schema merge already copied entries.

**Documented:** [branch creation](https://www.contentstack.com/docs/headless-cms/create-a-branch) can clone all, selected or no environment publication state. An unselected environment still exists at stack level and can receive publications later. The [branch overview](https://www.contentstack.com/docs/headless-cms/about-branches) describes editors remaining on main while developers change schemas elsewhere; that is a workflow, not a requirement that every deployment use main for editing.

**Proposed procedure:**

1. Record the actual source/base/compare branch UIDs, frontend branch or alias, publishing environments and editor ownership. Branch names such as development or production do not establish that mapping.
2. Compare schema changes and select the merge strategy deliberately. Review possible deletions and retain a verified recovery branch before changing production-facing schemas; confirm the account's actual branch allowance instead of assuming a fixed cap.
3. Plan entries, locales, references and publication state separately. Review generated migration scripts and validate a non-production sample before use. Keep [native import mappings and recovery limits](asset-import-state.md) in scope when choosing export/import instead.
4. Verify the resulting schema, entry identities/references and intended publication state independently. A successful merge job or alias change is not proof of complete entry migration. Branch deletion and token restoration remain separate authorized actions.

No merge, entry migration, alias switch or rollback was exercised. This guidance does not establish UID preservation or taxonomy behavior for arbitrary imports, a universal editorial branch policy, account entitlements or permission to delete and recreate a branch.

## Evidence and limits

A private capture reports a small unpublished branch pilot, before/after metadata checks, authorized branch deletion and a separately reloaded token-settings UI. It also reports a past-expiry selection refusal requiring a human decision. These are explicitly unverified historical reports; no CMS write, deletion, token edit or rollback was executed here. The UI refusal is not generalized as a vendor guarantee. Branch isolation does not establish isolation for every account-wide resource, entitlement or user role. This is a proposed verification procedure, not authorization to mutate credentials or delete any branch. For upload uncertainty, see [import state](asset-import-state.md).

**Revalidated October 26, 2026:** Branch inheritance/parent isolation, CMA branch scope and management-token branch/alias permissions plus midnight-UTC expiry were re-read. Branch removal still does not establish credential revocation; the reported UI refusal and historical pilot remain unverified observations. No token, branch or native content was mutated.

**Revalidated November 8, 2026:** The three linked official pages still support branch inheritance, parent isolation, branch-scoped asset requests and midnight-UTC token expiry. Branch creation can select which environments to clone, so record that choice separately from inherited content. Token rate limits, when available on the plan, remain bounded by organization limits; they are not another isolation boundary. The proposed cleanup checks and historical UI report remain unexercised. No credentials or CMS state were changed.

**Revalidated November 21, 2026:** Current official pages confirm branch inheritance and environment selection, branch-scoped asset requests, token branch/alias permissions and midnight-UTC expiry. Schema merge, separate entry migration and backup recovery now have explicit boundaries. Existing cleanup proposals and historical pilot reports remain unverified in a live CMS.
