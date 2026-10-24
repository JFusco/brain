---
title: "Layer the curation and support modules"
date: "2026-10-24"
topics: [code-quality]
---

# Layer the curation and support modules

[Issue 153](https://github.com/JFusco/brain/issues/153) is phase 3d-1 of the cleanup. Ten unlayered modules move into the layout.

**Moved as whole modules:**
- the excerpt cache: `branch/cache/excerpts`;
- the pinned packages: `branch/packages/{releases,vocabulary,ui-patterns}`;
- the commands: `tree/skills/suggest`, `tree/inbox/commands`.

**Split by responsibility:**

| Area | New modules |
| --- | --- |
| Privacy | `branch/privacy/{client-terms,secrets,scanner}` |
| Project context | `branch/project/{context,versions}` |
| Guidance | `branch/guidance/{knowledge,freshness,published}` and the `tree/curation/stale` command |
| Capture | `branch/capture/{domain,summary}` and the `tree/capture/capture` command |

**Deduplicated:**
- Vocabulary and UI patterns now share one bounded pinned-package reader (`branch/packages/pinned`). Both readers now apply `safePath`; the vocabulary reader previously passed only constant paths.
- The three copies of the stable-semver pattern are one `leaf/semver` constant.

Client-term matching, redaction and capture domain routing accept explicit inputs that default to configuration. Tests now cover whole-word matching, longest-first redaction and the WordPress tie-break without private configuration.

A relinking tool moved files and recomputed every relative import. ESLint plus a static import-to-export check verified the result.

Verification:
- Normalized output from the 19-command read-only baseline is byte-identical.
- `pnpm run verify:ci` passed.
