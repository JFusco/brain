---
title: "Confirm Launch allowance scope before consolidating sites"
format: "playbook"
domain: "cms/contentstack"
aliases: ["Launch quotas", "multisite hosting capacity", "Launch entitlement"]
evidence_date: "2026-11-09"
reviewed_at: "2026-11-09"
applicability: "Contentstack Launch capacity planning; the organization's current agreement, plan and project configuration determine applicable allowances"
provenance: "contentstack-docs@1bbcba6a610fa0f5d9e5da1016725d7462d0a92c09ef754a2747f506db6abcb9; official Launch definitions page read 2026-11-09; sanitized private planning recommendation, no contract or tenant validation"
status: "current"
versions: []
---

# Confirm Launch allowance scope before consolidating sites

## When to use this

Use before placing multiple sites in a shared Launch project/repository or estimating their combined resource demand. A quoted allowance from another license is not a quota for the target organization.

## What to do

**Documented:** [Launch definitions](https://www.contentstack.com/docs/launch/launch-definitions-and-core-concepts) distinguishes build and server execution time, describes GB-hours, and directs plan-specific allocations to the applicable Services Description or representative. It describes origin-to-CDN bandwidth separately from overall Contentstack organization bandwidth. Its statement that build and server execution draw from the same allocation must not silently override different terms in an applicable agreement.

**Proposed planning procedure:**

1. Record the applicable agreement, measurement period, unit and aggregation level for each resource: organization, project or environment. Separate build time, server execution, origin bandwidth, domains and environments.
2. Confirm hard limits, fair-use treatment, throttling, overage charges and the approval path for increases independently. No hard technical enforcement does not mean there is no entitlement limit or billable usage.
3. Resolve contradictions explicitly, such as an organization-wide allowance described alongside a per-project domain count. Obtain current terms before treating either as a capacity input.
4. Measure expected combined builds and runtime demand, payload sizes, request rates, timeouts and cache/revalidation behavior. Verify that the intended repository, routing and project arrangement supports both sites; a capacity quotation does not establish deployment compatibility.
5. Keep contractual scope and measured workload together in the decision record. Compare consolidation with separate projects using the same demand assumptions and operational requirements.

## Evidence and limits

No license, tenant, invoice or deployment was inspected. Private quoted allowances, promises about overage invoices and discretionary increases are deliberately omitted. This is a planning proposal, not a current quota table or legal interpretation. Conflicting documentation and agreement wording needs confirmation from the responsible commercial/support owner before reliance. No universal multisite compatibility or performance claim follows.
