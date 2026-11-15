---
title: "Coordinate agent concurrency with durable ownership"
format: "playbook"
domain: "tooling"
aliases: ["single writer agents", "durable agent handoff", "clean context reviewer"]
evidence_date: "2026-11-15"
reviewed_at: "2026-11-15"
applicability: "Proposed delivery-harness policy for shared repositories and integration checkouts; independent isolated writers require separate ownership and integration design"
provenance: "Cognition multi-agent engineering, Anthropic workflow/research, A2A task lifecycle and AWS idempotent retry articles read 2026-11-15; direct references are not catalog registrations; scheduler, handoff, recovery and lesson-evaluation policies proposed, private implementation outcomes not reproduced"
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

The procedures below extend the same ownership boundary to role handoffs, recovery and advisory lessons. They do not introduce a second dispatcher or authorize implementation in a consuming project.

### Keep one handoff contract with role-specific evidence

**Documented:** the [A2A task lifecycle](https://a2a-protocol.org/latest/topics/life-of-a-task/) distinguishes input/authentication interruptions from terminal completion, cancellation, rejection and failure. Terminal tasks cannot restart; related follow-ups use a new task in the same context. This protocol example does not require adopting A2A or establish acceptance in a particular harness. Anthropic's workflow guidance above supports simple composable orchestration with model discretion.

**Proposed:** reuse the existing dispatcher, claims and external-action ledger. Have the harness supply assignment identity, candidate revision, scope and permitted actions; let each role return its canonical evidence payload. Derive routing from that payload and provider facts rather than asking a model to restate authority or maintain a second verdict. Validate identities, versions, candidate revisions, permissions and evidence references deterministically. Leave test strategy, diagnosis and explanatory prose to the agent within its assignment. Keep stable acceptance IDs across harmless wording edits; material requirement changes need a revised baseline. A schema-valid report still needs candidate-bound semantic and evidence checks before QA acceptance.

### Recover the unfinished step according to its failure

**Documented:** [AWS's idempotent retry guidance](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) explains that a missing response can leave the remote effect unknown. Caller request identifiers and matching intent can support safe retries when the service implements the required semantics. A local action ledger alone cannot supply that remote guarantee.

**Proposed:** share a recovery vocabulary and persisted budget across roles. Refresh stale read-only observations after slow prerequisite checks, then recheck authority at use. Repair report formatting against retained evidence without rerunning the underlying work. Route missing setup to its capable owner; route product defects to the developer for independent review and retest of the revised candidate.

Keep scoped durable human decisions separate from short-lived observations. Refreshing a read must not reset retries, erase failures or invent approval. Changed identity, denied permission, active holds and unresolved effects remain stops. For an uncertain external action, independently reconcile against the exact saved intent; adopt confirmed evidence and retain uncertainty when proof is incomplete. Generic retry policy is not permission to resend a mutation. An explicitly authorized retry must still satisfy the endpoint's idempotency, request-identity, intent and validity-window contract.

### Distinguish lesson exposure from verified improvement

**Proposed:** select relevant installed lessons by assignment purpose and scope, keep the prompt section bounded, and record selected revisions and omissions. Lessons remain advisory: they cannot grant permissions or override governing instructions, current source or observed evidence. Track separately whether a lesson was supplied, whether the agent cites how it changed an action, and whether independent outcome evidence supports an improvement. Exposure alone proves neither use nor benefit.

Return outcomes and conflicts through the existing asynchronous curation route; avoid a separate QA learning store or a new delivery gate. Repair recurring mechanical failures in deterministic code and behavior tests instead of teaching guard bypasses. Anthropic's evaluation guidance motivates measuring useful outcomes, but does not prove this lesson-evaluation policy improves a specific application.

## Evidence and limits

No scheduler implementation, cross-ticket concurrency trial or throughput benchmark was performed. A private report's claim that three code locations were sufficient for one harness is deliberately not generalized. Use the existing [invocation contract](agent-cli-invocation-contract.md) for model/output settings and [capacity recovery](review-capacity-recovery.md) for transport/context failures; neither substitutes for ownership or required review gates.

The handoff, recovery and learning additions are unexercised recommendations. Private source-inspection findings, staged corrections, exposure receipts and incidental package versions are deliberately excluded as implementation or compatibility proof. No live recovery, lesson application, measured improvement or approval for broader teaching is established. Official protocol/vendor examples support limited mechanisms, not a universal architecture or measured reliability gain.
