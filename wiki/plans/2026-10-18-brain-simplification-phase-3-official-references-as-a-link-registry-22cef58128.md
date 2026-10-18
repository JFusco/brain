---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/brain/issues/56", "Branch claude/magical-einstein-kdv7nw commits 45b99d0, 0351c7d, f4f4b06, 83ee045, 650d36e, 3d00632, e8dbd00, 6bae913, dd61ae6", "official/catalogs/", ".github/workflows/brain-weekly.yml"]
source_tool: "repository"
source: "/root/.claude/plans/root-claude-uploads-b27753f8-a256-5edc-sorted-pumpkin.md"
topics: ["automatic-knowledge-maintenance", "hosted-maintenance", "link-warning-investigation"]
digest: "22cef581285a6db9e0ee8414b8216456fdb3743019e159247590d7c84d47626d"
---

# Brain simplification phase 3 — official references as a link registry

## Context

**Problem.** `official/` is 1,544 of 1,696 tracked files and 23.5 MB of 24.7 MB. Most of that is mirrored vendor bodies:
- 15 active revisions;
- 17 superseded revisions, kept only for `official rollback`.

Holding them together takes manifests, lock `policySha256`, a 232-line `.gitignore` `brain:large` block, private `.state/objects` and `official restore`. As a result:
- **A fresh clone fails `check`.**
- **The daily hosted job exists mostly to maintain these mirrors.** It runs prepare → Codex investigator → publish → verify, plus a 04:00 watch, and it needs `OPENAI_API_KEY` and `BOT_TOKEN`.
- **The LaunchAgent does little.** It now only regenerates hubs and the stale queue, and `maintenance status` exits 1 permanently without it.

**Outcome.**
- `official/` holds the registry, a slim lock and small generated link catalogs. Bodies are fetched only by `lookup --fetch`.
- One weekly workflow maintains one issue.
- Registry edits are ordinary PRs.
- `check` passes in a fresh clone after setup.

**State.**
- PR #55 is merged; `main` = `7f5f550`, the base for this work.
- The first scheduled hosted run (2026-10-19 07:15 UTC) and the watch run (08:00 UTC) haven't happened yet.

## Joe's decisions (2026-10-18)

1. **Repository skill sources:** pinned-revision link catalogs (SKILL.md and doc URLs at the resolved commit, plus skill metadata). Hubs link upstream.
2. **History:** delete the 17 superseded revisions and `official rollback`; `git revert` is the rollback.
3. **`nextjs-docs`:** remove it. It contributes 0 `lookup` entries today.
4. **Hosted:** one weekly workflow.
   - It refreshes catalogs in the runner (no commit), samples links, runs `check`, then opens, updates or closes one issue.
   - It uses `GITHUB_TOKEN` only: no Codex and no PRs.
   - Link state lives in a 90-day artifact.
5. **Registry integrity:** drop `policySha256` and the registry-only `inbox propose`/`apply`.
6. **LaunchAgent:** remove `launchd/`, `scheduled-run`, `setup.mjs --launch-agent` and `maintenance run`. `maintenance status` drops "collection".
7. **Vendor-body policies:** drop `scanExceptions`, the seed fields and `--seed`, license-file capture and reviews, `CHANGES.md`, `recatalog` and `restore`. Keep each source's `license` field.
8. **Auto-merge:** catalog-refresh-only PRs (catalogs + lock + regenerated hubs) still auto-merge under AGENTS.md step 7. Registry, workflow and code PRs stop at the PR.
9. **Mac follow-ups from #55** (rescan, two `brain-capture` links, the repointed curator, a staged check with real client terms): Joe was unsure what they were, and they were explained. The PR restates them.

## Data formats

**Lock** `official/sources.lock.json` (schemaVersion 2):
- `sources[id] = {revision, fetchedAt, track, catalogSha256}`, in registry order;
- `toolchain.gitleaks` is unchanged.

