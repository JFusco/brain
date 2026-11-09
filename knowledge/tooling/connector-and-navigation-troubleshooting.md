---
title: "Separate connector identity from navigation changes"
format: "playbook"
domain: "tooling"
aliases: ["connector migration", "missing app feature", "MCP support routing"]
evidence_date: "2026-11-09"
reviewed_at: "2026-11-09"
applicability: "Proposed troubleshooting for managed app connectors and feature discovery; confirm the actual app, platform, build and service owner"
provenance: "Official Atlassian support ownership page read 2026-11-09 at a rolling URL outside the registered catalogs; sanitized private troubleshooting recommendations, no verified connector migration or current Claude UI path"
status: "current"
versions: []
---

# Separate connector identity from navigation changes

## When to use this

Use when a connector stops working during a migration or an app feature appears missing. A changed display name, endpoint, version and navigation location are different facts. This is not an installation procedure or permission to remove configurations.

## What to do

1. **Proposed inventory:** record the active connector's service owner, supported endpoint/protocol, client version and current display name. Match the intended replacement to vendor guidance; labels such as v1 or v2 in a report are not verified protocol versions.
2. **Proposed migration check:** identify overlapping configurations and their consumers. Retire superseded duplicates only through the authorized managed migration, preserving required access and recovery information. Read back the resulting configuration and exercise the intended operation before claiming recovery. A suspected conflict alone does not prove root cause.
3. **Proposed feature discovery:** check current navigation, app build/platform, availability and account permissions before concluding that access was removed. Record the verified path and date in support guidance. A historical user-reported resolution or an unread screenshot does not establish the current menu location.
4. **Documented support routing:** [Atlassian's ownership guidance](https://support.atlassian.com/rovo/kb/get-help-with-marketplace-forge-and-mcp-agents-in-atlassian-cloud/) distinguishes Atlassian-operated services, Marketplace partners, custom developers and third-party MCP providers. **Proposed:** send the responsible support owner the affected surface, time, error/request ID and safe reproduction details; exclude credentials and unrelated private content.

## Evidence and limits

No connector was installed, removed or tested, and no current app navigation was inspected. Historical connector labels, rename reports and a reported feature-discovery success are omitted as current instructions. The linked support page is outside Brain's registered sources, so catalog revision changes will not automatically track it; reopen it before routing a case. For CLI-call settings rather than connector identity, use the [invocation contract](agent-cli-invocation-contract.md).
