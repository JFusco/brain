---
title: "Private capture request receipts"
topics: [incremental-collection]
plans: [2026-11-09-capture-receipts-for-private-learning-intake-464ab0f8cf.md]
---

# Private capture request receipts

Delivery: [JFusco/brain#366](https://github.com/JFusco/brain/issues/366).

Capture now accepts an optional request UUID with an explicit domain. Exact input
bytes and domain define the request; a conflicting replay fails. Candidate and
request metadata share one atomic index write. Replay returns the original receipt
before applying current policy, while a read-only receipt lookup includes current
disposition without exposing source or quarantined bodies.

The focused tests cover replay, conflicts, policy changes, duplicates, invalid
UTF-8, quarantine metadata, and failures before versus after the index commit.
The surrounding intake work remains separate: this change creates no Slack reader,
new Brain scheduler, publication path or active automation.

Evidence: `scripts/lib/branch/capture/receipts.mjs`,
`scripts/lib/tree/capture/capture.mjs`,
`scripts/lib/tree/cli/knowledge-commands.mjs`, and
`tests/capture-receipts.test.mjs`. These are local implementation and fixture
checks; no live weekly capture or publication is claimed.
