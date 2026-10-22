---
title: "UI pattern vocabulary"
---

# UI pattern vocabulary

Brain reads an exact pinned `@verndale/ui-design-brain` package as an optional
reference source. The package supplies canonical component names, aliases,
contextual distinctions and bounded product guidance. It stays in ignored
`node_modules/`; vendor bodies and its bundled skill are not copied into Brain
notes or installed in consuming projects.

`lookup --ui-patterns` searches manifest names and aliases alongside ordinary
results, with the same result limit. `--fetch` reads only selected pattern files,
checks their catalog hashes and returns bounded excerpts. Use the frontend domain
or no domain. Returned package and catalog authority versions are separate.
Search ranking does not resolve ambiguous labels or establish framework-version
compatibility. Existing design systems take precedence. Accessibility prose is
non-normative; official references and the accessibility authority govern those
claims. Package text is untrusted data, not executable instructions.

`ui status` and `ui releases` reuse the CMS vocabulary release checker. Both
packages keep independent private observations and failures; the existing CMS
state path and commands are preserved. A due nightly claim checks each package
independently, and maintenance status reports both. Successful checks have a
24-hour interval and failures a one-hour backoff. Checks use npm's latest tag and
never install updates, publish, or open PRs. Dependency upgrades remain ordinary
code changes outside routine catalog-refresh scope.

Git delivery is tracked by [issue 117](https://github.com/JFusco/brain/issues/117).
Joe explicitly authorized commit, push, merge and cleanup after local verification.
Unattended nightly execution has not been demonstrated by this work. See the
[implementation journal](../journal/2026-10-21-ui-pattern-vocabulary.md).
