---
title: "Organize Tailwind 4 tokens by responsibility"
domain: "tailwind"
aliases: ["theme tokens", "token ownership", "CSS token files"]
evidence_date: "2026-10-05"
reviewed_at: "2026-10-16"
status: "current"
versions: ["tailwindcss@4"]
applicability: "Tailwind 4 projects whose agreed design-system structure uses separate token files; preserve repository conventions"
provenance: "Partial candidate 1d018fa38e4a2bf7ba57dee9; tailwind-docs@7f92c2213315c195dae583d68752da4042da3ade; theme response SHA256 edc34de2d8ea26c093fc280f337ee40c2cc46921d10e1ce61e58735b5f7322ef, fetched 2026-10-16T10:04:23.707Z"
---

# Organize Tailwind 4 tokens by responsibility

## When to use this

Use this when a growing theme needs clear ownership or the repository already requires separate token files.

## What to do

1. Inspect the existing theme entry point and agreed folder layout before moving tokens. Keep the application stylesheet as an explicit import entry point.
2. Split only the responsibilities that need separate ownership, such as primitives, semantic colors, typography, spacing, breakpoints, or effects. Preserve import order and one authoritative definition per token.
3. Define utility-generating variables in top-level `@theme` blocks. Keep ordinary CSS variables in `:root` when they should not create utilities. Import the token modules from the entry stylesheet.
4. Reuse the agreed tokens and utilities in authored presentation. Keep any permitted runtime colors or measured values narrowly scoped and documented in the consuming project.

This keeps token ownership discoverable without making every component invent its own design values.

## Evidence and limits

The [official theme reference](https://tailwindcss.com/docs/theme) supports utility-generating theme variables and imported CSS theme files. Responsibility-based folders are an observed project convention, not a Tailwind requirement. The private candidate reports a completed refactor; its application checks were not rerun here. The pinned reference response was verified against its Git blob. Confirm the consuming project's installed version and contract before applying this note; it does not authorize changes there.
