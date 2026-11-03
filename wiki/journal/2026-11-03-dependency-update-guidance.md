---
title: "Dependency update and bot contract guidance"
date: "2026-11-03"
topics: [automatic-knowledge-maintenance]
plans: [2026-11-03-dependency-update-and-bot-contract-guidance-2618cea402.md]
---

# Dependency update and bot contract guidance

Issue [312](https://github.com/JFusco/brain/issues/312) follows the approved reference refresh in [PR 311](https://github.com/JFusco/brain/pull/311). Stale guidance was listed before two pending tooling captures were individually reviewed and compared with existing notes. Original bodies and claim-level coverage remain private.

## Guidance

- [First-party dependency updates](../../knowledge/tooling/first-party-dependency-updates.md) separates native scheduled detection, self-hosted/shared Renovate selection, exact-pin and cooldown policy, release dispatch permissions and secondary version copies. The adoption workflow is proposed; current official support supersedes an old community pnpm limitation.
- [Bot PR contracts](../../knowledge/tooling/bot-pr-contracts.md) separates commitlint subject/header limits, message/body customization and explicitly authorized exception decisions. Branch prefixes are not verified bot identity. No exemption or workflow change is applied.
- [Claude model selection](../../knowledge/tooling/claude-model-selection.md) is revalidated against the live overview, selection guide and Opus prompting guide. Documented default effort now appears alongside each model; dated vendor positioning remains distinct from measured performance.

## Evidence and limits

Official GitHub, Renovate, commitlint and Claude pages support the documented mechanisms. Selection, version-copy handling, trigger topology and rendered-PR preflight remain proposed practices. No package release, updater installation, dispatch, consumer change, workflow exemption or model benchmark was performed. Incident-specific counts, reported completion claims and incidental project versions were deliberately omitted rather than recast as new evidence.

Other stale notes retain their signals. Publication requires a fresh separate content reviewer on the exact committed diff, successful preparation and exact-head hosted checks, guarded merge and final main verification/completion before accepting covered captures. The plan archive records authoring work; it does not assert that these later gates have already succeeded.
