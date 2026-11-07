---
title: "Preserve granularity when observing vendor operations"
format: "playbook"
domain: "tooling"
aliases: ["opaque CLI telemetry", "operation attribution", "bounded metric labels"]
evidence_date: "2026-11-07"
reviewed_at: "2026-11-07"
applicability: "Proposed instrumentation for direct API calls and opaque vendor CLI or SDK operations; verify the deployed tool and telemetry schema"
provenance: "Official Prometheus instrumentation, OpenTelemetry sensitive-data and Claude Code monitoring pages read 2026-11-07; direct URLs below are not a source registration; sanitized instrumentation proposals"
status: "current"
versions: []
---

# Preserve granularity when observing vendor operations

## When to use this

Use when direct requests and vendor-managed CLI/SDK work appear in one workflow report. A wrapper's observation is not automatically a measurement of its internal requests.

## What to do

**Proposed procedure:**

1. Label each observation as a measured request, native provider usage, or CLI summary. Separate a logical operation from its attempts. A successful CLI exit or synthetic summary row cannot establish exact internal request counts, request durations or retries.
2. Prefer supported vendor usage/lifecycle interfaces. Preserve retries, concurrency, authorization and recovery behavior; do not replace or proxy the operation just to manufacture finer telemetry. Keep unavailable detail explicit.
3. Carry concurrency-safe operation context across dispatch, independent readback and reconciliation so verification cost is included and parallel operations do not inherit each other's attribution.
4. Keep granular entity IDs in access-controlled local records or appropriately protected traces; use bounded dimensions in monitoring metrics. Export only allowlisted metadata, including for vendor-native telemetry. Exclude credentials, content, raw prompts and private resource locators. A native exporter does not remove the need to inspect its actual fields.
5. Persist compact accounting records without adding blocking work inside an authorization-sensitive dispatch sequence. Measure overhead and crash completeness before claiming reliable accounting; connect usage records to the [accounting evidence model](workflow-accounting-evidence.md).

## Evidence and limits

**Documented:** [Prometheus instrumentation](https://prometheus.io/docs/practices/instrumentation/#do-not-overuse-labels) explains that label combinations create time series and recommends alternatives for high cardinality. [OpenTelemetry sensitive-data guidance](https://opentelemetry.io/docs/security/handling-sensitive-data/) calls for data minimization and review of instrumentation-emitted attributes. [Claude Code monitoring](https://code.claude.com/docs/en/monitoring-usage) exposes usage/request telemetry and content/identity controls; default-off content settings do not establish that all emitted attributes are safe for a given organization.

The local-record strategy, context propagation and dispatch placement are proposed application designs. Native fields and control availability must be checked against the installed CLI; Claude documentation establishes no equivalent support in other vendors. No adapter was changed, vendor telemetry enabled, attribution defect reproduced or overhead/crash test run. Historical static-review reports of missing readback context and synthetic CLI summaries motivate the proposals without proving a fix.
