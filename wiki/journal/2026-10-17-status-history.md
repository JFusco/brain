---
title: "Historical implementation status before project cleanup"
topics: ["automatic-knowledge-maintenance"]
issue: 'https://github.com/jfusco/brain/issues/27'
issues: ['https://github.com/jfusco/brain/issues/27']
---

# Historical implementation status before project cleanup

This is the former status text with relative links adjusted for its archive location retained on 2026-10-17 before the root status page was shortened. Counts, incident reports, schedules, and success claims below are historical observations, not current status. See [current implementation status](../../STATUS.md).

# Implementation status

## Sitecore retrieval repair

[Issue 14](https://github.com/JFusco/brain/issues/14) resolves the remaining Sitecore warning. A six-request comparison showed that Sitecore rejects HEAD, while an ordinary GET with a documentation-compatible Accept header returns HTTP 200. Probes now use that header and one bounded GET fallback for HEAD 403/405/501, retaining method/status evidence and discarding response bodies. Genuine GET restrictions remain failures.

Both SitecoreAI and Sitecore Experience Manager 10.4 now use verified canonical pages and return HTTP 200 through the actual checker. The old 10.4 directory returned 404 on a valid GET and was replaced by its working `index-en.html` page. Current registry/hub text no longer describes these pages as inaccessible. Focused lookup reads the publisher's explicit main-content landmark rather than embedded assistant UI; only excerpts and retrieval receipts are cached. Existing failed observations and wiki history remain intact.

A targeted five-pointer check returned four healthy destinations, including both Sitecore pages, and the previously known Contentful HTTP 429. Sitecore is healthy; Contentful rate limiting remains separate. This does not establish whole-catalog availability or technical compatibility.

## Link warning repair and Tailwind curation

[Issue 12](https://github.com/JFusco/brain/issues/12) tracks a bounded recheck of all 25 outstanding warnings. Twenty-four now succeed (23 direct HTTP 200 responses and one redirect ending in HTTP 200); Sitecore still returns HTTP 403 to automated requests. No 404/410 was observed. Current coverage is 72 observed destinations out of 5,753 eligible links: 70 healthy, one redirected and one restricted. Earlier failed observations remain private history; this is not an exhaustive audit.

Failed links now become eligible after their recorded backoff rather than being held by the healthy daily sampling window. Due failures precede new samples within each source; `links check --retry-failures` restricts a bounded run to due warnings. Healthy links and 404/410 observations retain the daily window.

Tailwind has 197 official catalog links and 34 pending tagged candidates. A six-candidate review yielded the first curated Tailwind 4 note, [responsibility-based tokens](../../knowledge/tailwind/responsibility-based-tokens.md). Its official theme mechanics were checked against a pinned reference; folder organization remains an optional project convention. Partial evidence use leaves the source candidate pending. Lookup uses explicit Tailwind versions; no consuming project is changed.

The completed one-time 4 a.m. verification automation is paused at Joe's request. Daily collection and publication remain active. Automatic backups and Drive uploads remain disabled.

## Automatic backups disabled

Joe withdrew the backup requirement after the reliability delivery. [Issue 8](https://github.com/JFusco/brain/issues/8) tracks disabling automatic archive creation, inventory previews, retention pruning and Drive uploads. Maintenance reports backups disabled without backup-requirement alerts. Existing archives, the local key, Drive files and historical receipts remain intact. Daily learning maintenance and the one-time 4 a.m. verification remain enabled; the check now expects backup work to be skipped.

## On-demand reliability follow-up

[JFusco/brain issue 5](https://github.com/JFusco/brain/issues/5) tracks this follow-up; its linked PR records publication and hosted checks. No consuming project instructions or global skills are added.

- Lookup accepts explicit package versions or one selected application workspace. It prefers installed Next.js docs when present, excludes incompatible notes, and labels rolling or unestablished compatibility honestly. Skill matching no longer combines sibling workspace dependencies.
- Stale guidance is queued after a cited source revision changes or review becomes due. Retired/superseded notes remain historical and leave recommendations. The Next.js note was revalidated against the actual official agent guide and narrowed to bundled documentation from 16.2 onward.
- Header-only link sampling rotates across 5,753 eligible destinations with a default batch of 24. The latest network-enabled batch returned 23 healthy destinations and one Sitecore HTTP 403. An earlier sandbox-restricted batch recorded 24 transient failures; those records are retained. This is partial coverage, not a claim that every link works.
- Maintenance status distinguishes attempts, success, source failure, unfinished publication, sampled coverage, stale notes, and backup availability. The existing 03:15 America/New_York automation now prioritizes stale guidance and records its actual publication outcome. First unattended execution of these additions remains unproven.
- An encrypted local backup of 6,625 private files was authenticated and restored successfully into a separate empty recovery directory. After explicit authorization, the encrypted archive was uploaded to the private Google Drive backup folder. Saved name, size, and parent-folder metadata were read back and recorded; cloud bytes were not downloaded again for verification. The daily upload permission was subsequently withdrawn; see the disablement above. The separate recovery key is never uploaded. Managed excerpt cleanup is capped and preserves unowned or modified files.

Actual runtime checks passed: content/privacy (1,226 files), official integrity, syntax (20 maintained CLI/modules), Next.js 16.1 exclusion and 16.2 match, focused pinned React fetch and cache hit, and maintenance execution with no operation failures. Status still exposes access/network warnings. The recovery key needs a separate secure off-device copy; it is excluded from archives and uploads. Installed application/workspace package resolution was not exercised against another project. Tests, fixtures, fresh-session checks, dedicated QA, and review-agent audits remain deferred.

## Previous maintenance delivery

The maintenance change is tracked in [JFusco/brain issue 1](https://github.com/JFusco/brain/issues/1) and [delivery PR 2](https://github.com/JFusco/brain/pull/2). Their saved records provide the current publication state and hosted execution evidence.

- Automatic curation prepares small useful notes and documented issue-linked PRs. Exact merged-file verification precedes candidate acceptance. Partial use of evidence leaves the candidate pending.
- Fifteen sources have active local references. Six new documentation sources contain 4,790 distinct catalog links: Vercel (1,656), React (225), Tailwind (197), Contentstack (2,241), Optimizely CMS SaaS (278), and Optimizely Graph (193). Catalog entries are links and metadata, not downloaded page bodies. Existing snapshots are retained; superseded React page bodies and oversized metadata use the private object cache. The old Next.js full export no longer refreshes automatically.
- `lookup --query <terms> --domain <domain>` selects relevant official links and published notes. Optional `--fetch` returns focused excerpts and caches only excerpts and retrieval receipts for 24 hours. Pinned repository fetches verify the Git blob.
- Full context-wiki scripts, native hooks, and the three requested GitHub workflows are installed. The hosted PR integrity check, merge-time writer, and manually dispatched issue-state writer all succeeded. `BOT_TOKEN` authenticated the writers; its value was never read or transferred locally.
- A daily 03:15 America/New_York local automation is active for Brain documentation only: at most 12 candidates and one issue-linked PR per run. It may merge only after runtime/wiki checks and exact-head verification. It cannot change code, hooks, workflows, registrations, policies, other repositories, or memories.

The source audit covered maintained runtime modules, CLI/setup, configuration, source/catalog logic, scheduling, hook integration, and wiki navigation. It found and addressed repeated nested skill identities, whole-candidate acceptance after partial use, unreachable repository links, and a hook that prevented wiki work from running. Combined workspace matching was a limitation of that delivery and is addressed by the follow-up above. Incidental keyword tagging remains a documented limitation. Inbox review was a bounded cross-domain sample, not a semantic audit of every candidate or upstream page.

Runtime content and official integrity checks have passed locally. The requested wiki graph/integrity checks have passed locally. Selective fetch succeeded for React `useEffect`, Contentstack's Sitecore migration guide, and Vercel deployment protection; React's excerpt cache also returned a hit. These do not establish the correctness of every technical claim. Tests, fixtures, fresh-session checks, dedicated QA, and review-agent audits remain deferred. See [the maintenance topic](../topics/automatic-knowledge-maintenance.md) for current behavior and evidence limits.

## Historical initial implementation

Implemented on 2026-10-15. The CLI and scheduler never commit or push. No global skill registration or project skill installations. Tests, fixtures, CI, fresh-session tests, and dedicated QA remain deferred.

The following records describe the initial implementation before the current maintenance change; their source counts, refresh interval, and manual approval flow are historical.

## Available now

- Private harvest, capture, bounded inbox review, exact-digest proposals, and approved page records.
- Immutable official snapshots, hashes, license preservation, safe downloads, rollback, exact-byte restoration, and generated domain hubs.
- Project-scoped suggestions and managed installation/update/removal with conflict checks and recovery journals. No project write operation has been invoked.
- A working scheduled command with private logs, notifications, due-time checks, and read-only project update reports.

After the manifest-classifier refinement, policy rescan, and approved first review, the current inbox contains 2,943 unresolved candidates, including 249 tagged Next.js. Of these, 191 are quarantined: 185 unknown-origin skills and 6 learning candidates flagged by the secret scanner. Earlier candidates and interrupted-run records are retained; superseded and resolved records are excluded from the current inbox. The latest manual scheduled run inspected 3,459 eligible source files, found no new candidates or unreadable sources, and deliberately skipped one symlinked directory. It completed without failures.

All nine registered sources have active snapshots. Contentful skills, Optimizely SDK docs, and the full Next.js documentation dump refreshed successfully after approval of their exact published-example fingerprints. Earlier failure reports remain in private state. Existing pinned Migrator material reproduced all 135 shared selected file hashes. The COS curated distribution is not represented as a byte-identical upstream pin; its comparison report records the adapted files and matching references.

`brain.mjs check` passed with no issues or warnings (620 files scanned), and `brain.mjs official check` passed. These are runtime content checks; the deferred test suite was not added or run.

The historical archive-container hashes did not reproduce with either standard or legacy GitHub tarballs. Selected-file parity passed; downloaded archive hashes and this distinction are recorded separately. No archive-container parity is claimed.

## First review applied

The exact initial proposal is `.state/proposals/dc62ef183356b322579be711.md`.

Joe approved this proposal, and it was applied on 2026-10-15. It adds `knowledge/nextjs/version-matched-docs.md` from two sanitized candidates and introduces 12 exact source-path/rule/line-span fingerprints for reviewed vendor examples: environment-variable auth examples, content-item identifiers, and truncated illustrative PEM values. These exceptions do not apply to personal harvests. Other findings remain blocked.

Both candidates are recorded as accepted. See `.state/initial-review-scope.md` for the compact explanation. The approved proposal digest is:

```text
dc62ef183356b322579be711b48b9cf470af379bb1cb8391b72322963fb38510
```

## Nightly schedule active

Joe ran setup in native Terminal on 2026-10-15. `.state/launch-agent.json` records successful registration at 18:43:28 UTC with exit code 0. The LaunchAgent's initial run completed immediately afterward at 18:43:28 UTC with no failures; harvest and vendor refresh were already current, so no work was due.

The job is scheduled for 02:30 local time, with harvest nightly and vendor refresh weekly when due. The first overnight run has not happened yet. This agent session still cannot query the GUI launchd domain (`141: Reentrancy avoided`); registration success and the subsequent scheduled-run record provide the activation evidence.

The installed plist is `~/Library/LaunchAgents/com.joefusco.brain.plist`. To rerun setup if needed:

```sh
node ~/Projects/brain/scripts/setup.mjs --launch-agent
```

The setup command records registration success or failure in `.state/launch-agent.json`. To inspect an enabled job:

```sh
launchctl print gui/$(id -u)/com.joefusco.brain
```

The scheduler itself can be run manually at any time:

```sh
node ~/Projects/brain/scripts/brain.mjs scheduled-run
```
