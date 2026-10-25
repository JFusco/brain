---
title: "Build Motion animations with the right API"
format: "playbook"
domain: "react"
aliases: ["Motion.js", "Motion", "Framer Motion", "animation best practices", "scroll animation", "layout animation", "animation how-to"]
evidence_date: "2026-10-25"
reviewed_at: "2026-10-25"
applicability: "Applications already using Motion; React recipes plus a JavaScript API entry point. Verify the selected workspace's installed package and supported APIs against these rolling docs."
provenance: "motion-docs@379798ecbc4621eed5f3f96abd19bc774b1461acf1f334f93cda321e533d6e0a; Official motion.dev documentation index, React animation, layout, scroll, gestures, useAnimate, JavaScript animate and performance pages read 2026-10-25 at rolling URLs; proposed implementation and verification workflow, no application benchmark or browser acceptance"
status: "current"
versions: []
---

# Build Motion animations with the right API

## When to use this

Use this when adding or reviewing animation in an application that already uses Motion. Start at the [official documentation](https://motion.dev/docs) and choose the framework used by the selected application. The [official documentation index](https://motion.dev/llms.txt) links reference pages and tutorials; it also lists premium features, so inclusion in the index does not establish that a feature is part of the free package.

For installation, Next.js server/client boundaries, exit keys, reduced motion and bundle loading, follow [accessible App Router loading](motion-accessible-loading.md). This playbook adds API selection and implementation recipes rather than replacing that guidance.

## What to do

The API behavior below is documented; the ordered workflow and review choices are **proposed practices** to validate in the consuming application.

1. **Describe the state change first.** Name the trigger, starting and ending states, interruption behavior and reduced-motion result. Prefer a small transition that explains the actual change; retain usable content and controls if decorative animation is disabled.
2. **Animate React state declaratively.** The [React animation guide](https://motion.dev/docs/react-animation) documents `initial`, `animate`, variants and transition options. For a stateful element, set `animate` from its current state; use variants when named states are shared by children. Follow the [transition reference](https://motion.dev/docs/react-transitions) for timing or springs rather than assigning arbitrary delays throughout the component tree.
3. **Animate geometry with layout APIs.** The [layout guide](https://motion.dev/docs/react-layout-animations) documents `layout` for render-driven geometry changes and matching `layoutId` values for shared elements. Change layout through `style` or `className` and let `layout` animate the result, rather than also targeting that geometry through `animate`. Proposed: use shared identifiers only for elements intended to connect, then inspect text, borders and nested content during size changes.
4. **Choose the scroll relationship.** The [scroll guide](https://motion.dev/docs/react-scroll-animations) separates viewport entry/exit triggers from values linked continuously to scroll position. Use `whileInView` for a reveal, adding `viewport={{ once: true }}` when it should occur only once; set the viewport root for a nested scroller. For linked progress, follow the guide's `useScroll` examples. Proposed: verify the real scroll container and retain readable content with reduced motion.
5. **Keep interactions usable.** The [gesture reference](https://motion.dev/docs/react-gestures) documents `whileHover`, `whileTap`, `whileFocus` and drag feedback. Proposed: use semantic buttons and links for actions, preserve visible keyboard focus, and verify keyboard and touch activation independently of hover styling. Pan gestures require an appropriate `touch-action` setting; restrict it to the intended axis and check that surrounding page scrolling remains usable.
6. **Scope imperative sequences.** The [useAnimate guide](https://motion.dev/docs/react-use-animate) provides a scope ref, scoped selectors and automatic cleanup of animations started by that hook on component removal. Proposed: use it when sequencing cannot be expressed clearly with declarative state, rather than selecting every matching element in the document. Custom subscriptions and other resources still need their own lifecycle handling.
7. **Select the JavaScript build deliberately.** Outside React, the [animate reference](https://motion.dev/docs/animate) distinguishes the hybrid `motion` entry point from `motion/mini`. Mini covers HTML/SVG styles; hybrid adds capabilities including independent transforms, sequences and objects. Proposed: pick the smallest API that supports the actual feature, and use its documented controls for lifecycle management. Do not transfer React hook behavior to vanilla JavaScript.
8. **Measure expensive effects.** The [performance guide](https://motion.dev/docs/performance) explains layout, paint and compositing, recommending transforms and opacity as broadly safe choices. Proposed: begin with those properties when they express the intended design, profile layout or paint-heavy alternatives on representative devices, and keep bundle measurements separate from animation smoothness. Hardware acceleration and a library choice do not establish application performance.

## Proposed verification procedure

Exercise initial render, entry, exit and rapid reversal of the affected state. Check keyboard, touch, reduced motion and the actual nested scroll container where applicable. Navigate away during imperative sequences and inspect cleanup. Confirm the final content remains available, and measure the relevant production build when making bundle or performance claims. These are suggested checks, not results achieved by this note.

## Evidence and limits

The linked official passages were read on the evidence date. Their rolling URLs are not an immutable package release or a guarantee that every API is available in an older application. Some examples retain `framer-motion` imports; follow the current installation guidance and the application's selected dependency instead of mixing package entry points. No dependency was installed, no agent skill or MCP server was configured, and no consuming application, assistive technology or performance benchmark was exercised. Premium examples and integrations require their own applicability and access checks.
