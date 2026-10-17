---
title: "Record low-value nightly curation rejections"
topics: ["automatic-knowledge-maintenance"]
plans: ["2026-10-17-record-low-value-nightly-curation-rejections-4c7810f86d.md"]
---

# Record low-value nightly curation rejections

[Issue 24](https://github.com/JFusco/brain/issues/24) refines nightly candidate triage. Fully reviewed candidates with no reusable guidance or evidence may be rejected after a private batch record identifies their current content hash, review coverage, decision and concrete reason. Actual resolution outcomes are recorded afterward; failed audit recording or changed content leaves the candidate pending. Original bodies, provenance and disposition history remain private and preserved.

Uncertain, inaccessible, unsupported, partly reviewed and partially useful material remains pending with useful portions and outstanding review needs recorded. Length, age, filename, instruction format or tags alone do not establish low value. Quarantined bodies remain excluded, and the existing 12-candidate total review bound still applies. No candidates were resolved as part of this policy delivery.

The existing 03:15 nightly publisher prompt was updated and read back exactly; its active state, daily time, name and target chat are unchanged. No new schedule was created. The private inbox remains collection storage. Reusable guidance still follows exact proposals, an issue-linked PR, applicable checks, automatic merge and immutable merged-byte verification before acceptance.

The dirty primary checkout was preserved. An isolated issue branch starts at fetched remote main because switching the primary checkout would disturb nightly work. The curation standard uses exact proposal digest `75856af07f44a26e7f46809326728a2f8516c3b670e97eb7bb6c1cfdb63f86d6`, with no cited or accepted candidates. Existing integration work remains deferred; no project, source registry, runtime schema, backup, or memory changes are included.

Verification: the existing inbox resolver checks candidate hashes and preserves candidate bodies but has no reason argument, so reasons use ignored private batch records rather than a new schema. Runtime privacy/content, official integrity and wiki checks are recorded in the linked PR. Tests, fixtures, dedicated QA and review-agent audits remain deferred under AGENTS.md. Prompt readback verifies configuration, not a future unattended triage result.

Rollback: revert the scoped maintenance PR and restore the prior nightly prompt; preserve private reasons and disposition history instead of resetting collected evidence.
