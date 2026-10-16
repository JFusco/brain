# Implementation status

## Current maintenance delivery

The maintenance change is tracked in [JFusco/brain issue 1](https://github.com/JFusco/brain/issues/1) and [delivery PR 2](https://github.com/JFusco/brain/pull/2). Their saved records provide the current publication state and hosted execution evidence.

- Automatic curation prepares small useful notes and documented issue-linked PRs. Exact merged-file verification precedes candidate acceptance. Partial use of evidence leaves the candidate pending.
- Fifteen sources have active local references. Six new documentation sources contain 4,790 distinct catalog links: Vercel (1,656), React (225), Tailwind (197), Contentstack (2,241), Optimizely CMS SaaS (278), and Optimizely Graph (193). Catalog entries are links and metadata, not downloaded page bodies. Existing snapshots are retained; superseded React page bodies and oversized metadata use the private object cache. The old Next.js full export no longer refreshes automatically.
- `lookup --query <terms> --domain <domain>` selects relevant official links and published notes. Optional `--fetch` returns focused excerpts and caches only excerpts and retrieval receipts for 24 hours. Pinned repository fetches verify the Git blob.
- Full context-wiki scripts, native hooks, and the three requested GitHub workflows are installed locally. `BOT_TOKEN` exists in repository secrets; hosted execution remains to be verified during delivery.
- A daily 03:15 America/New_York local automation is active for Brain documentation only: at most 12 candidates and one issue-linked PR per run. It may merge only after runtime/wiki checks and exact-head verification. It cannot change code, hooks, workflows, registrations, policies, other repositories, or memories.

The source audit covered maintained runtime modules, CLI/setup, configuration, source/catalog logic, scheduling, hook integration, and wiki navigation. It found and addressed repeated nested skill identities, whole-candidate acceptance after partial use, unreachable repository links, and a hook that prevented wiki work from running. The skill matcher's combined workspace dependencies and incidental keyword tagging remain documented limitations. Inbox review was a bounded cross-domain sample, not a semantic audit of every candidate or upstream page.

Runtime content and official integrity checks have passed locally. The requested wiki graph/integrity checks have passed locally. Selective fetch succeeded for React `useEffect`, Contentstack's Sitecore migration guide, and Vercel deployment protection; React's excerpt cache also returned a hit. These do not establish the correctness of every technical claim. Tests, fixtures, fresh-session checks, dedicated QA, and review-agent audits remain deferred. See [the maintenance topic](wiki/topics/automatic-knowledge-maintenance.md) for current behavior and evidence limits.

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
