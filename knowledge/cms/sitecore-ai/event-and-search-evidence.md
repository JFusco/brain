---
title: "Verify webhook selection and search freshness separately"
format: "playbook"
domain: "cms/sitecore-ai"
aliases: ["publishing webhook filters", "search heartbeat", "index freshness"]
evidence_date: "2026-11-09"
reviewed_at: "2026-11-09"
applicability: "SitecoreAI webhook integrations and separately deployed Sitecore Search operations; target releases and configuration must be identified"
provenance: "sitecoreai-docs@9fd006f795cca43a5e859d3a227d03693b965bc1df04046bf18d0654e36695d4; official webhook overview read 2026-11-09; sanitized private operational recommendations; search procedure is proposed, not vendor-verified behavior"
status: "current"
versions: []
---

# Verify webhook selection and search freshness separately

## When to use this

Use when downstream work depends on a publishing rule, or when a search job error is being treated as proof of stale content. SitecoreAI webhooks and Sitecore Search are separate surfaces; one test does not certify the other. Migration write/readback remains in the [native-state guidance](import-readback-against-native-state.md).

## What to do

### Test webhook selection

**Documented:** the [webhook overview](https://doc.sitecore.com/sai/en/developers/sitecoreai/content-modeling-and-presentation/workflow/webhooks.html) describes event/workflow notifications sent as HTTP POST requests to external endpoints. It places custom processing in the receiving service.

**Proposed:** record the environment, release, event, configured conditions and receiver. Test both a matching and a nonmatching publication, keeping configuration, payload and delivery evidence together. If selection differs from expectations, investigate that exact rule and evaluate explicit validation in the receiver before costly or consequential work. Preserve the existing authentication and authorization checks. An unverified report of unexpected delivery is not a universal rule-engine defect or a resolved support case.

### Establish search freshness independently

**Proposed:** record source IDs, environments, timestamps, exact job errors and a known recently published item's identity. Check whether that item reaches the intended index/query surface. Separate job failure from query freshness and retain corrections beside earlier reports. Similar failures across environments or organizations are an escalation signal, not proof of shared infrastructure failure. Do not combine separate historical reports into one incident without evidence tying them together.

## Evidence and limits

Neither workflow was exercised in a connected environment. No heartbeat root cause, same-day freshness guarantee, webhook defect or support resolution is established. Historical incident details are intentionally omitted; only the bounded evidence-gathering procedures are proposed. Search-specific vendor configuration and release behavior still require their own official documentation before changes.
