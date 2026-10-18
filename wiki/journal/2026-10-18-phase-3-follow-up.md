---
title: "Phase 3 follow-up: weekly refresh, discovery and branch sync"
topics: ["automatic-knowledge-maintenance", "hosted-maintenance"]
plans: ["2026-10-18-brain-phase-3-follow-up-fresh-catalogs-weekly-discovery-and-new-coverage-a95db4041b.md"]
issue: 'https://github.com/jfusco/brain/issues/58'
issues: ['https://github.com/jfusco/brain/issues/58']
---

# Phase 3 follow-up

[Issue 58](https://github.com/JFusco/brain/issues/58) addresses the risks [simplification phase 3](2026-10-18-simplification-phase-3.md) left. Joe asked to keep Brain simple: it is the central place for project learnings, official documentation, and official skills and agents.

## Joe's decisions

- Routine catalog drift never opens the weekly issue.
- New official sources are looked for weekly, not monthly, because these stacks change often.
- A small manual workflow lets any session refresh or verify catalogs without the Mac.
- Leftovers on the Mac are detected and explained, never deleted automatically.
- Dropped as not worth their code:
  - a catalog-size early warning (sync already fails safely and visibly over 1 MiB);
  - skill-change alerts (the weekly refresh carries skill changes into the hubs and `skills suggest`);
  - importing the old link state.
- New coverage comes in a separate registration PR after this one: TypeScript, accessibility (WCAG 2.2, WAI-ARIA), Optimizely PaaS (CMS 13), SitecoreAI and Sitecore XP docs catalogs, and a Contentful docs catalog.

## Changes

- **`scripts/hosted/weekly.mjs`.** Catalog drift is listed in the issue body and step summary, but it is left out of the fingerprint and the close condition. Only notes citing changed sources, refresh failures, link warnings and check failures open or rewrite the issue. A close comment names any drifting sources.
- **`check`.** The unexpected-files warning names the leftover `official/` paths and the `rm -rf` command. Staged leftovers stay a blocking issue.
- **`.github/workflows/brain-sync.yml` ("Brain catalog sync").**
  - It is manual only and refuses `main`.
  - It runs `official sync [ids]` and `check` with the pinned scanner.
  - It commits only the catalogs, the lock and the hubs back to the dispatched branch with `GITHUB_TOKEN`, and refuses any other staged path.
  - It fails the run when a source failed, after committing the ones that succeeded.
  - It needs no secrets.
- **`AGENTS.md` and README.**
  - A weekly catalog-refresh PR, made locally or through the workflow.
  - A weekly coverage review against a per-area "Coverage watch list" of official places. Each finding gets its own registration PR, which stops for review.

## Verification (cloud session, 2026-10-18)

- **Weekly harness in a scratch clone**, using a stateful `gh` stub with substituted sync results:
  - drift only gave no issue;
  - a failure plus drift opened the issue;
  - the same failure with different drift was a no-op;
  - drift only closed the open issue, with a comment naming the drifting source.
- **Sync workflow shell steps, dry-run locally:**
  - an unknown source ID exits 1 and reaches the summary;
  - a catalog-only change commits exactly the catalog, the lock and the hub through the pre-commit guard;
  - an edited knowledge note is refused by the path guard.
- **Leftovers.** Full `check` names `official/CHANGES.md`, `official/manifests` and `official/snapshots` with the `rm -rf` command, and a staged leftover fails `check --staged`.
- **Not exercised yet.** The workflow can't be dispatched until it is on `main`. Its first real run is the registration PR's catalog generation.

## Limits

- The weekly coverage review is an agent rule, not automation.
- Its findings are only as good as the watch list, and new areas need a registration PR.
