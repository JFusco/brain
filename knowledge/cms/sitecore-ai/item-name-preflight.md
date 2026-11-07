---
title: "Check destination item-name limits before preserving URL slugs"
format: "playbook"
domain: "cms/sitecore-ai"
aliases: ["MaxItemNameLength", "long URL slugs", "item-name configuration"]
evidence_date: "2026-10-30"
reviewed_at: "2026-10-30"
applicability: "Proposed SitecoreAI/XM Cloud migration preflight; current server configuration unknown; the documented 100-character default is from archived Sitecore CMS 6.0.1"
provenance: "sitecoreai-docs@4a62a6a81c56ff1042354b6a785138e4579ab08d1dcc1d098f12e4113a15b481; official serialization-path page and unregistered official CMS 6 release archive read 2026-10-30; sanitized unverified migration report"
status: "current"
versions: []
---

# Check destination item-name limits before preserving URL slugs

## When to use this

Use before planning a migration whose source URL slugs become native Sitecore item names and must remain unchanged. Confirm the target server and effective naming configuration; installed CLI, plugin and .NET versions do not establish those limits. This complements [migration evidence and dependencies](migration-evidence-and-dependencies.md) and [native import readback](import-readback-against-native-state.md).

## What to do

1. **Documented historical fact:** the [Sitecore CMS 6 release archive](https://resources.doc.sitecore.com/xp/en/SdnArchive/products/sitecore%20v5/sitecore%20cms%206/releasenotes/changelog.html), under March 24, 2009 / CMS 6.0.1 Update-1, introduced the configurable `MaxItemNameLength` setting with a default of 100 characters. This is neither a current SitecoreAI default nor a fixed database ceiling or permission to change a managed environment.
2. **Proposed:** compare the source slug corpus against the destination's confirmed effective constraints before costly cumulative planning or partial imports. If preserving names requires a change, agree it with the environment owner and use that target's supported configuration/deployment process. Do not silently truncate names, change URLs or treat a changed display label as proof of preserved routing.
3. **Documented boundary:** SitecoreAI's [maximum relative serialization path](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecore-content-serialization/serialization-paths/configure-the-maximum-relative-item-path-length.html) setting concerns filesystem path/file-name constraints. **Proposed:** keep serialization path length, native item-name length and published URL behavior as separate checks; tuning one does not prove the others.
4. **Proposed:** preserve detailed sanitized GraphQL errors on the first rejected create, keep the pending attempt and reconcile the native path before any authorized retry. Do not repeat a mutation merely to recover an error message discarded by a wrapper. A generic rejection alone does not prove name length caused it.
5. **Proposed:** verify the deployed configuration and the original-name create/readback in the actual target before reporting the issue fixed. Check the required URL separately. Keep ownership, approval, drift and pending-attempt safeguards intact.

## Evidence and limits

**Unverified historical report:** a capture describes a short-name create/readback followed by a generic long-name rejection and read-only reconciliation finding the second page absent. It retained the execution ledger but not the detailed server error or effective setting. Name length therefore remains a hypothesis for that incident, not a proven cause.

No connected create, configuration change, deployment or URL test ran during curation. Target configuration support and service-build applicability remain unknown. The release archive is an official historical reference outside the registered catalog; its content is not automatically tracked by Brain's source-revision signal. No archived product or incidental tooling version is recommended as a migration target.

## Pilot media names and delivered URLs separately

**Documented, checked November 7, 2026:** current [SitecoreAI Experience Edge limitations](https://doc.sitecore.com/sai/en/developers/sitecoreai/experience-edge/limitations-and-restrictions-of-experience-edge.html) describe case-sensitive media URLs using the media folder path. They also warn that sibling item names differing only by a space and a dash can map to the same published identifier. This does not establish the target tenant's full item-name validation rules.

**Proposed:** before a filename stem becomes a media item name at scale, obtain an authorized small pilot covering spaces, combined spaces/dashes, an internal dot, non-ASCII characters and relevant case distinctions. Preflight potential normalized collisions; do not deliberately publish colliding siblings into a shared production location. Read the exact expected native item path and identity independently, then fetch the delivered media URL. Preserve the intended spelling and fail closed on an unexpected rename instead of adopting a look-alike path. Local validation and echo fixtures cannot prove server naming or delivery behavior.

The [Experience Manager 10.5 URL-builder reference](https://doc.sitecore.com/xp/en/developers/105/sitecore-experience-manager/build-item-and-media-urls.html) documents `EncodeNames`, `LowercaseUrls` and media `UseItemPath`. That is a product/version-specific configuration reference, not proof that a managed SitecoreAI tenant exposes identical settings. Confirm effective supported configuration with the target owner. No tenant pilot ran; no community-derived default regex, universal space mapping, or unverified legacy KB workaround is adopted here. Earlier historical length guidance retains its original evidence boundary.
