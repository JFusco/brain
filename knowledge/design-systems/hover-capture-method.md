---
title: "Choose a capture method for CSS hover states"
format: "playbook"
domain: "design-systems"
aliases: ["CSS hover", "Pseudo States", "Storybook hover", "Playwright hover"]
evidence_date: "2026-11-01"
reviewed_at: "2026-11-01"
applicability: "Storybook/Chromatic visual states and Playwright pointer automation; confirm installed tool and addon versions"
provenance: "playwright-docs@2b872424e6169ff0fd683c0180343963f96230188d530e2b5be4706daaa9829c; official Chromatic hover/focus guide and Playwright Locator reference read 2026-11-01; proposed selection procedure, no visual test executed"
status: "current"
versions: []
---

# Choose a capture method for CSS hover states

## When to use this

Use when a visual test needs hover-only menus or styles. First distinguish a JavaScript event handler from the browser's CSS `:hover` matching: exercising a handler does not by itself establish the CSS state.

## What to do

1. **Documented:** [Chromatic's guide](https://docs.chromatic.com/docs/hoverfocus/) separates JavaScript-triggered hover from CSS hover and recommends the Storybook Pseudo States addon or a mirroring CSS class for the latter. The addon emulates pseudo-classes by rewriting selectors. **Proposed:** use this for a controlled visual specimen; record that it is an emulated state, rather than proof of pointer or keyboard interaction.
2. **Documented:** [Playwright `locator.hover()`](https://playwright.dev/docs/api/class-locator#locator-hover) waits for actionability, scrolls into view and uses the page mouse over the element. **Proposed:** use the pointer API when testing actual hover behavior, then assert the intended panel/style before capturing. Dispatching a synthetic mouse event is not an equivalent CSS-state test.
3. **Proposed:** keep keyboard focus and touch behavior as separate checks. CSS emulation can show appearance without demonstrating that a user can reach or dismiss the state. Use the related [disclosure control guidance](../accessibility/disclosure-control-targets.md) for click-controlled panels.

## Evidence and limits

These are dated documentation checks, not a run of Storybook, Chromatic or Playwright. No browser/device compatibility range is established. Avoid generalizing the guide's informal “trusted event” description into a claim that CSS hover is itself a DOM event or that automation cannot activate it.
