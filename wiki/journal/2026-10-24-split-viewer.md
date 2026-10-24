---
title: "Split the visual Brain viewer into layers"
date: "2026-10-24"
topics: [code-quality]
---

# Split the visual Brain viewer into layers

[Issue 169](https://github.com/JFusco/brain/issues/169) is phase 5 of the cleanup. The 1,138-line `web/brain/src.js` and 289-line `guidance.js` became layered modules, each under 200 lines:

- `lib/` (leaf): DOM shorthands, the layout hash, Markdown rendering, link resolution, layout and visibility, and pure graph derivations such as neighborhoods, overview references, domain coverage and activity text.
- `model/` (branch): shared viewer state, the JSON API client, the activity session and an injected navigator.
- `scene/` (tree): colors, the galaxy and backdrop, the intake and capture layers, the force graph, focus and overview, the search animation and the frame loop.
- `ui/` (tree): the details panel, metrics, intake, search, controls, and guidance split into explanation, comparison, feedback and the playbook and brief actions.
- `live/` (tree): snapshot refresh, the event stream and replay of external searches.
- `main.js` (root): wiring and startup. `index.html` now loads it.

The `choose → focus → star label → choose` loop is broken by `model/navigation`: scene and panel modules call `navigate()`, and the root registers the details view as the opener. The duplicated `$`/`element` helpers, the three 24-hour session assignments and the duplicated usage text each have one owner now. With no remaining problems, `architecture:check` runs without `--warn` and blocks CI.

Verification:
- Focused tests cover Markdown link resolution (internal, external, and inert, including traversal, credentials, non-HTTPS schemes and malformed escapes), visibility, layout, neighborhoods and overview references.
- A headless Chrome replay over the DevTools protocol drove the original and split builds against the same snapshot through 11 steps: load, search, open a result, pin a comparison, open a star label, overview, playbooks, brief, panels, domain filter and a popular note. The transcripts were identical; the only console error in both was the missing favicon.
- `pnpm run verify:ci` passed.