`revision`/`fetchedAt` are copied verbatim, so `guidanceState()` (`scripts/lib/guidance.mjs:28`) and every note citation stay valid.

**Catalog** `official/catalogs/<id>.json`, pretty-printed:
```
{schemaVersion:1, source, revision, origin, skills:[], docs:[], pages:[], referenceIssues:[]}
```
- `fetchedAt` is not stored, so an unchanged refresh doesn't rewrite the file.
- **skills:** today's lock fields `id, name, declaredName, description, directory, installable, policy, appliesTo, preferred, [referenceWarnings], [blockedReason]`, plus `url` (GitHub blob at revision), `fetchUrl` (raw.githubusercontent at revision) and `gitBlobSha`.
- **docs:** `{path, title, url, fetchUrl, gitBlobSha}`. The rule is exactly today's `official-reference` rule in `lookupEntries`:
  - `.md`, `.mdx` or `.txt`;
  - not LICENSE, `SKILL.md` or `llms*.txt`;
  - 2 MiB or smaller;
  - title is the first `# ` heading.
- **pages:** `{title, url, fetchUrl, gitBlobSha?}`.

| Kind | Sources | Fetch (in memory only) | Revision (preserved) |
|---|---|---|---|
| repository | sitecore-content-sdk, contentstack-kickstart, vercel-agent-skills, vercel-plugin, contentful-skills, optimizely-sdk | `resolve()` → codeload tarball → `archive()` | commit |
| repository `catalogOnly` | react-docs, tailwind-docs | git trees API (existing) | commit |
| url (llms.txt, stays `kind:'url'`) | nextjs-index, react-index | `download` → link extraction with today's lookup regex on `allowedHosts` | sha256(index bytes) |
| collection | vercel-docs, contentstack-docs, optimizely-cms-saas-docs, optimizely-graph-docs | existing crawl | `pageDigest` = sha of the old PAGES.json serialization (verified equal to today's revisions) |

**Sitecore:** replace the `.agents/`→`''` mapping with `sourceBase …/nextjs-app-router-cache-components/.agents/`. Paths, directories and blob URLs stay byte-identical.

## Code changes

**`scripts/lib/official.mjs`** (rewrite)
- **Delete:**
  - snapshot code: `fingerprint`, `mapped`, `snapshotRoot`, `manifestFile`, `snapshotFiles`, `detectLicense`;
  - `refreshCatalogs`, `publish`, `licenseKey`, `updateIgnores`, `pruneSnapshots`, `rollback`, `restore`, `historicalCacheGaps`;
  - the seed path.
- **Keep:** `registry`, `lock`, `selected`, `relativeProblems`, `resolve`, `generateHubs`.
- **Add `catalogPath`, `catalogBytes` and `readCatalog`.** `readCatalog(id)` checks the sha against `catalogSha256`.
- **Add `skillPolicy` and `skillsOf`.** These are the old `catalog()`, keeping the vercel-plugin special case.
- **Add the pure `buildCatalog(spec,{revision,origin,files,index,pages})`.** Sync and the migration both use it.
- **`fetchCatalog(spec)`** keeps the tool-directory, colliding-path and "upstream path disappeared" guards.
- **`sync({ids})`:**
  - fetches and builds, rejects a catalog over 1 MiB as a source failure, then runs `assertClean(...,{clients:false})`;
  - writes the catalog and lock entry only when `catalogSha256` or `track` changed;
  - keeps the `.state/official-runs.json` failures and backoff, minus `policySha256`;
  - when run without ids, prunes unregistered entries;
  - finishes with `generateHubs()`.
  - It writes no CHANGES.md.
- **`officialSections()`** links upstream:
  - skills → blob URL, with " — reference only" when not installable;
  - repo docs → up to 8 blob URLs, the same rule as today;
  - catalog and llms sources → `[Catalog source](origin)` plus the page count and a `lookup` hint;
  - the vercel-plugin shared-hub case and the pointer lines are kept.
- **`officialProblems(read, names)`** is pure and shared by full and staged `check`:
  - **Registry structure:** unique slug ids; a valid kind; domains ⊆ config; per-kind required fields; https hosts in `allowedHosts`; valid pointers; strict per-kind keys from commit 7.
  - **Lock:** v2. An orphan entry is an issue; a missing entry is a warning ("run official sync").
  - **Catalog:** present, sha equals the lock entry, schema and revision match, every URL is https on the source's allowed hosts, `gitBlobSha` is 40-hex, page bounds hold.
  - **Registry drift** (replaces `policySha256`): skill policy fields and URLs recomputed from the spec must match ("run official sync <id>").
  - **Unexpected files under `official/`.**
  - **Stale hub official sections.**
- **`checkOfficial()`** wraps it over disk.

**Other files**
- `documentation.mjs`: drop `catalogFiles` (INDEX.md, ATTRIBUTION.md) and the `licensePath` download. Add `pageDigest`. `fetchDocumentationCatalog` returns `{pages, origin, revision}`.
- `lookup.mjs`: `lookupEntries` reads only `readCatalog`. It emits pages, then skills, then docs, with the same entry shapes plus `fetchUrl`/`gitBlobSha`. Drop `officialURL` and the snapshot reads; `shaGitBlob` moves to `core.mjs` as `gitBlob`. `fetchExcerpt` and installed-docs-first are unchanged.
- `skills.mjs`: `suggest()` reads catalog skills, with source = lock key. Output must not change.
- `check.mjs`:
  - Drop the snapshot/manifest walk, the staged vendor-vs-manifest logic, `scanExceptions`, `historicalCacheGaps`, the snapshot link special case, the `official/CHANGES.md` and `launchd` scan entries.
  - Scan `official/catalogs/` as vendor (`clients:false`).
  - Run `officialProblems` on both the staged and disk views.
  - Keep the 1 MiB official file guard.
  - Warn on leftover untracked `official/` files.
- `maintenance.mjs`:
  - Delete `runMaintenance`.
  - `maintenanceStatus` drops schedule/collection, `referenceBackend` and `maintenance.json`.
  - **Errors:** publication only (a stale active run, or a failed outcome).
  - **Warnings:** no publication yet, or stale guidance.
  - **Reports:** per-source revision and catalog age, the link summary (data only), and the weekly workflow URL.
  - Keep `mergedBrainPR` and `recordPublication`.
- `inbox.mjs`: delete `propose`, `apply` and `recoverProposal`, plus their imports. Keep `resolve` → `mergedBrainPR`.
- `core.mjs`:
  - delete `object()`;
  - add `gitBlob`;
  - remove the `args()` bool flags `recommended`, `copy`, `force`, `json`, `seed`, `dry-run`.
- `privacy.mjs`: `assertClean` loses `exceptions`.
- `brain.mjs`:
  - remove from the help text, the allowed flags, the `mutating` expression and the dispatch: `inbox propose/apply`, `maintenance run`, `official recatalog/rollback/restore`, `--seed`, `scheduled-run` and the `recoverProposal()` call;
  - `official check` returns `checkOfficial()`.
- `scripts/setup.mjs`: remove `--launch-agent`. The lock default becomes v2.
- `scripts/hosted/setup.mjs`:
  - its profile becomes only `{clientTerms:[], clientAliases:[], toolchain:{gh, gitleaks, gitleaksVersion, gitleaksBinarySha256}}`;
  - it no longer sets `allowUnavailableHistoricalCache`, and stops writing `hosted-toolchain.json`;
  - it chmods only `.state` and `.state/previous`.
- `brain.config.json`: drop `official.*`, `maintenance.referenceBackend`/`overdueHours`, `toolchain.node`/`tar`.
- `official/sources.json` (schemaVersion 2):
  - drop `seed*`, `scanExceptions`, `licenseFile`, `licensePath`, `filename`, `mappings`, `refresh`, the LICENSE path rules, and dead `catalogOnly`/`url` keys on collections;
  - reword the react pointer reason (it's no longer mirrored).
- `.gitignore`: delete the `brain:large` block and the `.large-files` line.

**Deleted:**
- `.github/workflows/brain-maintenance.yml` and `brain-maintenance-watch.yml`;
- `.github/codex/`;
- `scripts/hosted/maintenance.mjs` and `inspect.mjs`;
- `scripts/lib/schedule.mjs`;
- `launchd/`;
- `official/snapshots/`, `official/manifests/` and `official/CHANGES.md`.

## Weekly workflow

**`.github/workflows/brain-weekly.yml`**
- **Trigger:** cron `23 8 * * 1` (Monday 08:23 UTC, with no `timezone:` key) plus `workflow_dispatch`.
- **Permissions:** `contents: read`, `issues: write`, `actions: read`.
- **Guard:** the repository is JFusco/brain and the ref is main.
- **Steps:**
  1. checkout without persisted credentials;
  2. Node 24.14.0;
  3. a github-script step finds the previous run's `brain-link-state-N` artifact (port of the old steps at `brain-maintenance.yml:45-65`) and downloads it to `.state/previous`;
  4. `node scripts/hosted/setup.mjs`;
  5. `node scripts/hosted/weekly.mjs` with `GH_TOKEN=github.token`;
  6. always upload `.state/link-health.json` and `.state/official-runs.json` as `brain-link-state-${run_attempt}`, with 90-day retention.

**`scripts/hosted/weekly.mjs`** (new, dense style)
- **Guard:** the same trusted-run guard as the old hosted script (repository, ref, numeric run ID, event).
- **Restore** the previous state, ported from the old `stateLoad`:
  - size and symlink bounds, and `assertClean`;
  - link record keys must equal `sha(url)`, with a known state and allowed hosts; invalid records are dropped, and only structural damage throws;
  - only registered `official-runs` ids are kept.
- **Under `withLock`:**
  1. `sync()`, which writes only to the working tree;
  2. `staleGuidance` filtered to `source-changed` notes;
  3. `checkLinks({limit:100})` plus website pointers (24);
  4. `check()`.
- **Issue:** marker `<!-- brain-weekly-reference-health -->`, title `[Task] Brain weekly reference health`, label `documentation` (verified to exist). Sections:
  - Summary;
  - Catalog changes (`id old→new`);
  - Notes citing changed sources;
  - Source refresh failures;
  - Link warnings (capped at 50, with pool coverage);
  - Check failures;
  - Expected outcome: run `official sync` + `check` on an issue branch, and open a catalog-refresh PR, which auto-merges; registry fixes stop at the PR;
  - Fingerprint.
- **Fingerprint:** no timestamps, counts or run IDs.
- **Upsert through the `gh` CLI**, following the `healthIssue()` pattern (old `maintenance.mjs:87-97`):
  - same fingerprint → no-op;
  - new fingerprint → edit or create, then read back;
  - no findings → close with a comment, then read back.
- **Output:** a step summary. The job fails only on controller errors.

## Migration (scratchpad script, not committed)

**Baseline first**, on a pristine tree after `hosted/setup.mjs` + `official restore contentful-skills optimizely-sdk` + a passing `check`. Save:
- `lock.v1.json`;
- `lookupEntries()` for every domain (baseline 5,794 entries);
- `skills suggest` on two scratch projects: React 19 + Next 16 + Tailwind 4, and one with Sitecore, Contentstack, Contentful and Optimizely dependencies;
- `curation stale --limit 100`;
- about 5 `lookup` queries;
- sizes.

**Then, in commit 6,** `migrate-catalogs.mjs` builds each catalog with `buildCatalog` from the hash-verified active snapshot bytes:
- **Repository sources:**
  - `files` filtered by the new paths;
  - cached non-text files (contentful `main.js`, the optimizely PNG) replaced by empty buffers;
  - asserts that the derived skills (minus the new fields) and `referenceIssues` deep-equal lock v1.
- **Collections and catalogOnly sources:** PAGES.json pages, asserting `pageDigest === revision` for collections.
- **url sources:** `llms.txt`, asserting `sha === revision`.
- **Every catalog:** `assertClean` (stop on any hit), then write the catalog and the lock v2 entry, keeping `revision`, `fetchedAt` and `track`.

## Commits

Each commit is built sequentially so `check --staged` passes on every one. Subjects are 50 characters or fewer.

1. `ci(maintenance)!: remove hosted maintenance jobs`: the two workflows, `.github/codex/`, `hosted/maintenance.mjs` and `inspect.mjs`.
2. `refactor(inbox)!: remove registry proposals`: `inbox.mjs` and `brain.mjs`.
3. `feat(maintenance)!: remove LaunchAgent schedule`: `launchd/`, `schedule.mjs`, `setup.mjs`, `brain.mjs`, the `maintenance.mjs` status rewrite, `check.mjs`, config.
4. `feat(official)!: remove nextjs-docs source`, using the old code: registry, lock key, manifests and snapshots, `.gitignore` lines, `curation hubs`.
5. `feat(official)!: drop superseded snapshots`: the 16 remaining old revisions and manifests, lock `history`, `.gitignore` lines, `rollback`.
6. `feat(official)!: replace snapshots with catalogs`, the atomic switch:
   - all reader and writer code;
   - lock v2 and 14 catalogs;
   - `git rm` of snapshots, manifests and `CHANGES.md`;
   - the `.gitignore` block;
   - the Sitecore registry restructure and the react pointer reason;
   - `curation hubs`;
   - `knowledge/nextjs/version-matched-docs.md:27` → `https://nextjs.org/docs/llms.txt`.
7. `refactor(official)!: drop vendor-body policies`:
   - registry v2 cleanup and strict keys;
   - `privacy.mjs` exceptions;
   - the `args()` flags;
   - config.

   `git diff official/catalogs knowledge` must stay empty after `curation hubs`.
8. `ci(maintenance): add weekly reference health run`: workflow, `weekly.mjs`, `hosted/setup.mjs`, and the status URL.
9. `docs(brain): describe link-catalog references`:
   - **README:** L5, L99, L101–143, L152, L158, L166–201, L213.
   - **AGENTS.md:**
     - L5;
     - "Official references and maintenance". Keep: never execute downloads; quarantine unknown origin; a redirect or hash is not evidence; registry changes go through issue-linked PRs.
     - Step 7, re-scoped per decision 8.
   - **STATUS.md:** a Phase 3 bullet, plus L16 and L29.
   - **`knowledge/INDEX.md`** L32.
   - **`skills/brain/SKILL.md`** L18, wording only.
10. `docs(wiki): record simplification phase 3`:
    - `archive-plan.cjs` for this plan (`--status implemented`, with evidence and topics);
    - `wiki/journal/2026-10-1X-simplification-phase-3.md`, mirroring phase 2's shape: decisions, changes, verification, the observed 10-19 runs, limits, rollback;
    - "Historical:" lead paragraphs in `wiki/topics/hosted-maintenance.md` and `link-warning-investigation.md`;
    - a current-flow section plus historical leads in `automatic-knowledge-maintenance.md`;
    - `build-graph` + `check`.

## Verification

- `node --check` on every changed script. `brain.mjs --help` loads every module. Running `weekly.mjs` locally stops at its guard.
- **Removed commands are refused:** `scheduled-run`, `maintenance run`, `inbox propose`, `official rollback|restore|recatalog`, `--seed`.
- **`check`:** the hook passes on every commit; `check --staged`, full `check` and `official check` pass at the tip.
- **Fresh clone:** clone into the scratchpad, run `hosted/setup.mjs`, then `check`. It must pass with no restore and no warnings. `lookup` and `skills suggest` must also work there.
- **Parity:**
  - In a scratch clone, set the 8 repository sources to `track: pinned` at the lock revisions. `official sync` must reproduce the catalogs byte-for-byte.
  - Trees-API `gitBlobSha` values must match the catalogs.
  - `lookupEntries` per domain must be identical, apart from the added `fetchUrl`/`gitBlobSha` on skill and reference entries.
  - The saved `lookup` queries, `skills suggest` (both projects) and `curation stale` must be identical.
- **`lookup --fetch`:** one skill, one repo doc and one catalog page each return an excerpt with a `contentSha256` receipt.
- **Links:**
  - `links check --source sitecore-content-sdk|optimizely-sdk|vercel-plugin --limit 10`;
  - probe each hub catalog origin;
  - the pool size equals the baseline.
- **Stale simulation:** in the scratch clone, change `react-docs`' lock revision.
  - `curation stale` must flag both react notes with `source-changed`.
  - `check` must report the mismatch.
  - With a `gh` stub and fake `GITHUB_*` variables, `weekly.mjs` must create, no-op, edit and close the issue correctly.
- **Wiki:** `build-graph.cjs` and `check.cjs` pass.
- **Size:** measure `official/` and total tracked files and bytes before and after. Expected: 1,544 → about 16 files, and 23.5 MB → about 1.4 MB.
- **`maintenance status`** exits 0 in a clean profile.
- **After Joe merges:**
  - dispatch `brain-weekly.yml` twice; the second run must find the artifact and leave the issue unchanged;
  - confirm the old schedules stopped;
  - tell Joe that `OPENAI_API_KEY` and `BOT_TOKEN` are unused and can be deleted.

## Delivery

- **Base:** `main` is already pulled (`7f5f550`). Create one issue with labels `documentation` and `enhancement` via the GitHub MCP, and read it back.
- **Branch:** the session-designated `claude/magical-einstein-kdv7nw`, which the harness requires.
  - This departs from AGENTS.md's `codex/<n>-<slug>` naming; the PR will note it.
  - If Joe prefers `codex/<n>-simplify-phase-3`, he says so on approval and I push there instead.
- **Setup:** Node 24.14.0 via nvm, first on `PATH`, plus `git config core.hooksPath .githooks`.
- **PR:**
  - conventional title;
  - problem, behavior, verification outcomes, risk and rollback;
  - "On your Mac" steps: the #55 follow-ups, `launchctl bootout gui/$(id -u)/com.joefusco.brain` + `rm ~/Library/LaunchAgents/com.joefusco.brain.plist`, `rm -rf official/snapshots official/manifests`, confirming no `.state/proposal-transaction.json` exists, optional `.state` cleanup, and reviewing the curator prompt for removed commands;
  - unused secrets;
  - `Closes #<n>`.
- **Read the PR back, then stop.** Joe merges.
- **Check-in:** use `send_later` for about 08:30 UTC on 2026-10-19 to list the `brain-maintenance.yml` and watch runs and record what they did, including whether the `timezone:` key fired. Add this to the journal and PR (a follow-up docs commit if the PR is already open).
- **Conflicts:** if that run merges a refresh into `main` first, rebuild commits 4–6 on the new `main` by re-running the scripted steps rather than hand-resolving the data.
- **PR watch:** offer to subscribe to PR activity.

## Risks

- **Mac leftovers.** The LaunchAgent keeps calling the removed `scheduled-run` until it's unloaded. The ignored snapshot files become untracked until they're deleted; `check` warns and the staged guard blocks staging them.
- **Old link state isn't carried over.** The first weekly run starts fresh, so a 404 needs two weekly observations before it counts as dead.
- **The issue will often be open.** Rolling sources (vercel-docs, contentstack-docs) change most weeks, by design.
- **Size limits and scanning.** contentstack-docs is about 594 KB; over 1 MiB, its sync fails visibly rather than breaking commits. Catalogs have no scan exceptions any more, so the migration stops on any hit.
- **Tarball blob shas** could diverge (export-subst, EOL, LFS). The trees-API parity check catches this; the fallback is trees-API shas.
- **Git history still holds the 23 MB.** No history rewrite is proposed.
