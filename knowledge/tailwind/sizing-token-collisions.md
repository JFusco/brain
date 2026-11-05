---
title: "Avoid Tailwind spacing and container token collisions"
format: "playbook"
domain: "tailwind"
aliases: ["max-w-3xl collision", "spacing namespace precedence", "container size tokens"]
evidence_date: "2026-11-05"
reviewed_at: "2026-11-05"
applicability: "Tailwind CSS 4 theme authoring; lookup order verified in official v4.3.3 source only, not a cross-version API guarantee"
provenance: "tailwind-docs@7f92c2213315c195dae583d68752da4042da3ade; live v4.3 theme and max-width documentation and official v4.3.3 utilities.ts/theme.ts source read 2026-11-05; no application reproduction"
status: "current"
versions: ["tailwindcss@4"]
---

# Avoid Tailwind spacing and container token collisions

## When to use this

Use when a Tailwind 4 theme adds named spacing tokens and components also use named widths. This complements [token ownership](responsibility-based-tokens.md) and [application/Storybook parity review](application-storybook-review.md).

## What to do

**Documented:** The [theme namespace table](https://tailwindcss.com/docs/theme#theme-variable-namespaces) associates `--spacing-*` with spacing/sizing utilities and `--container-*` with container queries and named sizes. The [max-width reference](https://tailwindcss.com/docs/max-width) documents container-scale names and the explicit custom-property form `max-w-(--my-max-width)`.

**Version-scoped source observation:** In official [Tailwind v4.3.3 utilities](https://github.com/tailwindlabs/tailwindcss/blob/v4.3.3/packages/tailwindcss/src/utilities.ts), `w`, `min-w` and `max-w` search their respective `--width`, `--min-width` or `--max-width` namespace, then `--spacing`, then `--container`. The `inline`, `min-inline` and `max-inline` sizing utilities also search spacing before container. The [theme resolver](https://github.com/tailwindlabs/tailwindcss/blob/v4.3.3/packages/tailwindcss/src/theme.ts) searches these in order. Thus, absent a property-specific override, `--spacing-3xl` can take precedence over `--container-3xl` for `max-w-3xl`. This is inspected implementation behavior, not a documented precedence promise for every Tailwind 4 release.

**Proposed review procedure:**

1. Before approving new spacing names, compare their suffixes with the project's container-scale names, including the default `3xs` through `7xl` scale where retained. Choose names that keep spacing intent distinct from container sizing; put the rule in the project's token-authoring guidance or an authorized checker.
2. If approved tokens already collide, consider an explicit container reference such as `max-w-(--container-3xl)` instead of renaming a shared token without reviewing consumers. Confirm that the variable exists and resolves to the intended size.
3. Search actual `w-*`, `min-w-*` and `max-w-*` consumers (and logical inline-size utilities where used), inspect emitted CSS and resolved values, then render representative narrow and wide cases. Build, type and accessibility checks alone do not establish intended layout width.

## Evidence and limits

Official documentation and versioned source were inspected; no compiler, application, browser or accessibility suite was run for this lesson. A private report described collapsed text columns despite passing other checks; its incident counts and successful repair claims are not reproduced evidence. Recheck lookup behavior for the installed release, project overrides and theme imports before applying the proposed procedure.
