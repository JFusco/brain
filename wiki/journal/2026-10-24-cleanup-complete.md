---
title: "Complete the layered code cleanup"
date: "2026-10-24"
topics: [code-quality]
plans: [2026-10-23-brain-cleanup-layered-architecture-focused-tests-quality-gate-430c2a75f3.md]
---

# Complete the layered code cleanup

[Issue 171](https://github.com/JFusco/brain/issues/171) closes the cleanup plan, archived as [Brain cleanup: layered architecture, focused tests, quality gate](../plans/2026-10-23-brain-cleanup-layered-architecture-focused-tests-quality-gate-430c2a75f3.md). Joe authorized commit, push, merge and branch cleanup for each phase.

Delivered:
1. Quality tooling, hooks, the Quality and Commit message lint checks, focused tests and the npm-to-pnpm migration ([PR 142](https://github.com/JFusco/brain/pull/142)).
2. `pnpm start` and a plain-language README ([PR 144](https://github.com/JFusco/brain/pull/144)), then a Prettier-only reformat ([PR 146](https://github.com/JFusco/brain/pull/146)).
3. The `scripts/lib` split into leaf, branch and tree, including the lock fixes, across [PR 148](https://github.com/JFusco/brain/pull/148), [PR 150](https://github.com/JFusco/brain/pull/150), [PR 152](https://github.com/JFusco/brain/pull/152), [PR 154](https://github.com/JFusco/brain/pull/154), [PR 156](https://github.com/JFusco/brain/pull/156) and [PR 158](https://github.com/JFusco/brain/pull/158).
4. Thin roots with a table-driven CLI ([PR 160](https://github.com/JFusco/brain/pull/160)) and a pinned command contract ([PR 168](https://github.com/JFusco/brain/pull/168)).
5. The layered viewer and a blocking architecture check ([PR 170](https://github.com/JFusco/brain/pull/170)).

Deviations from the plan:
- The plan assumed npm; Joe chose pnpm, so the migration joined phase 1 and the root `.npmrc` keeps `node-linker=hoisted` for the `noSymlinks` guards.
- The architecture check enforces layer direction, cycles and the 200-line cap. The planned rule restricting which leaf or branch files a root may import was not added.
- Module names follow the code as it was split rather than the plan's provisional map.
- Beyond the planned before-and-after command diffs, refactor phases used replays where applicable: read-only commands, the nightly gate, link checks, the viewer HTTP API and, for the viewer, a headless browser walkthrough. Each phase journal records which ran.

Making Quality and Commit message lint required checks in branch protection remains a separate decision for Joe.
