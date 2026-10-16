---
title: "Review Tailwind 4 application and Storybook parity"
domain: "tailwind"
aliases: ["Storybook parity", "Tailwind design review", "production utility checks"]
evidence_date: "2026-10-16"
reviewed_at: "2026-10-16"
status: "current"
versions: ["tailwindcss@4"]
applicability: "Tailwind CSS 4 applications with separate application and Storybook builds; confirm the selected application's installed version and review contract"
provenance: "Candidate 44c4983903bd3a647fe835e5, fully reviewed; tailwind-docs@7f92c2213315c195dae583d68752da4042da3ade; five official pages retrieved with Git blob verification on 2026-10-16; live official documentation also checked"
---

# Review Tailwind 4 application and Storybook parity

## When to use this

Use this when reviewing styling differences between a Tailwind 4 application and its Storybook, or planning a v3-to-v4 visual review. Select the consuming application's installed versions; a rolling catalog does not establish exact compatibility. Preserve the project's agreed tokens and acceptance requirements.

## What to do

These are proposed review practices grounded in documented Tailwind mechanisms, not framework-mandated acceptance gates.

1. **Compare generated styles in both builds.** Check required utilities in the actual production build as well as Storybook. Tailwind scans source text for complete class names; it does not evaluate concatenated class fragments. Check each build's source coverage and explicitly register otherwise excluded sources with `@source` when needed. Separate source sets can produce different CSS; no such defect was observed here. See [source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files).
2. **Check resolved token values.** Inspect fonts, colors and spacing in both environments against the intended design. When a theme variable references another variable, consider the documented `@theme inline` behavior to avoid the variable-resolution issue in the official example; it is not a blanket setting for every token. See [referencing other variables](https://tailwindcss.com/docs/theme#referencing-other-variables). For file ownership, reuse [token organization guidance](responsibility-based-tokens.md).
3. **Trace styling conflicts before adding overrides.** Inspect resets, inheritance, cascade layers and competing selectors. During a v3-to-v4 upgrade, check borders, rings, shadows and radii against the changed defaults and utility names in the [upgrade guide](https://tailwindcss.com/docs/upgrade-guide). This inspection order is a suggested debugging practice.
4. **Review layout transitions at relevant sizes.** Check intended widths and behavior around the project's breakpoints. Use viewport queries for viewport-dependent layouts and container queries when a component responds to its available parent space. The [responsive reference](https://tailwindcss.com/docs/responsive-design) documents these mechanisms; choosing review sizes comes from the design and project contract. One matching screenshot does not establish responsive fidelity.
5. **Review interaction and motion states.** Include touch activation, keyboard operation, visible focus, hover and reduced-motion behavior where relevant. Tailwind 4 gates its hover variant on whether the primary input device supports hover, so review essential actions for an activation path beyond hover. See [hover changes](https://tailwindcss.com/docs/upgrade-guide#hover-styles-on-mobile) and [motion-reduce/motion-safe](https://tailwindcss.com/docs/hover-focus-and-other-states#prefers-reduced-motion). This is suggested coverage, not an accessibility compliance determination.

Record the build, component or page, state, viewport, source revision and actual result using [UI evidence guidance](../frontend/match-evidence-to-claim.md). Required browser or design comparisons come from the consuming project's review contract.

## Evidence and limits

All five candidate recommendations were reviewed. Source detection, theme references, upgrade changes, responsive queries and state variants were verified against the linked official pages. The pinned catalog source was retrieved with Git blob checks; focused excerpt/hash receipts are retained privately without full page bodies. Live documentation identified itself as v4.3 at review time; check version-specific details against the installed package before adopting them.

No application, production build, Storybook, browser interaction or design file was inspected. These checks establish neither a defect nor successful project acceptance. This note complements token organization and evidence reporting; it does not replace either or authorize changes in another project.
