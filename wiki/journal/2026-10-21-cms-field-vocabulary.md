---
title: "CMS field vocabulary lookup"
topics: [cms-field-vocabulary]
plans: [2026-10-21-cms-field-vocabulary-integration-4fdfd0318b.md]
---

# CMS field vocabulary lookup

Brain previously linked the vocabulary repository as an authority but lookup did
not search its data. The requested integration now consumes published package
1.3.0 through an exact dependency and integrity lock. Explicit profile selection
adds matching field records alongside Brain notes and official links. This avoids
duplicating field tables or treating management, authoring and SDK vocabulary as
interchangeable.

The local nightly claim now records advisory release metadata. It retains the
installed pin, uses bounded requests with caching/backoff, and never upgrades or
publishes dependency changes. `vocabulary releases` also runs the same check
manually. This is dependency metadata, not a new official documentation source.

Local runtime checks exercised published profile evidence mappings, SDK 3 versus
management API reference shapes, absent opt-in behavior, mixed documentation and
field results, exact SDK version matching, and refusal of unknown or conflicting
profiles. The live registry check reported 1.3.0 as current. No official claim was
reverified and no nightly publication run was started to exercise scheduling.
An initial release command was refused by the shared mutation lock; the later
sequential invocation succeeded without removing or bypassing the lock.

Changed entry points: `scripts/lib/vocabulary.mjs`, `scripts/lib/lookup.mjs`,
`scripts/brain.mjs`, `scripts/lib/maintenance.mjs`, `scripts/nightly.mjs`, the root
package/lock, README and opt-in Brain skill. The normal privacy check scans the
new package manifests. Tests and fixtures remain deferred.

After the initial local implementation, the user explicitly requested a focused
adversarial review with another agent, followed by commit, push, merge and cleanup.
Delivery is tracked by [issue 115](https://github.com/JFusco/brain/issues/115).
The configured review-implementation workflow completed with Claude Opus 5.5
(high) reviewing and GPT-6 Astra (max) finalizing. It reported no actionable
findings and made no repairs. Private review receipts retain the exact scoped
fingerprint and successful required checks. The review inspected vocabulary
behavior; the author's earlier runtime exercises remain a separate evidence
layer. Scheduling and failure-backoff behavior were inspected, not exercised by
starting a nightly publication or inducing registry failures.

`node scripts/brain.mjs check` and `node scripts/brain.mjs official check` passed
with no issues or warnings. Wiki graph regeneration and
`node scripts/wiki/check.cjs` passed. Changed runtime modules passed Node syntax
checks, and `git diff --check` passed. A repeated release command used the
24-hour receipt; `maintenance status` exposed the same current pin and reported
no warnings. Scoped plan discovery found only this implementation plan.
