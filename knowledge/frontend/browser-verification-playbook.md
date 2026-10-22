---
title: "Prepare a focused browser verification"
domain: "frontend"
format: "playbook"
aliases: ["Playwright", "locators", "browser verification playbook"]
evidence_date: "2026-10-21"
applicability: "Consuming projects that authorize browser verification; confirm installed Playwright/browser versions and project-specific acceptance requirements"
provenance: "playwright-docs@2b872424e6169ff0fd683c0180343963f96230188d530e2b5be4706daaa9829c; mdn-web-docs@cceec17e41c46ac0d1593a34b8977148257c68f33517430b2267961b46bf2935; official pages read for this proposed workflow; no target application run"
status: "current"
versions: []
reviewed_at: "2026-10-21"
---

# Prepare a focused browser verification

## When to use this

Use this when an application task calls for a focused browser check. Follow the consuming project's test policy; this reference does not enable tests or QA agents in Brain itself.

## What to do

**Proposed practice:**

1. Name the user-visible behavior, page state and supported browsers to check. Consult the [MDN Baseline explanation](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility) for feature availability, then apply the project's actual browser targets.
2. In Playwright, prefer locators based on roles, accessible names or other user-facing attributes. Scope ambiguous matches to the relevant region or item.
3. Keep independent checks isolated. Use retrying assertions for expected visible state rather than treating a completed click as proof of the outcome.
4. Record the actual result and evidence limits using [Match UI evidence to the acceptance claim](match-evidence-to-claim.md). Keep failures and unavailable environments visible.

## Where guidance differs

**Documented decision branch:** role/name locators express user-facing behavior; explicit test IDs can supply a stable contract where that is appropriate. Neither choice repairs missing accessibility semantics. Baseline summarizes browser support and does not substitute for accessibility, usability, security or application testing. Choose evidence according to the claim being made.

## Evidence and limits

The official [Playwright best practices](https://playwright.dev/docs/best-practices) and [locator documentation](https://playwright.dev/docs/locators) support the locator, isolation and assertion guidance. MDN supports the browser-availability boundary. This is a proposed preparation sequence, without a new browser test suite or target-application run. Rolling documentation does not prove compatibility with installed runner versions.
