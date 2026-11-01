---
title: "Connect disclosure controls to their panels"
format: "playbook"
domain: "accessibility"
aliases: ["aria-controls", "aria-expanded", "popovertarget", "commandfor"]
evidence_date: "2026-11-01"
reviewed_at: "2026-11-01"
applicability: "Disclosure navigation, popovers and dialogs; check native attribute support and assistive technology behavior in the target browsers"
provenance: "w3c-accessibility@c2c7fa790e32156b38b445e98c5dbe7b96dccda9030b876ca7100d2c0874d6c8; mdn-web-docs@7fe88bb4d579b6c9d95b3e3fd270b355ffed1e3fde631f4d63f2050c334283b7; official APG and MDN button pages read 2026-11-01; proposed implementation practice, no browser acceptance"
status: "current"
versions: []
---

# Connect disclosure controls to their panels

## When to use this

Use when a button reveals navigation, an accordion panel, a popover or a dialog. A useful label names the action, but a label alone does not identify the controlled element or its current state.

## What to do

1. **Documented:** the [APG disclosure navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) binds buttons to containers with `aria-controls` and reflects visibility with `aria-expanded`. **Proposed:** keep IDs valid and expanded state synchronized on every open and close path. Typical navigation links do not need a `menu` role merely because the UI is called a menu.
2. **Documented:** the [HTML button reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button) describes `popovertarget` as a native ID relationship that supplies implicit expanded/details semantics. It also describes `commandfor` with `command`, including dialog `show-modal` and popover commands. **Proposed:** use a native binding when its behavior and support fit the target; do not add conflicting manual state over the browser's behavior.
3. **Proposed:** verify keyboard operation, focus behavior and assistive technology output for the selected pattern. A native dialog still needs its dialog-specific behavior; disclosure attributes are not a substitute. Declared relationships also give capture tools an explicit target, but do not guarantee every tool will follow it.

## Evidence and limits

The official pages were read on the evidence date. APG is illustrative guidance and calls for assistive technology testing before production use. No target browser, screen reader or capture workflow was exercised here. Native support must be checked for the actual browser set. This note does not turn a private report of missing attributes into an accessibility audit or assert that every toggle widget needs this same pattern.
