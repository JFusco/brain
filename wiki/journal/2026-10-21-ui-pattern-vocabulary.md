---
title: "Add UI pattern lookup and share package release checks"
topics: [ui-pattern-vocabulary]
plans: [2026-10-21-ui-pattern-lookup-and-shared-release-detection-7e3eb512b3.md]
---

# Add UI pattern lookup and share package release checks

After CMS vocabulary merged as PR 116, Joe requested continuing the UI Design
Brain integration and reusing the release-check mechanism. Main was clean and
already up to date at `3ab2461` before implementation. This request covered local
implementation. Joe subsequently authorized commit, push, merge and branch/worktree
cleanup, tracked by [issue 117](https://github.com/JFusco/brain/issues/117).
The delivery branch is `codex/117-ui-pattern-lookup`; merging requires a passing
Wiki integrity check on its exact PR head.

Pinned `@verndale/ui-design-brain` at 1.18.2 with package scripts disabled. Its
82-pattern catalog is read on demand with `lookup --ui-patterns`; only selected
`--fetch` results read pattern bodies, verifying their manifest hashes and
returning bounded excerpts. Package 1.18.2 and catalog authority 1.18.0 remain
separate identities. Aliases retain their contexts, and accessibility prose stays
explicitly non-normative. The package is reference data, not an installed skill
or an executable projection step.

Extracted CMS release detection into `scripts/lib/package-releases.mjs` and reused
it for UI Design Brain. CMS commands, saved state and its 1.3.0 pin are preserved.
Each package has separate private state, daily success throttling and one-hour
failure backoff. Nightly claim records each advisory result, and maintenance
status reports both. No dependency upgrade or PR creation happens automatically.

Local runtime outcomes:

- Banner lookup with selected guidance returned Alert and Hero with verified
  body hashes; CTA returned Button and Link with contextual aliases.
- An unknown label returned no matches, ordinary lookup omitted UI metadata,
  and a conflicting domain failed explicitly.
- Existing CMS contentReference lookup succeeded.
- UI npm metadata retrieval succeeded and reported 1.18.2 as latest. Repeated UI
  and CMS release commands honored the existing 24-hour interval; maintenance
  status reported both current pins with no errors or warnings.
- Brain privacy/runtime check, official check, changed-module syntax checks and
  whitespace validation passed. Scoped plan discovery found no unresolved
  candidates, and rebuilt wiki integrity passed.

One initial Banner invocation returned the existing suppressed invalid-JSON error
while invoked concurrently with a release command. A sequential retry passed;
its cause was not independently established. The original failure and subsequent
outcomes are retained privately in `.state/ui-patterns-verification.json`.
Verification commands that write state were then run sequentially.

No tests, fixtures, review agents or hosted reference jobs were added. Nightly
claim wiring was inspected but no scheduled run was claimed or demonstrated.
See [UI pattern vocabulary](../topics/ui-pattern-vocabulary.md) for the durable
contract and the [usage documentation](../../README.md#ui-pattern-vocabulary).
