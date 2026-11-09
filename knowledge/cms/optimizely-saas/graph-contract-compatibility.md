---
title: "Check Graph client compatibility and shared contracts"
format: "playbook"
domain: "cms/optimizely-saas"
aliases: ["Graph client upgrade", "shared Graph interface", "CMS Contracts"]
evidence_date: "2026-11-09"
reviewed_at: "2026-11-09"
applicability: "Optimizely CMS SaaS and Graph; client packages and releases must be identified separately, including projects using @remkoj/optimizely-graph-client"
provenance: "optimizely-cms-saas-docs@ae548b9dfcc952b0ce044cc0331517c2155d9a8da61cacb1b11285231415ac9e; official Create contracts page read 2026-11-09; sanitized private compatibility and schema-experiment recommendations"
status: "current"
versions: []
---

# Check Graph client compatibility and shared contracts

## When to use this

Use when a SaaS change may affect a Graph client, or several content types need a common query interface. Keep the Graph client, CMS schema and rendering SDK distinct; the [SDK component playbook](sdk-component-contracts.md) covers component props and registration instead.

## What to do

1. **Proposed compatibility check:** inventory the installed client package and version, the target CMS environment and available release guidance. Evaluate applicable warnings against current supported releases, then validate public rendering and CMS preview separately. Record symptoms and changes without assuming an empty page or missing-component message proves a particular client defect. Include this check in SaaS-change monitoring.
2. **Documented contract mechanism:** [Create contracts](https://docs.optimizely.com/cms-saas/docs/create-contracts) describes shared properties across content types and a corresponding Graph schema/query interface. It says to create the properties on the content types before applying the contract.
3. **Proposed schema pilot:** choose representative development content, compare property definitions and settings, apply the candidate contract in an authorized test environment, and inspect both preserved content and actual Graph queries. Matching property names alone do not establish compatible definitions or a safe migration. Preserve rollback evidence before broad adoption.

## Evidence and limits

No package upgrade, Graph query or schema experiment was performed. A historical participant warning named an older minimum client version and linked a release-candidate README; neither establishes today's compatible version or a requirement to install that candidate. Those numbers and reported success are deliberately not adopted as guidance. Select a current target from the applicable package/vendor evidence. A version-like documentation URL is not evidence of the tested runtime release. The documented Contract mechanism supports the proposed pilot, not a guarantee that arbitrary existing types can adopt it unchanged.
