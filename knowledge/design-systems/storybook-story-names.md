---
title: "Name Storybook stories by variant and state"
format: "playbook"
domain: "design-systems"
aliases: ["story display names", "variant state naming", "shared story name plan"]
evidence_date: "2026-11-05"
reviewed_at: "2026-11-05"
applicability: "Storybook component libraries and generated CSF stories; official naming documentation identifies 10.6, while naming vocabulary and generator checks are project conventions"
provenance: "storybook-docs@c735625fe57a09cd61ddc13f2b80d4d8f548b9e8bacd52ca415aed3e1fd2ee42; live Storybook naming/structure, Figma variant and zeroheight naming guidance read 2026-11-05; no generator reproduction"
status: "current"
versions: []
---

# Name Storybook stories by variant and state

## When to use this

Use when a library has many variants, interaction states or viewport-specific stories, especially when generated scaffolds and authored stories must agree. For page composition and stable IDs, reuse [template content and identity guidance](storybook-template-content.md).

## What to do

**Documented mechanisms:** Storybook's [naming guide](https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy) supports slash-separated sidebar titles, start-cases exported story names and hoists a sole story whose display name matches its component title. The [structuring guide](https://storybook.js.org/blog/structuring-your-storybook/) distinguishes component feature stories covering states/variants from recipe stories composing components. [Figma's variant guide](https://www.figma.com/best-practices/creating-and-organizing-variants/) recommends properties aligned with code props and warns against unmanageable permutations. [Zeroheight's naming guide](https://help.zeroheight.com/hc/en-us/articles/36473861846043-Naming-conventions-for-your-design-system) supplies design-system vocabulary and places variant information before state; it does not define a Storybook standard.

**Proposed naming contract:**

1. Use sidebar titles for category/component hierarchy and keep each story's display name short. Cover the component's required variants and states; keep multi-component recipes distinguishable.
2. Name the variant before its interaction state, for example `Primary, disabled` or `Compact, expanded`. Use readable words such as Default, Hover, Focused, Pressed, Expanded and Selected instead of raw CSS keys. Define what each means: Pressed, persistent selection and expanded content are different states. A display label alone does not activate that state.
3. Take variant meaning from reviewed design values, component props or an understood modifier class. Prefer purpose-bearing labels when supported; retain a literal design value when it is the actual contract. Treat numbered placeholders such as `Variant 2` as unresolved naming to review.
4. Choose one display casing and viewport convention with the team, such as sentence case and `Expanded, mobile` or `Expanded (390px)`. Keep export identifiers in the project's code style and set an explicit display name when needed. Neither sentence case nor viewport punctuation is prescribed by Storybook.
5. For generators, compute one expected name per required subject and reuse that plan for scaffolds, author instructions and inventory diagnostics. Report drift rather than letting each producer invent another format. Preserve or verify story IDs and links when renaming exports or titles.

## Evidence and limits

This naming workflow is proposed practice supported by the linked mechanisms and design guidance. No generator, design file, story inventory or browser state was exercised. The private report's mass rename and package-specific success claims are deliberately omitted as proof. Naming consistency does not establish rendered state coverage or visual/accessibility acceptance.
