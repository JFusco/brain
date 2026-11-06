---
title: "Coordinate agent concurrency with durable ownership"
format: "playbook"
domain: "tooling"
aliases: ["single writer agents", "durable agent handoff", "clean context reviewer"]
evidence_date: "2026-11-06"
reviewed_at: "2026-11-06"
applicability: "Proposed delivery-harness policy for shared repositories and integration checkouts; independent isolated writers require separate ownership and integration design"
provenance: "Cognition multi-agent engineering article and Anthropic workflow/research articles read 2026-11-06; scheduler policy proposed, private harness changes and throughput not reproduced"
status: "current"
versions: []
---

# Coordinate agent concurrency with durable ownership

## When to use this

Use when a serial delivery pipeline needs more throughput while preserving a single accountable write path. Establish which repository, checkout and shared resources each stage owns before adding slots.

## What to do

**Documented engineering perspective:** [Cognition's April 2026 account](https://cognition.com/blog/multi-agents-working) reports useful multi-agent patterns with serial writes and independent intelligence, including reviewers with clean context. This is a vendor's experience, not a theorem about all agent systems. Anthropic's [workflow guidance](https://www.anthropic.com/research/building-effective-agents) distinguishes predefined orchestration from model-directed agents and discusses bounded iteration; its [research-system account](https://www.anthropic.com/engineering/multi-agent-research-system) describes checkpoints/recovery and different parallelization opportunities in research and coding.

**Proposed scheduler procedure:**

1. Keep one authorized writer for the shared repository/integration checkout. Let read-only review or validation for one ticket overlap another ticket's writer only against immutable evidence. Isolated parallel writers are a separate design choice, not automatically safe because their directories differ.
2. Persist each handoff's job state, exact commit, input identities, outputs, decision and next stage. Agent messaging can carry that reference, but must not be the only recovery record. Native delegation remains appropriate for required independent review; the owner interprets findings within task scope. Do not turn nested calls into untracked writers.
3. Coordinate primary-checkout Git operations and other shared resources through a per-repository scheduler lock. An in-process lock suffices only when one process owns all participants; multiple coordinators require shared coordination. A ticket worktree does not isolate refs or all repository configuration.
4. Audit busy flags, slot allocation, eligibility/dispatch and Git serialization together. Choose a small explicit capacity; three slots is an unmeasured starting proposal, not an established optimum. Preserve fairness, holds and single-writer checks on restart as well as dispatch.
5. Give the reviewer exact immutable evidence without inheriting author reasoning. Retain findings and focused repair budgets; route exhausted or uncertain work to the owner instead of silently adding another writer or restarting completed work. Resume from reconciled checkpoints, with independent read-back after uncertain remote effects.

## Evidence and limits

No scheduler implementation, cross-ticket concurrency trial or throughput benchmark was performed. A private report's claim that three code locations were sufficient for one harness is deliberately not generalized. Use the existing [invocation contract](agent-cli-invocation-contract.md) for model/output settings and [capacity recovery](review-capacity-recovery.md) for transport/context failures; neither substitutes for ownership or required review gates.
