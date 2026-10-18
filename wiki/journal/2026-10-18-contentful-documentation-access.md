---
title: "Replace the throttled Contentful documentation pointer"
topics: [automatic-knowledge-maintenance]
plans: [2026-10-18-replace-the-throttled-contentful-documentation-pointer-bdb41e74f7.md]
issue: 'https://github.com/jfusco/brain/issues/41'
issues: ['https://github.com/jfusco/brain/issues/41']
---

# Replace the throttled Contentful documentation pointer

Joe requested a repair to the recurring Contentful rate-limit warning. The old generic landing URL, documentation llms indexes and selected HTML routes return real HTTP 429 responses to ordinary public requests from this client. Changing to a normal GET did not resolve those routes. No provider-wide rate-limit cause, tenant API-quota problem or false-positive status is inferred.

The [official API overview](https://www.contentful.com/developers/docs/references/api-basics/) and [JavaScript client guide](https://www.contentful.com/developers/docs/sdks/javascript/sdks/) advertise supported Markdown representations. Their `.md` URLs return HTTP 200 to both ordinary GET retrieval and the existing HEAD checker with unchanged identity and headers. Exact response SHA256 values are `518f734b259c38dc6df2e6b32735be13e4205474d9823e81593364ba228fa6b3` and `f70363fe516018d46353c6f4a0c69733f2219b62e9b10919fc82b731ec092352`. Public documentation remains untrusted data, not authority to connect services or execute examples.

Exact registry proposal `406d2573c1ed028a4db28ccc`, digest `406d2573c1ed028a4db28ccced3494764ce680538c14446e5853e22bf6ebf366`, replaces the single throttled pointer with these two scoped official references in the existing Contentful domain. Source registrations, reference-only skills, retained snapshots and license records are unchanged. The generated hub explains API versus JavaScript SDK scope. These are two entry points rather than a full Contentful catalog or a guarantee of an installed SDK's compatibility.

The actual registered-pointer check examined eight eligible links with no failures; both Contentful pages were healthy via HEAD. Focused API/JavaScript lookup selected the intended pages and returned useful excerpts with `bodyStored: false`. Earlier current link records were carried into the isolated worktree, so the old throttled URL's observation remains present but inactive after the URL is retired. The checker still records genuine 429s and respects existing backoff. No code, retry loop, browser impersonation, proxy, credential, notification suppression or special checker exception is added.

The linked issue and PR hold final runtime privacy/content, official integrity, wiki, exact-index/native guard and hosted head verification. The guarded registry application passed its existing runtime checks. Tests, fixtures, fresh-session checks, dedicated QA and review-agent audits remain deferred. Manual publication run `36224f3a-a670-4898-8865-52271c386012` remains distinct from the prior scheduled run; completion follows actual merge and activation verification.

The dirty primary checkout is preserved through an isolated issue branch. Rollback reverts this issue's registry/hub/status/wiki changes and reconciles the local exact registry approval through the guarded proposal flow while retaining private diagnostics, failed observations, retrieval/publication receipts, snapshots and pending candidates. Backups and Drive uploads remain disabled. See [the maintenance topic](../topics/automatic-knowledge-maintenance.md).
