---
status: "partial"
executed: true
evidence: ["scripts/lib/tree/capture/capture.mjs; tests/capture-receipts.test.mjs"]
source_tool: "codex"
source: "Private learning intake plan, sanitized Brain scope"
topics: ["incremental-collection"]
digest: "464ab0f8cf26449bdc0c12b892589cdd0391f8a9710cd58b6761438090942ba5"
---

# Capture receipts for private learning intake

1. Bind an optional capture request UUID to exact UTF-8 input bytes and an explicit domain.
2. Atomically persist the request receipt with the candidate index entry, including duplicate and quarantine outcomes.
3. Return the original receipt on identical replay; refuse conflicting bytes or domains even when current privacy policy changes.
4. Add metadata-only receipt lookup, including current disposition without reading candidate bodies.
5. Test input validation, replay/conflict, policy changes, duplicate requests, quarantine privacy and interrupted writes.
6. Document the contract and preserve ordinary capture, curation and publication behavior.

This is the Brain portion of a larger private Slack intake plan. The Office owns collection and scheduling. Connector capability qualification, coverage gaps, launch and live weekly completion are separate from this receipt implementation. Private source identifiers and the original source-specific plan remain outside the repository.
