---
title: "Discover and capture hidden UI states with guards"
format: "playbook"
domain: "tooling"
aliases: ["observed click reveal", "hidden panels", "trial click", "animation settling", "fixed overlay crop"]
evidence_date: "2026-11-01"
reviewed_at: "2026-11-01"
applicability: "Proposed opt-in browser capture on explicitly authorized targets; Playwright and browser versions must be confirmed; network interception is not a no-side-effect guarantee"
provenance: "playwright-docs@2b872424e6169ff0fd683c0180343963f96230188d530e2b5be4706daaa9829c; mdn-web-docs@7fe88bb4d579b6c9d95b3e3fd270b355ffed1e3fde631f4d63f2050c334283b7; official Browsertrix, ZAP, BackstopJS, Bootstrap, MDN and Playwright pages read 2026-11-01; sanitized proposals, no reproduced capture run"
status: "current"
versions: []
---

# Discover and capture hidden UI states with guards

## When to use this

Use when screenshotting menus or panels across authorized pages where hand-written interaction scripts are impractical. Prefer explicit scenarios when controls are known. This is proposed capture practice, not permission to click arbitrary production controls.

## What to do

### Prefer declared relationships

**Proposed:** follow valid same-document targets first: `aria-controls`, `popovertarget` and `commandfor`, interpreted using the control's actual semantics. See [disclosure relationships](../accessibility/disclosure-control-targets.md). For Bootstrap collapse, the [5.3 documentation](https://getbootstrap.com/docs/5.3/components/collapse/) uses `data-bs-target`; the [4.6 documentation](https://getbootstrap.com/docs/4.6/components/collapse/) uses `data-target`. Treat those as version-specific collapse selectors, not universal dropdown bindings. A discovered selector is a candidate, not proof that the control reveals it.

**Documented alternatives:** [BackstopJS](https://github.com/garris/BackstopJS) provides scenario click/hover selectors. [Browsertrix Autoclick](https://crawler.docs.browsertrix.com/user-guide/behaviors/) attempts clicks while avoiding navigation and is disabled by default. [ZAP's AJAX Spider](https://www.zaproxy.org/docs/desktop/addons/ajax-spider/options/) defaults to clicking anchors, buttons and inputs. These tools establish mechanisms, not the safety of this proposed procedure.

### Bound observed clicks and restoration

**Proposed:** enable exploratory clicks only for an authorized capture target. Limit candidates and attempts; skip forms, submit controls and links to other documents. Install request refusal before probing, detect URL changes and stop on navigation. Network refusal reduces outbound effects but cannot undo local storage changes, existing connections or arbitrary JavaScript side effects. Use a disposable capture context where appropriate.

Record a panel only when it changes from hidden to visible after the selected control's click. Record whether the association was declared or observed, plus the control and panel identities. Require the same control to hide it again; if restoration fails, record the unresolved state and stop further reveals on that page. A hidden panel does not prove all effects were reversed. Hover-only discovery needs a separate [pointer capture method](../design-systems/hover-capture-method.md).

### Separate actionability, settling and framing

**Documented:** [Playwright click](https://playwright.dev/docs/api/class-locator#locator-click) supports `trial: true`, which performs actionability checks and skips the click; keyboard modifiers can still be pressed. Its [actionability guide](https://playwright.dev/docs/actionability) checks visibility, stability, event reception and enabled state. **Proposed:** use a bounded trial without modifiers before probing. A trial failure means the click action was skipped; a later ordinary click timeout still needs dispatch reconciliation. A successful trial does not guarantee the next click or panel animation will succeed.

**Documented:** [`document.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/getAnimations) returns Animation objects, including CSS animations/transitions and Web Animations. **Proposed:** do not treat an empty list as universal visual stability. For script-written inline changes, also sample the panel and descendants' computed opacity/transform across spaced checks, under a hard time cap (for example three seconds). Stable samples are a bounded heuristic, not proof that all animation or async content has finished.

**Documented:** [Playwright page screenshots](https://playwright.dev/docs/api/class-page#page-screenshot) support a clipping rectangle. **Proposed:** when a fixed overlay extends beyond the viewport, intersect its visible bounds with the viewport and capture that region. Preserve coordinate conversion, viewport and clipping metadata; do not label the crop as a complete panel capture.

## Evidence and limits

The official pages were checked; no fixture, real-site recapture or cross-browser screenshot was run here. Private reports of improved reveal counts, covered buttons, staggered fades and fixed-overlay crops are not independently verified results. No universal fixed-element stitching behavior is asserted. The procedure reduces accidental interactions and ambiguous screenshots but cannot guarantee reversible clicks, exhaustive discovery or accessibility acceptance. Use [evidence matched to the claim](../frontend/match-evidence-to-claim.md).
