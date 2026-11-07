---
title: "Attribute batch time before optimizing local history scans"
format: "playbook"
domain: "performance"
aliases: ["HTTP versus local time", "Node CPU profile", "history identity map", "batch performance"]
evidence_date: "2026-11-02"
reviewed_at: "2026-11-02"
applicability: "Proposed diagnostics for Node.js batch tools; Node 24 CPU profiler documentation, serial and overlapping requests require different accounting"
provenance: "nodejs-24-docs@ff36dfdb2741f2c837d57f053c8439266912fb7e2bf91afc9b4a36d23352ec42; official Node 24 CLI CPU-profiler section read 2026-11-02; sanitized private profiling recommendations, no reproduced benchmark"
status: "current"
versions: []
---

# Attribute batch time before optimizing local history scans

## When to use this

Use when an import or validation pass looks slow and an adapter timer is labeled as API time. It can include persistence, hashing, parsing and gaps as well as network work.

## What to do

**Proposed procedure:**

1. Record request start, response headers and body completion separately from the enclosing operation. For serial requests, compare non-overlapping HTTP intervals with operation and batch windows. With concurrency, summed request durations can exceed wall time: use interval unions or a trace before attributing the remainder. Headers-only timing excludes body transfer and cannot identify all non-vendor time as CPU work.
2. Separate HTTP inside operations, local work inside operations and gaps between operations. Compare local time by operation groups across the run: flat cost suggests a repeated fixed amount of work, while growth suggests accumulation. Treat either as a diagnostic lead, not proof of the cause. Time serialization, persistence, validation and hashing separately.
3. For CPU work, reproduce the authorized workload on an [isolated copy](../databases/sqlite-backup-for-replay.md). [Node 24 `--cpu-prof`](https://nodejs.org/docs/latest-v24.x/api/cli.html#--cpu-prof) starts V8 profiling at startup and writes the profile before exit. Inspect self time and time including callees before changing the suspected function; a CPU profile does not measure network wait.
4. If a pass repeatedly loads and parses all history before filtering per item, load one fixed snapshot per pass and pass it to selections. Preserve filters, ordering, error/refusal checks and output. Consider the [checkpoint split](../databases/sqlite-immutable-checkpoints.md) separately if repeated serialization dominates.
5. For N selections that each derive keys for M fixed historical records, compute historical keys once into `Map<key, entries[]>` in original order. Preserve duplicate handling and the original first/last-match rule; keep checks with different predicates. Under expected efficient map access this reduces key derivations from N×M to N+M, not necessarily total runtime. Rebuild or invalidate the map if history can change; account for memory cost.
6. Compare complete outputs and canonical fingerprints before and after on the same input revision. Run the project's necessary regression checks; equal fingerprints alone do not establish unchanged external effects or failure behavior. Then measure end-to-end time under the same conditions.

## Evidence and limits

The profiler flag is documented; the attribution, caching and index procedures are proposed practices. Captures report wrapper-time misattribution and later successful optimizations, but their operation counts, speedups and replay results were not reproduced and are deliberately not published as measured outcomes. No universal API-concurrency recommendation or latency gain follows from them.

## Define completed units before reporting efficiency

**Documented, checked November 7, 2026:** [Node 24 `performance.now()`](https://nodejs.org/docs/latest-v24.x/api/perf_hooks.html#performancenow) uses the current process start as zero. [FinOps unit economics](https://www.finops.org/framework/capabilities/unit-economics/) recommends meaningful usage/output units and collecting the denominator during development; [allocation guidance](https://framework.finops.org/framework/capabilities/allocation/) describes fixed, proportional and proxy-based sharing. These support the following proposed workflow model, not a mandatory FinOps definition of completion.

**Proposed:**

- Report end-to-end elapsed time, union of observed active intervals, accumulated operation duration and explicitly observed waiting separately. Use process-relative monotonic durations within a process and UTC correlation timestamps across processes; retain restart/clock uncertainty. Overlapping parent/child durations must not be summed into wall time.
- Name the denominator beside each average. Count unique verified delivered outputs once; report attempts, failures, reuse and rework separately. Repeated verification does not create another output. Keep phase processing averages distinct from delivery efficiency and individual-unit latency distributions.
- Keep phase (mapping, upload, verification) separate from purpose (initial work, setup, review, remediation). Show the chosen productive cohort alongside all recorded expenditure, and retain normal retry costs even when an attempt fails.
- Count a shared asset once in the total. If assigning its cost to pages, record the allocation policy, conserve the total and leave unattributed work visible. An allocation is not a direct per-page measurement.

Pair this with [accounting evidence](../tooling/workflow-accounting-evidence.md) and [observation granularity](../tooling/vendor-operation-observability.md). No timing model, allocation implementation or throughput improvement was exercised. Historical source-review observations and incidental package versions are not benchmark or compatibility evidence.
