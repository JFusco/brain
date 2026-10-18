---
title: "Simplification phase 3: official references as a link registry"
topics: ["automatic-knowledge-maintenance", "hosted-maintenance", "link-warning-investigation"]
plans: ["2026-10-18-brain-simplification-phase-3-official-references-as-a-link-registry-22cef58128.md"]
issue: 'https://github.com/jfusco/brain/issues/56'
issues: ['https://github.com/jfusco/brain/issues/56']
---

# Simplification phase 3

[Issue 56](https://github.com/JFusco/brain/issues/56) delivers phase 3 of the simplification audit. Before it, `official/` was 1,544 of 1,696 tracked files and 23.5 MB of 24.7 MB:

- 15 active vendor snapshots;
- 17 superseded revisions kept only for `official rollback`;
- manifests, lock policy hashes, a 232-line `.gitignore` large-file block, a private object cache and `official restore`.

A fresh clone failed `check` until two cached files were restored. A daily hosted machine (prepare → Codex investigator → publish → verify, plus a 04:00 watch) existed mostly to keep the mirrors current, and it needed `OPENAI_API_KEY` and `BOT_TOKEN`. The LaunchAgent only regenerated hubs and the stale queue, and without it `maintenance status` exited 1 forever.

## Joe's decisions

1. Repository skill sources become pinned-revision link catalogs, and hubs link upstream.
2. Delete the superseded revisions and `official rollback`; `git revert` is the rollback.
3. Remove `nextjs-docs`.
4. Replace the hosted machine with one weekly workflow that refreshes catalogs in the runner, samples links, runs `check`, and keeps one issue. It uses `GITHUB_TOKEN` only: no Codex and no PRs.
5. Drop lock `policySha256` and the registry-only `inbox propose`/`apply`.
6. Remove the LaunchAgent and `scheduled-run`.
7. Drop the vendor-body policies, keeping each source's `license` field.
8. Catalog-refresh-only PRs stay auto-mergeable under `AGENTS.md` step 7. Registry, workflow and code PRs stop at the PR.

## Changes

One commit per work item:

- **Hosted jobs removed.** `brain-maintenance.yml`, `brain-maintenance-watch.yml`, `.github/codex/` and `scripts/hosted/{maintenance,inspect}.mjs`.
- **Registry proposals removed.** `inbox propose`/`apply` and the proposal-transaction recovery that ran before every mutation.
- **LaunchAgent removed.** `launchd/`, `scheduled-run`, `maintenance run` and `setup.mjs --launch-agent`.
  - `maintenance status` fails only on publication errors.
  - It reports catalog age and local link counts as data.
- **`nextjs-docs` removed.** Its 4.4 MB `llms-full.txt` was over lookup's 2 MiB read bound and contributed no lookup entries.
- **Superseded snapshots dropped.** 16 revisions (923 files), the lock's `history` and `official rollback`.
- **Snapshots replaced with catalogs.**
  - `official/catalogs/<id>.json` holds links, titles, skill metadata and `referenceIssues`. Repository sources list `SKILL.md` and Markdown docs at the pinned commit, with a blob URL, a raw fetch URL and the Git blob ID.
  - The v2 lock keeps `revision`, `fetchedAt`, `track` and `catalogSha256`. Revisions are unchanged, so note provenance and stale detection keep working.
  - `sync` builds catalogs in memory and scans them.
  - `check` validates in staged and full modes:
    - registry structure;
    - lock and catalog hashes and revisions;
    - approved hosts;
    - registry drift against skill policy;
    - hub sections.
  - Hubs link upstream. `knowledge/nextjs/version-matched-docs.md` links the live `llms.txt`.
- **Vendor-body policies dropped.** Seed parity, `scanExceptions`, license-file capture, `mappings`, `refresh`, the dead CLI flags and config keys. The registry is schemaVersion 2 with strict per-kind fields, and falls from 60 KB to 12 KB.
- **Weekly workflow.** `.github/workflows/brain-weekly.yml` and `scripts/hosted/weekly.mjs`:
  - runs Mondays 08:23 UTC on a plain UTC cron;
  - keeps one fingerprinted `[Task] Brain weekly reference health` issue;
  - carries link state in a 90-day artifact.
- **Docs.** README, `AGENTS.md` (including step 7), STATUS, the knowledge index and the brain skill. [Hosted maintenance](../topics/hosted-maintenance.md) and [link warning investigation](../topics/link-warning-investigation.md) are historical; [automatic knowledge maintenance](../topics/automatic-knowledge-maintenance.md) gains the current flow.

**A defect found during verification.** Codeload's tarball applies the repository's line-ending attributes. Every Sitecore file arrived with CRLF while its Git blob uses LF, so blob IDs hashed from archive bytes were wrong for 20 of 476 entries. Blob IDs now come from the repository tree.

## Verification (cloud session, 2026-10-18)

Environment: Node 24.14.0 and the pinned Gitleaks 8.30.1 from `scripts/hosted/setup.mjs`. That profile has no client terms.

- **Baseline on `main` (`7f5f550`).** Full `check` passed after `official restore` of the two git-ignored active files, with 230 historical cached files unavailable. Saved for comparison:
  - `lookup` (5,794 entries);
  - `skills suggest` for two scratch projects;
  - `curation stale`;
  - six queries.
- **Guard.** The pre-commit `check --staged` passed on every commit.
- **Conversion.** A one-off script built every catalog from the hash-verified active snapshots with the same builder `sync` uses. It asserted that skill metadata and reference issues equal the old lock, and that revisions equal the old values.
- **Parity:**
  - `lookupEntries` for all twelve views showed zero differences apart from the added `fetchUrl`/`gitBlobSha` and two intended edits: the fixed note's hash and the react pointer reason.
  - `skills suggest` (React 19 + Next 16 + Tailwind 4, and a Sitecore/Contentstack/Contentful/Optimizely project) was byte-identical, as were `curation stale` and the six saved queries.
- **Sync reproduces catalogs.** In a scratch clone, pinned `official sync` reproduced all six tarball-backed repository catalogs byte-for-byte. A later default-branch weekly run refreshed five of them through the tree path, unchanged.
- **Blob IDs.** All 476 match GitHub's raw files at the pinned commits.
- **`lookup --fetch`.** A Sitecore skill, Optimizely SDK and Contentful docs, and a react-docs page each returned an excerpt with a content-hash receipt.
- **Links.** Sampled links for four repository sources were all healthy, and every GitHub catalog origin returned 200.
- **Fresh clone.** Clone, run `hosted/setup.mjs`, then `check`: passes with no restore and no warnings.
- **Negative checks.** Each of these fails `check`:
  - an unsupported registry field;
  - a registry skill-policy edit without `sync`;
  - a pinned track without a revision;
  - an uncatalogued source (also a warning).
- **Removed commands.** `scheduled-run`, `maintenance run`, `inbox propose` and `official rollback|restore|recatalog` are refused.
- **Weekly script.** Run with a stateful `gh` stub, it produced each outcome:
  - opened, then no-op on identical findings;
  - updated after rotation with restored state (an off-host injected record was dropped);
  - closed with a comment when a run found none;
  - refused a non-main ref.
- **Size.** `official/` went from 1,544 files and 23,537,356 bytes to 16 files and 1,635,555 bytes. All tracked content went from 1,696 files and 24,718,277 bytes to 164 files and about 2.8 MB.

**Environment limits.** This sandbox's network policy blocks vendor websites (nextjs.org, react.dev, vercel.com, contentstack, docs.optimizely.com). Their sync, fetch and link checks could not run here. Repository API reads were intermittently refused (HTTP 403), so the trees path for react-docs and tailwind-docs was not re-exercised. Those catalogs carry over unchanged.

## Limits and follow-up

**On Joe's Mac after merge:**

- Unload the LaunchAgent: `launchctl bootout gui/$(id -u)/com.joefusco.brain`, then `rm ~/Library/LaunchAgents/com.joefusco.brain.plist`.
- Delete the now-untracked `official/snapshots` and `official/manifests`; `check` warns until they are gone.
- Confirm `.state/proposal-transaction.json` does not exist.
- Optionally remove `.state/objects/`, `.state/snapshots/` and the other phase-3-only `.state` files.
- Review the nightly curator prompt for removed commands.
- The phase 2 follow-ups still apply: `inbox rescan`, the two `brain-capture` links, the repointed curator, and a staged check with real client terms.

**After merge:**

- Dispatch `brain-weekly.yml` twice; the second run should find the first run's artifact.
- Confirm the old schedules stopped.
- `OPENAI_API_KEY` and `BOT_TOKEN` are then unused and can be deleted.

**Not covered by this change:**

- The first weekly run starts without the old link state.
- Rolling catalogs (vercel-docs, contentstack-docs) change most weeks, so the issue will often be open.
- Git history still holds the removed bytes.

**Rollback:** revert the individual commits.
