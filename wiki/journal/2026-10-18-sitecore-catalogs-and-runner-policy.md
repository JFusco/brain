---
title: "Sitecore catalogs, runner policy and merged-branch cleanup"
topics: ["automatic-knowledge-maintenance"]
plans: ["2026-10-18-register-sitecore-catalogs-and-preserve-contentful-follow-up-1bc888d3dc.md"]
issue: "https://github.com/JFusco/brain/issues/64"
issues: ["https://github.com/JFusco/brain/issues/62", "https://github.com/JFusco/brain/issues/64"]
---

# Sitecore catalogs and runner policy

[PR 63](https://github.com/JFusco/brain/pull/63) merged the runner policy as
`f8eb511363186ef181c727f3fc53ce2b44757f56` before the documentation registrations
arrived. [PR 65](https://github.com/JFusco/brain/pull/65) contains the Sitecore
registrations, the collection-fetch header correction and the branch cleanup
rule. The README/wiki follow-up initially stopped for user review; the user
subsequently authorized merge once the final checks pass. The linked PR is
the authoritative merge record. Contentful remains pending in
[issue 64](https://github.com/JFusco/brain/issues/64).

## What PR 63 established

`runnerBlockedHosts` lists `doc.sitecore.com` and `www.contentful.com`.
`official sync --hosted` skips sources on those hosts. The weekly workflow
also excludes their links from its sample and reports the skipped sources.
These skips are neither refresh success nor link-health evidence. Local
sync is the current refresh path for these registrations; the policy does
not inherently require macOS.

The initial runner failures recorded in the
[coverage registration journal](2026-10-18-coverage-registrations.md) remain
historical evidence. They did not prove the vendor documentation was absent.

## What PR 65 adds

Commit `136a694` adds AGENTS.md delivery step 8. After merge, check that a
branch tip equals its merged PR head before removing the remote branch,
local branch and worktree. Preserve dirty and unmerged work.

Commit `48639ded6d0fa2787afbb3833ccea0e5f169971e` sends explicit index Accept
headers and registers these official product sitemaps:

| Source | Entry point | Catalog links | Applicability |
| --- | --- | --- | --- |
| `sitecoreai-docs` | [SitecoreAI sitemap](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitemap.xml) | 407 | SitecoreAI platform developer manual; separate Content SDK, ASP.NET Core SDK and JSS manuals are outside this catalog |
| `sitecore-xp-docs` | [Experience Manager sitemap](https://doc.sitecore.com/xp/en/developers/104/sitecore-experience-manager/sitemap.xml) | 393 | Experience Manager 10.4 developer manual; separate Experience Platform, administration, developer-tools and managed-cloud manuals are outside this catalog |

Sitecore's `robots.txt` advertises `/sitemap-index.xml`, whose product child
sitemaps identify the entry points above. The originally supplied
`/sitemap.xml` was not the working index. The full index lists 404 child
sitemaps, exceeding Brain's 32-index traversal limit; the selected product
manuals avoid unrelated products and versions.

Direct requests to the selected sitemaps returned 403 without Accept and
200 with it. The collection reader now declares XML types for sitemaps and
Markdown/text types for other indexes. Host validation, redirects, byte and
page limits, privacy scanning and last-good preservation remain enabled.

The selected catalogs preserve the language-neutral paths actually listed
by the sitemaps: `/sai/developers/sitecoreai/` and
`/xp/developers/104/sitecore-experience-manager/`. Their sampled requests
redirect to English pages. The raw sitemaps list 423 and 401 entries;
16 and 8 URLs fall outside the configured prefixes and were not catalogued
or declared dead. This is selected-manual coverage, not all Sitecore docs.

The catalog revisions are
`dd09cf3c81ad51d22f936f2bc442ca6c0af733b3db96cea5e8b510d03654732e`
and `08b5fa1d9b1bdcd8dbfc634f4b626e214b12eb21a70f96dcec5c7b86c0f07ff1`.
Only the two new lock entries changed; no existing source was refreshed.

## Contentful remains pending

Chrome opened Contentful's documentation page, its `llms.txt`, `robots.txt`
and sitemap index. Its robots file identifies
`https://www.contentful.com/sitemap-index.xml`, which links the developer
sitemap. Direct requests to the LLM index, robots file, sitemap index and
developer sitemap still returned HTTP 429 with a Vercel challenge, including
from the Mac and with an Accept header. Browser access therefore does not
establish unattended CLI access. No Contentful catalog was registered, no
mirror was substituted, and the failure receipts were retained privately.

## Verification and remaining limits

At the Sitecore implementation commit:

- Targeted local sync changed both Sitecore sources with no failures or skips.
- Runtime content/privacy check and read-only official integrity check both
  returned `ok: true`, with no issues or warnings.
- Both domain lookups returned three catalog pages for `data templates`.
- One focused excerpt per source returned article content and a response
  hash; full vendor page bodies were not retained.
- Five links per source reached HTTP 200 after language redirects. Each
  retained its original HEAD 403 and successful GET fallback. All ten
  observations were `redirected`, with no sampled problems; coverage was
  explicitly incomplete.
- Wiki integrity, syntax, diff whitespace and the native staged privacy
  guard passed. Hosted Wiki integrity also passed on `48639de`. The native
  hook's missing-journal advisory is addressed by this follow-up.

This documentation follow-up rebuilds the graph, runs scoped plan discovery,
wiki integrity and Brain runtime checks, and records its exact-head results
in the saved PR Verification section. Tests, fixtures, fresh-session checks,
dedicated QA and review-agent audits remain deferred for v1.

## Local cleanup and rollback

The old LaunchAgent and the two explicitly approved obsolete cache
directories were removed. Two Claude skill links were created; both Codex
links already existed. Eight remote branches, seven local branches and five
old worktrees were removed only after their clean/merged state and exact
heads were checked. Temporary delivery worktrees and private-config links
are removed after use; the open PR 65 branch must remain until merge.

The primary checkout's pre-existing edits were preserved, so local main was
not fast-forwarded. Its edited CLI rejected `inbox rescan` as an unknown
subcommand; no successful rescan is claimed. The user revised the curator
prompt separately in the app; this is not proof that a scheduled run occurred.

Revert the Sitecore registration/header commit and this documentation
follow-up to undo their tracked changes. Preserve private receipts and
existing checkout work. The plan was archived as partial at the pre-merge
review checkpoint and retains that earlier instruction. Contentful remains
deferred; the later merge authorization does not register it. Branch cleanup
is required after the actual merge.
