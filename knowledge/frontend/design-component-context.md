---
title: "Preserve component meaning when preparing design context"
domain: "frontend"
aliases: ["Code Connect", "component identity", "Figma reuse"]
evidence_date: "2026-10-21"
reviewed_at: "2026-10-21"
status: "current"
versions: []
applicability: "Planning Figma and implementation reuse; actual framework, available Code Connect connection and component API must be checked"
provenance: "Rolling official Figma Code Connect and MCP best-practice pages read 2026-10-21; sanitized proposed practices; no registered revision or native reconstruction proof"
---

# Preserve component meaning when preparing design context

## When to use this

Use this when mapping Figma instances to existing application components or adapting a localized/responsive design. First agree on the [source and acceptance contract](match-evidence-to-claim.md).

## What to do

**Documented:** [Code Connect integration](https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/) can supply component properties, implementation imports, snippets and instructions. Availability depends on the connection, framework and account access; CLI and UI connections provide different detail.

**Proposed:** compare the actual export/API, supported props, variants, instance relationships and assets. Display names or screenshot similarity alone cannot establish the correct reusable component. Pilot a connection on one frequent component and check actual reuse before expanding mappings; publishing a mapping does not prove generated output quality.

**Documented:** [Figma MCP best practices](https://help.figma.com/hc/en-us/articles/34855090823063-MCP-server-best-practices) recommends components, variables, Auto Layout and descriptive structure. **Proposed:** preserve tokens, real assets and responsive intent; check included states and translated wrapping. Do not duplicate a master solely to accommodate wrapping. Verify settled values after changes; a successful setter is not persistence evidence. Stop and resolve uncertain ownership or lineage before replacing structure.

## Evidence and limits

Official pages were read on October 21. These are preparation practices, without a native editing session, installed integration check or Code Connect accuracy benchmark. Private reconstruction observations were not independently validated and supply no general repair algorithm. Geometry equality alone is not a proof of semantic identity. For coordination, see [bounded design preparation](bounded-design-preparation.md).

