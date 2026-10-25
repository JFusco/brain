---
title: "Use Motion for accessible App Router loading"
format: "note"
domain: "react"
aliases: ["Motion.js", "Motion for React", "Framer Motion", "loading transitions", "reduced motion"]
evidence_date: "2026-10-25"
reviewed_at: "2026-10-25"
applicability: "Motion selected for a Next.js App Router frontend; verify the consuming workspace's installed Motion, React and Next.js releases"
provenance: "Official Motion installation, accessibility, AnimatePresence, bundle-size and overview pages read 2026-10-25 at rolling URLs, no immutable Motion revision established; w3c-accessibility@c2c7fa790e32156b38b445e98c5dbe7b96dccda9030b876ca7100d2c0874d6c8; WAI-ARIA 1.2 status/busy definitions read; Next.js loading convention and React Effect lifecycle references read 2026-10-25 at rolling URLs; sanitized proposed loading and verification practices, no reproduced browser acceptance"
status: "current"
versions: []
---

# Use Motion for accessible App Router loading

## When to use this

Use this when Motion is already the selected animation library and route or data loading needs understandable feedback. The [React overview](https://motion.dev/docs/react) is the vendor entry point. These decisions do not authorize installing Motion or certify any application's package combination.

## What to do

1. **Documented:** the [installation guide](https://motion.dev/docs/react-installation) uses the `motion` package and `motion/react` entry point. For App Router it shows a client component importing `motion/react`, or `motion/react-client` for appropriate server-component imports. **Proposed:** retain static application structure on the server and isolate hooks, local settings and request-driven animation state in focused client components. The server-compatible component entry point does not make interactive hooks server APIs. Follow the target repository's boundary and package rules. For browser preferences, also respect [matching hydration output](hydration-browser-storage.md).
2. **Documented:** [Motion accessibility](https://motion.dev/docs/react-accessibility) says `MotionConfig reducedMotion="user"` disables transform and layout animations according to the user's setting, but preserves values such as opacity and background color. `useReducedMotion` supports custom responses to that preference. **Proposed:** when a loading indicator should stop pulsing under reduced motion, use the hook to stop repeated opacity changes explicitly and retain useful static status text. The context option alone does not stop every animation. **Proposed preference policy:** combine the OS preference with an explicit application reduction setting using an OR rule: either request enables reduction; a cinematic application setting must not cancel the OS request. For a stopped pulse, use static opacity and remove repetition; use zero duration where an immediate state change is intended, without suppressing useful status content.
3. **Documented:** [AnimatePresence](https://motion.dev/docs/react-animate-presence) tracks removal of direct children; each needs a unique key, and exiting motion descendants can run their exit animations. **Proposed:** key the actual state or element being tracked and keep the presence boundary mounted while exit completes. Do not infer universal App Router route-transition support from this component contract.
4. **Documented:** the [bundle guide](https://motion.dev/docs/react-reduce-bundle-size) combines slim components from `motion/react-m` with `LazyMotion` and selected features. `domAnimation` covers animation and exits; layout or drag needs the larger feature set. Passing a feature package synchronously still bundles it initially; deferred loading requires the documented dynamic-loading pattern. **Proposed:** evaluate that tradeoff against the actual needed features and measured bundle. Avoid ordinary `motion` components inside a supposedly slim setup that defeats its benefit; no fixed kilobyte saving is promised here.
5. **Documented:** WAI-ARIA defines [status](https://www.w3.org/TR/wai-aria-1.2/#status) for advisory live updates and [aria-busy](https://www.w3.org/TR/wai-aria-1.2/#aria-busy) for content being modified; assistive technology may defer changes while a region is busy. **Proposed:** describe the actual pending operation with nonurgent status text and mark the updating region busy only during its update, clearing it on completion. Do not hide an immediately needed status announcement inside a region kept busy. Distinguish a saved snapshot from current live data; animation is not evidence of freshness. When manual Effects load data, retain [obsolete-response cleanup](effect-request-cleanup.md).

## Keep the shell visible and states truthful

**Documented:** Next.js [loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading) provides a Suspense fallback for its route segment; shared layouts remain interactive while the new segment loads. This does not replace every independent client request's state management.

**Proposed:** keep the navigation shell, typography and content geometry visible during pending work. Put skeletons in the corresponding content region instead of hiding the whole application. Distinguish route fallback, a particular pending request and a terminal failure; replace a failed request's indefinite loader with an explicit error state. Preserve previously verified values only with a stale or saved-snapshot label. An absent measurement is unknown, not a measured zero. Use advisory status text and the updating region's busy state as described above; do not put every message indiscriminately inside a busy status container.

## Proposed consuming-application checks

Use this bounded procedure when implementing or changing the loading pattern; it is a proposed verification recipe, not a test performed during this curation:

1. Delay the relevant initial response, use a narrow viewport and emulate reduced motion. Check that the shell and understandable pending status remain visible, the busy region is scoped correctly and its decorative loading pulse does not repeat indefinitely. Release the response, then check the real content and cleared busy state. An animation count alone does not prove the status was announced by assistive technology.
2. If display settings exist, verify that OS and application reduction each work independently, that an ordinary/cinematic setting cannot override OS reduction, and that the dialog closes with Escape. When opacity-loop behavior changes, also exercise ordinary motion; a reduced-motion result cannot establish every setting's behavior.
3. Navigate repeatedly across the affected screens. Check event-stream subscriptions, animation-frame loops and any canvas rendering against their intended owners, including resources deliberately shared by a retained layout. [React Effect cleanup](https://react.dev/reference/react/useEffect#connecting-to-an-external-system) documents cleanup before changed-input setup and after unmount; **proposed:** verify that departed screen owners leave no orphan loops or subscriptions, without demanding that intentional shared resources be destroyed on every navigation. Observe the selected production build if production-build acceptance is the claim.

## Evidence and limits

The official passages above were read on the evidence date. Motion's URLs are rolling documentation, not an immutable release snapshot or a complete evaluation of its linked examples. Some accessibility examples still use the older `framer-motion` import; use the current installation guide and the selected installed package rather than silently mixing entry points.

The loading workflow, reduced-motion pulse choice and component organization are explicitly proposed practices. No consuming application, installed dependency graph, browser, screen reader, route transition or bundle benchmark was exercised during curation. The capture's incidental installed versions and claim that a prior lookup returned no Motion guidance are not adopted as compatibility or universal coverage claims. A follow-up capture reports a delayed-response/reduced-motion browser check and repeated navigation checks with retained streaming and canvas/frame ownership. Those historical success claims were not independently inspected or rerun here; their original observations and incidental versions remain private. The public verification recipe preserves the reusable procedure without asserting those successes, a particular stream count, general accessibility conformance or zero layout shift. Original evidence remains private. Validate actual loading, exit and reduced-motion behavior in the consuming application before claiming acceptance.
