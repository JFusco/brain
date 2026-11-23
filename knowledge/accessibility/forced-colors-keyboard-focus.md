---
title: "Verify keyboard focus in forced-color palettes"
format: "playbook"
domain: "accessibility"
aliases: ["forced colors", "high contrast focus", "shadow focus ring"]
evidence_date: "2026-11-23"
applicability: "Web controls in browsers with forced-colors active; proposed component and design-system checks"
provenance: "mdn-web-docs@c31269996a5ae2344b9ddd781bb21fc1e43874fdf7003324b6d95c99b96cfa25; MDN and CSS Color Adjustment primary references reviewed 2026-11-23; sanitized verification proposal"
status: "current"
versions: []
reviewed_at: "2026-11-23"
---

# Verify keyboard focus in forced-color palettes

## When to use this

Use this when a component or design system supplies custom keyboard-focus styling, especially a shadow-based ring that looks clear in ordinary themes.

## What to do

**Proposed practice:**

1. Activate a user forced-color palette and tab to each control. Compare its focused and unfocused appearance; record the browser, operating system and palette used.
2. If the focus cue disappears, preserve usable native focus styling or add an outline or border that remains visible after palette substitution. Check the control against adjoining surfaces, not only in an isolated component preview.
3. Recheck focus after the change and retain visual interaction evidence alongside automated accessibility results. Do not treat a normal-theme screenshot as forced-colors evidence.
4. Prefer targeted repairs to a blanket `forced-color-adjust: none` opt-out. If an exception is necessary, verify readability and focus in the user's palette.

## Evidence and limits

**Documented:** [MDN's forced-colors reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors) explains the restricted user palette, adjusted author colors and suppressed shadows. The [CSS Color Adjustment specification](https://drafts.csswg.org/css-color-adjust/#forced-colors-properties) specifies `box-shadow: none` while forced colors are active and `forced-color-adjust` is `auto`. A shadow alone is therefore an unreliable focus cue in that condition. Outline and border colors also undergo adjustment; their mere presence does not prove visibility.

These references support the mechanism, not a tested component implementation. The checklist is proposed; no browser/screen-reader pairing or visual regression was exercised here. This focused check does not establish WCAG conformance. The CSSWG page is a direct primary reference outside Brain's registered catalog tracking.
