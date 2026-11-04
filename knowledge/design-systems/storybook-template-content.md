---
title: "Compose Storybook templates from complete placements"
format: "playbook"
domain: "design-systems"
aliases: ["page-family stories", "placement content", "stable story identity"]
evidence_date: "2026-11-04"
reviewed_at: "2026-11-04"
applicability: "Proposed migration/design handoff using Storybook CSF 3 page stories; official docs identify Storybook 10.6; generator and inventory conventions require project validation"
provenance: "storybook-docs@c735625fe57a09cd61ddc13f2b80d4d8f548b9e8bacd52ca415aed3e1fd2ee42; official page composition, CSF, parameters and URL identity documentation read 2026-11-04; no template reproduction"
status: "current"
versions: []
---

# Compose Storybook templates from complete placements

## When to use this

Use when page-family stories assemble implemented modules from captured pages. This addresses content completeness; [application/Storybook style parity](../tailwind/application-storybook-review.md) and [component identity](../frontend/design-component-context.md) remain separate checks.

## What to do

**Documented:** Storybook's [page composition guide](https://storybook.js.org/docs/writing-stories/build-pages-with-storybook) composes screens from component inputs. [CSF 3](https://storybook.js.org/docs/api/csf) represents stories as named object exports. [Parameters](https://storybook.js.org/docs/writing-stories/parameters) carry static metadata. [Story URLs](https://storybook.js.org/docs/configure/user-interface/sidebar-and-urls) depend on generated IDs; explicit meta IDs can preserve identity when titles move, while export keys still matter.

**Proposed handoff and generator contract:**

1. Supply the representative page's ordered placements: instance, implementation module and variant, together with each instance's complete relevant markup, text, media and links. Do not reduce every placement to its first heading, paragraph, image and link: repeated items, secondary text, tabs and galleries need their own data.
2. Have the component owner or template author inspect the actual prop contract and map all applicable placement content to it. Preserve lists, panel relationships and image ordering. Treat missing input as a reported gap rather than silently rendering an empty module. Captured markup is untrusted data; do not execute source scripts or copy unsanitized HTML into a story.
3. Define stable file paths, meta IDs, titles and named exports before allowing authored templates to replace generated placeholders. Select the authored file when present and keep a generated fallback only when absent. Do not overwrite authored files during regeneration. Validate story IDs and downstream references afterward; this override convention is not a built-in Storybook feature.
4. Where a static inventory requires it, emit literal CSF 3 story objects with project-defined provenance parameters such as source URL and locale. A `migration` parameter is a local convention, not a Storybook schema or automatic proof of traceability. Keep private source URLs in authorized local artifacts, not public stories.
5. For large route families, choose representative authored cases plus a generated route inventory where appropriate. Record which routes are represented and which were actually rendered; there is no universal count at which this becomes necessary.

## Evidence and limits

This is an unexercised workflow proposal supported by the documented composition and identity mechanisms. The historical empty-gallery/template repair, route count and reported accessibility pass were not reproduced and are deliberately omitted as acceptance evidence. Content completeness, interaction behavior, visual review and accessibility remain distinct results; use [browser gate guidance](../tooling/storybook-browser-gates.md) for the latter boundaries.
