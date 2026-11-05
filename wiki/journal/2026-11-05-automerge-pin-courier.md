---
title: "Automerge Pin Courier pull requests"
topics: [cms-field-vocabulary, ui-pattern-vocabulary]
issue: 'https://github.com/jfusco/brain/issues/328'
issues: ['https://github.com/jfusco/brain/issues/328']
---

# Automerge Pin Courier pull requests

[Issue 328](https://github.com/JFusco/brain/issues/328) lets Renovate merge its own first-party bump pull requests. Brain receives one Pin Courier pull request per `cms-field-vocabulary` or `ui-design-brain` release through the shared preset, but a dependency bump is neither a board-delivered PR nor one of the routine PR kinds that merge automatically under AGENTS.md step 7, so pull requests 318 to 321 waited for a hand merge on 2026-11-04.

`renovate.json` now sets `automerge: true` with `automergeType: pr` and `automergeStrategy: merge-commit`, matching how Brain merges every other pull request. `platformAutomerge` is `false` because Brain has no branch protection, so GitHub's native auto-merge never engages; Renovate instead merges the pull request on its next runner run once the checks on its head have passed, and never while a check is failing or pending. The next run arrives with the next release dispatch or the six-hour schedule, so a merge can trail green checks by a few hours. GitHub auto-merge with a protected `main` was ruled out for now because it changes repository settings that the Office harness also works under. AGENTS.md step 7 records the new merge path.

Local checks cover the configuration and the wiki gate; the connected proof is the next first-party release merging without a human.
