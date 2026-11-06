---
title: "Tune CI caches without weakening required gates"
format: "playbook"
domain: "tooling"
aliases: ["pull request cache scope", "Playwright browser cache", "CI aggregate gate"]
evidence_date: "2026-11-06"
reviewed_at: "2026-11-06"
applicability: "GitHub Actions pull-request gates, with optional Next.js and Playwright branches; verify runner allocation, channels and project authorization"
provenance: "playwright-docs@2b872424e6169ff0fd683c0180343963f96230188d530e2b5be4706daaa9829c; nextjs-index@41ead42cac3a04c79525ecdf1b47217d208f1f75f99d2caad02f331a3b7ca45f; official GitHub Actions, Next.js and Playwright pages read 2026-11-06; optimization procedure proposed, no workflow changed"
status: "current"
versions: []
---

# Tune CI caches without weakening required gates

## When to use this

Use when a pull-request quality gate repeatedly misses caches or spends time on irrelevant work. First inspect its triggers, changed-path classifier, required-check contract and actual logs.

## What to do

1. **Documented:** [GitHub caches saved by a pull-request run belong to its merge ref](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching#restrictions-for-accessing-a-cache); other PRs and the base branch cannot restore them. PRs may restore default/base-branch caches. **Proposed:** consider an authorized main-branch cache-seeding job if repeated cold runs justify its cost. A first PR run can already hit a usable main cache; do not assume an inevitable miss. Keep secrets outside cached paths.
2. **Proposed:** classify generated documentation data by its actual consumers before treating it as documentation-only. A graph consumed by runtime may still need executable checks. Run independent build/typecheck and test jobs concurrently where resources permit, and keep a required aggregate check that fails on every required dependency's failure or unexpected skip. Gate-policy changes require their own authorization.
3. **Documented:** [Playwright discourages browser caching](https://playwright.dev/docs/ci#caching-browsers) when restore costs match downloads; Linux system dependencies still need installation. If measurements justify caching binaries, key them by the Playwright version and relevant platform. Its [browser guide](https://playwright.dev/docs/browsers#chromium-headless-shell) permits `--only-shell` only for headless-shell use without a specified channel. A `chromium` channel uses a different headless mode. **Proposed:** install only the browser surface the tests actually exercise, using the project's package manager.
4. **Documented:** [Next.js persists build information in `.next/cache`](https://nextjs.org/docs/app/guides/ci-build-caching); CI must preserve it to reuse it. [setup-node](https://github.com/actions/setup-node) supports explicit `cache: pnpm`, with pnpm already installed; [pnpm/action-setup](https://github.com/pnpm/action-setup) can read the project's packageManager pin. Check the selected action version and avoid assuming manager setup installs application dependencies. **Proposed:** inspect cache keys, restore logs and measured build savings separately from dependency/browser caches; a cache hit is not a test pass.
5. **Documented:** GitHub's [current runner table](https://docs.github.com/en/actions/reference/runners/github-hosted-runners#standard-github-hosted-runners-for-private-repositories) lists standard private-repository x64 Ubuntu runners at two CPUs and 8 GB. Other labels/plans differ. **Proposed:** record the actual allocation and explicit test limit; Node's [default concurrency](node-test-performance.md) is not simply the CPU count.

## Evidence and limits

No workflow, cache, browser install or runner setting changed. Historical run counts, mirror delays, cache wins and estimated build savings are deliberately omitted as general results. This procedure does not authorize disabling Brain's protections or dispatching retired maintenance Actions.
