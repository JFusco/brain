---
title: "Keep workflow accounting separate from sampled traces"
format: "playbook"
domain: "tooling"
aliases: ["usage accounting", "cost basis", "reproducible cost report"]
evidence_date: "2026-11-07"
reviewed_at: "2026-11-07"
applicability: "Proposed local batch and migration accounting; provider usage and billing contracts must be checked separately"
provenance: "Official OpenTelemetry sampling, Claude Code monitoring and FOCUS 1.4 invoice-alignment pages read 2026-11-07; direct URLs below are not a new catalog registration; sanitized unexercised design proposals"
status: "current"
versions: []
---

# Keep workflow accounting separate from sampled traces

## When to use this

Use when a workflow must explain cost per completed unit while also diagnosing latency and failures. Check [elapsed time and output units](../performance/batch-time-and-history-indexes.md) separately from monetary evidence.

## What to do

**Documented:** [OpenTelemetry sampling](https://opentelemetry.io/docs/concepts/sampling/) can omit traces/spans from processing and export. [Claude Code monitoring](https://code.claude.com/docs/en/monitoring-usage#cost-monitoring) describes cost metrics as approximate and points to billing for official charges. [FOCUS 1.4 invoice alignment](https://focus.finops.org/docs/specification/v1-4/features/billed-cost-and-invoice-alignment/) concerns payable totals and their billing periods.

**Proposed procedure:**

1. Keep deduplicated, unsampled usage records as the local accounting evidence; derive diagnostic views from them. Do not reconstruct exact charges solely from sampled traces. Unsampled collection still needs completeness checks and provider reconciliation; it does not itself establish invoice accuracy.
2. Store usage quantities separately from immutable dated pricing assumptions. Label API-equivalent estimates, provider-reported amounts and invoice-reconciled charges as different cost bases. Select a basis for totals rather than adding alternative valuations of the same work. Missing usage or prices remain unknown; report known subtotals and coverage rather than substituting zero.
3. Make replay inputs explicit: evidence cutoff and hashes, parser/accounting version, price-card digest and allocation policy. Revised evidence or prices produce a distinguishable report and preserve the earlier result.
4. Start with a small local record/report path. A remote telemetry backend or full billing integration is not required to establish useful unit accounting. If invoice reconciliation is absent, label that limit instead of calling estimates charges.

## Evidence and limits

Exact accounting independence is a design inference from the documented sampling and cost-basis limits, not an OpenTelemetry accounting standard or a claim of FOCUS compliance. No accounting implementation, crash-completeness test or bill reconciliation was performed. Historical static-review details and incidental runtime versions are not adopted as compatibility or successful-delivery claims. Keep collection detail and privacy boundaries in [vendor-operation observability](vendor-operation-observability.md); provider billing rules remain provider-specific.
