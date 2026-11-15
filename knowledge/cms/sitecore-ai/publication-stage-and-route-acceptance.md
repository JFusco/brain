---
title: "Match SitecoreAI acceptance to publication stage"
format: "playbook"
domain: "cms/sitecore-ai"
aliases: ["null layout", "Preview versus Delivery", "workflow publish effects", "GUID controls"]
evidence_date: "2026-11-15"
reviewed_at: "2026-11-15"
applicability: "SitecoreAI Preview and Experience Edge Delivery GraphQL plus configured workflow actions; verify tenant schema and settings; frontend SDK version unknown"
provenance: "sitecoreai-docs@a8f7324324b6fe528dba425e735432f2b5b5d1de1c620b7ef48c752441d9d375; official Preview, Delivery, query/schema, publishing restriction and workflow-action pages read 2026-11-15; sanitized unexercised capture proposals"
status: "current"
versions: []
---

# Match SitecoreAI acceptance to publication stage

## When to use this

Use when validating unpublished migration content, diagnosing a null route layout, or preparing a narrowly authorized publication. The [migration evidence playbook](migration-evidence-and-dependencies.md) covers transport, media and compiler acceptance; this note covers the acceptance surface and the effects of releasing content.

## What to do

### Select the surface before interpreting a failure

**Documented:** the read-only [Preview API](https://doc.sitecore.com/sai/en/developers/sitecoreai/experience-edge/experience-edge-apis/preview-graphql-api.html) serves draft and published content from the content management instance for development and non-production use. The read-only [Delivery API](https://doc.sitecore.com/sai/en/developers/sitecoreai/experience-edge/experience-edge-apis/delivery-graphql-api.html) serves published content from Experience Edge.

**Proposed:** when publishing is paused, record Authoring identity/placement, exact site-route-language Preview results and actual Editor/clean-preview behavior separately. Keep Delivery acceptance deferred until publication is authorized. An API Preview result does not certify an editor preview or frontend rendering. If a shared Delivery verifier needs checking, use separately authorized existing published controls and label that result as verifier evidence, not Delivery of the new content. Do not publish merely to satisfy a gate selected for the wrong lifecycle stage.

### Diagnose a null layout with identity controls

**Documented:** Sitecore's [query examples](https://doc.sitecore.com/sai/en/developers/sitecoreai/experience-edge/experience-edge-apis/query-examples-for-the-delivery-graphql-api.html) accept an item path or GUID in `item(path: ...)`; the [schema](https://doc.sitecore.com/sai/en/developers/sitecoreai/experience-edge/experience-edge-apis/the-experience-edge-schema.html) describes layout lookup by site, route path and language. Confirm fields against the target schema.

**Proposed:** pin the endpoint and language, then compare a direct intended-item GUID lookup, a known existing control and the explicit layout query with fresh Authoring identity/path. Use sequential reads, admitted hosts, no redirects and explicit request bounds. Interpret these branches as hypotheses requiring their own evidence:

- Intended GUID absent while the control is present: investigate availability on that surface before changing routes.
- GUID present at an older published path: compare published placement with authored placement.
- GUID present at the expected path but layout null: investigate that surface's layout, site definition and language.

A null response does not establish that an item was never published, identify a failed publishing job, or authorize a content move, cache purge, index rebuild or publication. Identity checks do not replace eventual route, Editor, Preview and rendered-content acceptance. Historical browser evidence is not a current pass.

### Inspect the workflow's effects before advancing it

**Documented:** [publishing restrictions](https://doc.sitecore.com/sai/en/users/sitecoreai/manage-content/content-editor/publishing/set-up-publishing-restrictions-for-an-item.html) require an item assigned to a workflow to reach its final state before it is publishable. The same page warns that Content Editor preview can fail for non-publishable items; that UI restriction is distinct from Preview GraphQL's draft-content capability. Empty scheduling fields alone therefore do not establish eligibility.

**Documented:** the standard [Auto Publish action](https://doc.sitecore.com/sai/en/developers/sitecoreai/content-modeling-and-presentation/workflow/workflow-reference/standard-and-custom-actions.html) supports options for children, related items, languages and publishing targets. Omitting targets selects all configured publishing targets; it does not identify which targets an environment has.

**Proposed:** read the assigned workflow, current state, commands and enabled actions before transition. Determine affected datasource items, automatic publication, target/language parameters and webhook or notification destinations. A name or action type is a clue, not proof of every runtime effect. Scope permission to the evidenced effects rather than assuming approval for one page covers every action.

Preserve the original execution lineage and drift refusal. If a planner derives the entire historical import, do not hand-filter its plan or add an alternate writer to manufacture a narrow pilot. First prepare a supported current scope with explicit dependencies and request budgets. Confirm notification and publication effects separately after any authorized execution.

## Evidence and limits

The official pages establish API and action contracts, not a connected tenant's behavior. All diagnostic and release procedures above are proposed practices; no CMS read/write, workflow transition, notification, publication or frontend test was performed during curation. Historical capture reports about specific draft items, controls, workflow configuration and withheld publication are deliberately omitted as incident-only outcomes. Their reusable decision rules are retained without claiming those outcomes were reproduced. Incidental CLI runtime versions do not establish frontend SDK compatibility, which remains unknown.
