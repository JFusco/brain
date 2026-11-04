---
title: "Verify Storybook browser gates and capture evidence"
format: "playbook"
domain: "tooling"
aliases: ["Vitest Playwright provider", "missing Chromium binary", "no tests", "Storybook accessibility gate"]
evidence_date: "2026-11-04"
reviewed_at: "2026-11-04"
applicability: "Storybook 10.6 documentation with its Vitest addon and a supported framework; confirm installed addon, Vitest, Playwright and browser versions; procedures below are proposed"
provenance: "storybook-docs@c735625fe57a09cd61ddc13f2b80d4d8f548b9e8bacd52ca415aed3e1fd2ee42; vitest-docs@f5554913ca300523eac30b71ecb8f99bcdf27a6508abf8ca212be9026711ae90; playwright-docs@2b872424e6169ff0fd683c0180343963f96230188d530e2b5be4706daaa9829c; official pages read 2026-11-04; no browser suite rerun"
status: "current"
versions: []
---

# Verify Storybook browser gates and capture evidence

## When to use this

Use when a component library runs Storybook stories through Vitest Browser Mode and needs separate screenshot evidence. A shared browser engine can reduce tooling duplication, but it does not make test execution, visual review and accessibility acceptance equivalent.

## What to do

1. **Documented:** the [Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon) transforms included stories into browser tests for rendering and play-function behavior; it does not need a running static Storybook. Confirm framework/version support and the selected stories. [Vitest's Playwright provider](https://vitest.dev/config/browser/playwright) uses `@vitest/browser-playwright` and `provider: playwright()`. **Proposed:** record the actual configuration and tested story set rather than asserting every story ran.
2. **Documented:** each [Playwright release needs matching browser binaries](https://playwright.dev/docs/browsers). **Proposed:** in a pnpm application, run `pnpm exec playwright install chromium` from the application that owns the dependency, including after upgrades when needed. Verify cache/environment selection rather than assuming a newer cached browser satisfies an older package. Do not infer a supported package matrix from historical incidental versions.
3. **Documented:** Playwright distinguishes full Chromium and its headless shell. Vitest documents `launchOptions.channel: 'chromium'` for the newer full-browser headless mode and `test.browser.headless` for headless selection. **Proposed:** record the selected mode when diagnosing motion, hover or focus differences. A mode switch is a diagnostic candidate, not a proven fix for every animation or dialog failure.
4. **Proposed gate:** require the intended tests to execute, inspect launch errors and preserve the process exit status. Collected files or a pass-count grep do not prove execution. Vitest defaults [passWithNoTests](https://vitest.dev/config/passwithnotests) and [dangerouslyIgnoreUnhandledErrors](https://vitest.dev/config/dangerouslyignoreunhandlederrors) to `false`; do not enable them to hide a broken browser gate. A private missing-binary report described zero executed tests, but no universal successful-exit behavior is established.
5. **Documented:** [Storybook accessibility tests](https://storybook.js.org/docs/writing-tests/accessibility-testing) require `parameters.a11y.test: 'error'` to produce CI failures; `'todo'` does not fail CI. **Proposed:** preserve required rules and the project's WCAG target, including the applicable WCAG 2.2 AA checks where required, instead of disabling them to pass. Record the effective axe configuration. [Automated accessibility checks](https://playwright.dev/docs/accessibility-testing) cannot detect every WCAG violation; a passing scan is not conformance proof. For forced visual states versus real interaction, reuse [hover capture guidance](../design-systems/hover-capture-method.md).
6. **Proposed screenshot procedure:** serve one immutable [static Storybook build](https://storybook.js.org/docs/sharing/publish-storybook) for both human review and Playwright library captures, separate from the Vitest runner. Verify the server's ownership, port and artifact before visiting `iframe.html?id=<story-id>&viewMode=story`. Assert required UI, fonts/images and settled state before capture; Playwright [discourages `networkidle` for test readiness](https://playwright.dev/docs/api/class-page#page-goto). Use project-relevant viewports, retain story/build/viewport identity, and reconcile expected versus written screenshots so a port collision or zero-output run cannot look complete.

## Evidence and limits

No browser installation, test suite, screenshot capture or CI image was exercised. Historical suite counts, viewport timings and successful repair claims are omitted as incident evidence. Firefox/WebKit, sharding, cache environment overrides and Playwright Test as an alternative story runner require separate validation. Screenshots support visual review; they neither establish behavioral assertions nor replace a visual-regression service's comparison contract.
