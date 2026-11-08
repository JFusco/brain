---
title: "Choose first-party dependency update automation"
format: "playbook"
domain: "tooling"
aliases: ["Dependabot", "Renovate", "exact package pins", "release dispatch", "shared dependency preset"]
evidence_date: "2026-11-03"
reviewed_at: "2026-11-03"
applicability: "Proposed adoption workflow for GitHub npm/pnpm consumers with exact first-party pins; confirm current manager support, registry access and repository authorization"
provenance: "Official GitHub Dependabot options, Actions events and dispatch API, Renovate configuration/presets, regex manager and action documentation read 2026-11-03; no bot or release workflow executed"
status: "current"
versions: []
---

# Choose first-party dependency update automation

## When to use this

Use when separately published team packages leave consuming repositories with old exact pins. Choose the update mechanism by acceptable delay, fleet size and operating cost. This note authorizes no installation, credentials, workflow change or dependency delivery.

## What to do

1. **Proposed selection:** prefer GitHub-native Dependabot for a small repository set when scheduled detection meets the need. Consider self-hosted Renovate when a fleet needs shared rules or a release-triggered runner. A target of minutes requires measurement; neither choice establishes a latency guarantee. Confirm private-registry access separately.
2. **Documented:** GitHub's [Dependabot options](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference) use the `npm` ecosystem for pnpm. `allow` selects dependency names; `ignore` wins on overlap. `schedule.interval: cron` requires `cronjob`, with `timezone` specified separately. Version updates have a default three-day cooldown; `cooldown.exclude` overrides `include`. `increase` raises a requirement's lower bound, rather than converting arbitrary ranges to exact pins. **Proposed:** allow only intended first-party names, explicitly choose their cooldown, retain an existing exact pin, and omit grouping when each package needs independent review. Recheck the supported-manager table for the consuming release; the reviewed table lists pnpm 10, 11 and 12.
3. **Documented:** Renovate [package rules and range strategy](https://docs.renovatebot.com/configuration-options/#rangestrategy) support `rangeStrategy: pin`. Its [shared presets](https://docs.renovatebot.com/config-presets/) distribute configuration through `extends`. **Proposed:** explicitly disable unrelated updates as well as matching the intended names; a positive package rule alone is not an allowlist. Keep exact-pin policy in a reviewed shared preset when fleet consistency matters.
4. **Proposed release handoff:** after the package is available from its registry, have an authorized publishing workflow notify the intended Renovate runner, centrally or per consumer. Keep a scheduled fallback and an explicit manual entry point where authorized. **Documented:** GitHub's [dispatch event](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#repository_dispatch) requires the receiving workflow on the default branch; `GITHUB_TOKEN` can trigger dispatch events, but does not thereby gain another repository's permissions. The [REST contract](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event) requires classic-token `repo` scope or supported fine-grained credentials with Contents write, and limits `client_payload` to ten top-level properties and less than 64 KB. These are design constraints, not permission to dispatch.
5. **Documented:** the [Renovate action](https://github.com/renovatebot/github-action) supports GitHub App and personal access tokens. Its `GITHUB_TOKEN` path requires approval for workflows on resulting PRs. **Proposed:** choose the least authority that supports the intended repositories and actual checks; verify the connected PR path before claiming unattended operation. Never put credentials in shared presets.
6. **Proposed version-copy audit:** inspect scaffold templates, documentation and skill files for additional version literals. Prefer deriving a generated pin from the installed package metadata when that is its intended contract, and verify generated output against that version. Otherwise Renovate's [regex manager](https://docs.renovatebot.com/modules/manager/regex/) can cover files outside built-in extraction: configure `managerFilePatterns`, `matchStrings`, a `currentValue` or `currentDigest` capture, dependency identity and datasource, such as `datasourceTemplate: npm`. It uses RE2, whose syntax excludes lookahead and backreferences. Verify every intended occurrence rather than assuming an ordinary manifest update finds arbitrary copies.
7. **Proposed acceptance:** require the first real update PR, correct manifest/lockfile changes, unchanged unrelated dependencies and passing repository gates. Check [bot PR compatibility](bot-pr-contracts.md) before enabling delivery. A valid configuration or a successful runner invocation alone does not prove detection, checks or release-to-PR latency.

## Evidence and limits

Supporting mechanisms were checked in official documentation. The selection, dispatch topology, allowlist composition and version-copy workflow remain proposed practices. No bot was installed, package published, dispatch sent or consuming repository changed. Historical drift counts and reported integration success are not reproduced evidence. An old community report about pnpm support cannot override the current official support table; actual lockfile handling still needs the adopting repository's verification.

## Opt a repository into an additional package

**Documented, checked November 8, 2026:** Renovate evaluates every matching [package rule](https://docs.renovatebot.com/configuration-options/#packagerules); later values can override earlier values for the same option. [`matchFileNames`](https://docs.renovatebot.com/configuration-options/#packagerulesmatchfilenames) checks package and lockfile paths. A root `package.json` match differs from `**/package.json`.

**Proposed for a deny-by-default shared preset:** when repository policy permits an exception, add a local rule with the exact package name, intended manifest path and `enabled: true`. Keep the shared first-party allowlist unchanged. Confirm the final merged configuration and use a read-only lookup dry run before relying on the override; a later rule or disabled manager can still prevent the intended result. Preserve exact pins where required and test generated artifacts affected by that dependency.

Updates still depend on runner execution and configured scheduling. A first-party publisher's dispatch does not establish a third-party notification path or immediate detection. The captured preset behavior and proposed opt-in were not reproduced. This guidance authorizes no bot activation, dispatch, security-update suppression or alternate merge path; the consuming repository's merge owner and gates remain authoritative.
