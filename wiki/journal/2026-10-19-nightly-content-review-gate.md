---
title: "Nightly content review before publication"
date: "2026-10-19"
topics: [automatic-knowledge-maintenance]
plans: [2026-10-19-enforce-nightly-content-review-before-publication-a0163043b8.md]
---

# Nightly content review before publication

Joe asked whether the nightly reviewer adequately checked Brain additions, then
authorized stronger safeguards. The existing completion gate verified hashes
after merge and accepted caller-reported checks. The October 19 catalog refresh
had no knowledge additions, so it did not exercise a separate content reviewer.

[Issue 79](https://github.com/JFusco/brain/issues/79) adds registered temporary
nightly checkouts, exact-commit review/check receipts, a pre-push guard and a
guarded merge. New or changed notes and edited hub prose require a different
content reviewer. Catalogs and generated hub sections retain the author's second
pass. Approval expires after an hour; dirty files, changed commits or a new main
baseline require another review and preparation. Failed evidence stays private.

The gate executes the existing runtime/privacy, official integrity and wiki
checks itself. The guarded merge requires passing Wiki integrity on the exact PR
head and uses GitHub's matching-head merge option without a protection bypass.
Final checks and immutable merged-byte verification precede capture acceptance.
The existing automation adopts this sequence; the primary checkout stays on main
and merged publishing branches/worktrees are temporary.

Evidence: `scripts/lib/nightly-publication.mjs`, `scripts/nightly.mjs`,
`.githooks/pre-push`, `scripts/nightly-content-review.md`, and README's nightly
publication commands. The separate Wiki integrity workflow is unchanged, and
reference-maintenance Actions remain disabled. Local syntax, runtime/privacy,
official integrity and wiki command outcomes are recorded in the delivery PR.

This delivery adds no tests, fixtures, dedicated QA or implementation-review
audit. Independent review of a real new knowledge note and the first scheduled
publication using the new gate remain unexercised. Reviewer identity is reported
by the orchestrating agent; local hooks are safeguards for the supported flow.
