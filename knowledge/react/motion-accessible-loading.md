---
title: "Use Motion for accessible App Router loading"
format: "note"
domain: "react"
aliases: ["Motion.js", "Motion for React", "Framer Motion", "loading transitions", "reduced motion"]
evidence_date: "2026-10-25"
reviewed_at: "2026-10-25"
applicability: "Motion selected for a Next.js App Router frontend; verify the consuming workspace's installed Motion, React and Next.js releases"
provenance: "Official Motion installation, accessibility, AnimatePresence, bundle-size and overview pages read 2026-10-25 at rolling URLs, no immutable Motion revision established; w3c-accessibility@c2c7fa790e32156b38b445e98c5dbe7b96dccda9030b876ca7100d2c0874d6c8; WAI-ARIA 1.2 status/busy definitions read; sanitized proposed loading practices, no browser acceptance"
status: "current"
versions: []
---

# Use Motion for accessible App Router loading

## When to use this

Use this when Motion is already the selected animation library and route or data loading needs understandable feedback. The [React overview](https://motion.dev/docs/react) is the vendor entry point. These decisions do not authorize installing Motion or certify any application's package combination.

## What to do

1. **Documented:** the [installation guide](https://motion.dev/docs/react-installation) uses the `motion` package and `motion/react` entry point. For App Router it shows a client component importing `motion/react`, or `motion/react-client` for appropriate server-component imports. **Proposed:** retain static application structure on the server and isolate hooks, local settings and request-driven animation state in focused client components. The server-compatible component entry point does not make interactive hooks server APIs. Follow the target repository's boundary and package rules. For browser preferences, also respect [matching hydration output](hydration-browser-storage.md).
2. **Documented:** [Motion accessibility](https://motion.dev/docs/react-accessibility) says `MotionConfig reducedMotion="user"` disables transform and layout animations according to the user's setting, but preserves values such as opacity and background color. `useReducedMotion` supports custom responses to that preference. **Proposed:** when a loading indicator should stop pulsing under reduced motion, use the hook to stop repeated opacity changes explicitly and retain useful static status text. The context option alone does not stop every animation.
3. **Documented:** [AnimatePresence](https://motion.dev/docs/react-animate-presence) tracks removal of direct children; each needs a unique key, and exiting motion descendants can run their exit animations. **Proposed:** key the actual state or element being tracked and keep the presence boundary mounted while exit completes. Do not infer universal App Router route-transition support from this component contract.
4. **Documented:** the [bundle guide](https://motion.dev/docs/react-reduce-bundle-size) combines slim components from `motion/react-m` with `LazyMotion` and selected features. `domAnimation` covers animation and exits; layout or drag needs the larger feature set. Passing a feature package synchronously still bundles it initially; deferred loading requires the documented dynamic-loading pattern. **Proposed:** evaluate that tradeoff against the actual needed features and measured bundle. Avoid ordinary `motion` components inside a supposedly slim setup that defeats its benefit; no fixed kilobyte saving is promised here.
5. **Documented:** WAI-ARIA defines [status](https://www.w3.org/TR/wai-aria-1.2/#status) for advisory live updates and [aria-busy](https://www.w3.org/TR/wai-aria-1.2/#aria-busy) for content being modified; assistive technology may defer changes while a region is busy. **Proposed:** describe the actual pending operation with nonurgent status text and mark the updating region busy only during its update, clearing it on completion. Do not hide an immediately needed status announcement inside a region kept busy. Distinguish a saved snapshot from current live data; animation is not evidence of freshness. When manual Effects load data, retain [obsolete-response cleanup](effect-request-cleanup.md).

## Evidence and limits

The official passages above were read on the evidence date. Motion's URLs are rolling documentation, not an immutable release snapshot or a complete evaluation of its linked examples. Some accessibility examples still use the older `framer-motion` import; use the current installation guide and the selected installed package rather than silently mixing entry points.

The loading workflow, reduced-motion pulse choice and component organization are explicitly proposed practices. No consuming application, installed dependency graph, browser, screen reader, route transition or bundle benchmark was exercised during curation. The capture's incidental installed versions and claim that a prior lookup returned no Motion guidance are not adopted as compatibility or universal coverage claims. Original evidence remains private. Validate actual loading, exit and reduced-motion behavior in the consuming application before claiming acceptance.
