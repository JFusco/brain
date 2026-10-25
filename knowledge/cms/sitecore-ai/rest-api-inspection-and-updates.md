---
title: "Inspect SitecoreAI content models before REST updates"
format: "playbook"
domain: "cms/sitecore-ai"
aliases: ["Content Types API", "Components API", "Content Items API", "REST PUT removes fields", "automation client"]
evidence_date: "2026-10-24"
reviewed_at: "2026-10-24"
status: "current"
versions: []
applicability: "SitecoreAI v1 Components, Content Types and Content Items REST APIs as published on 2026-10-24, plus the Authoring and Management GraphQL API; confirm the current OpenAPI contract and target environment before connected use"
provenance: "sitecoreai-docs@70bb71bac4acc8a15e85e2f8ec2e11ed186d309fd527df48fdf956c43ce473f6; official SitecoreAI v1 OpenAPI bundles read 2026-10-24 (components-api sha256 a825622c5c18, content-types-api sha256 8a6826de7bcf, content-items-api sha256 5f23e27e54a1), not a registered source; sanitized private capture recommendations, no connected CMS check"
---

# Inspect SitecoreAI content models before REST updates

## When to use this

Use this when a tool or migration reads or changes SitecoreAI content types, components or content items through the v1 REST APIs. It also applies when choosing between REST checks and the Authoring and Management GraphQL API for template provisioning. The documented facts below come from the v1 OpenAPI contracts. The workflow is proposed practice and was not run against a connected environment during curation.

## What to do

### Know what each REST update replaces

**Documented:** the [Content Types](https://api-docs.sitecore.com/sai/content-types-api), [Components](https://api-docs.sitecore.com/sai/components-api) and [Content Items](https://api-docs.sitecore.com/sai/content-items-api) v1 APIs share the server `https://edge-platform.sitecorecloud.io/authoring` and bearer authentication. Their full-replacement operations differ from `PATCH`:

| Operation | Documented effect |
| --- | --- |
| Content type `PUT` | Updates the whole content type; existing fields not provided in the request are removed |
| Content item `PUT` | Fully replaces the item; fields omitted from the request are cleared |
| Content item `PATCH` | Changes only the properties and fields present in the request body |
| Component draft `PUT` | Replaces all user-editable fields; the entire Variants collection is replaced, removing variants not in the request |

Only the content item `PATCH` is documented as partial. Content type, component and component-draft `PATCH` operations are described only as updates; their merge behavior is not stated, except that the draft `PUT` description says it, unlike `PATCH`, replaces the entire Variants collection.

**Proposed:** never send a `PUT` built from a partial model, a filtered read or a planned subset of fields. An add-only or incremental tool should not use full-replacement routes at all. Where an update is required, prefer the content item `PATCH` for items and read the resource back. For content type, component and component-draft `PATCH`, confirm the merge behavior in a non-production environment before relying on it.

### Start with bounded read-only inspection

**Documented:** the Content Types list operation accepts one or more `id` query parameters; `search` and `id` are mutually exclusive, and when `id` is supplied only the first 50 IDs are processed and pagination is disabled. Most content type operations, including retrieve, `PUT` and `PATCH`, describe `environmentId` as defaulting to `main`, with only `main` currently supported; the list operation states no default. The Components API exposes component details, metadata, drafts, activation and the sites where a component is allowed (`GET /api/v1/components/{componentId}/sites`). The Content Items API includes hierarchy, validation and translation operations.

**Proposed:** inspect the specific IDs a reviewed plan names rather than searching by name. Compare each response's identity with the requested ID. Report expected-versus-actual differences in fields, field sources, datasource bindings or allowed sites as findings for review. Treat request failures, identity mismatches, malformed responses and a 404 for an item expected to exist as failed checks. Report new targets that the plan creates later as not inspected; they are not passes.

### Confirm credentials and environment first

**Documented:** the Content Types API reference authorizes requests with environment automation client credentials, created in the Cloud Portal Deploy app under **Credentials > Environment**, exchanged for a JSON Web Token. Creating client credentials requires an Organization Admin or Owner. Sitecore's [JWT procedure](https://doc.sitecore.com/sai/en/developers/sitecoreai/deploying-sitecoreai/deploy-app/managing-sitecoreai-client-credentials/create-a-json-web-token-for-the-authoring-and-management-api-or-the-deploy-api.html) covers the Authoring and Management and Deploy APIs.

**Proposed:** before any connected check, confirm the automation client belongs to the intended non-production environment and that the Authoring GraphQL endpoint targets the same environment. In a migration, confirm whether granted access covers the legacy source or the SitecoreAI destination. Fixture tests, mocked responses and hosted CI results do not establish live API compatibility.

### Provision templates through the GraphQL Authoring API

**Documented:** the [Authoring API examples](https://doc.sitecore.com/sai/en/developers/sitecoreai/content-modeling-and-presentation/sitecore-authoring-and-management-graphql-api/query-examples-for-authoring-operations.html) include a `createItemTemplate` mutation with template sections, and item queries returning item IDs and paths.

**Proposed:** keep template provisioning additive. Do not delete, rename or retype existing items from a provisioning run. Discover well-known parent items through documented queries or introspection rather than hard-coding GUIDs copied from another environment. Create all templates before setting standard values that reference them, such as insert options naming a template declared later in the plan. Report unautomated settings, such as Available Renderings or rendering parameters templates, as manual follow-ups rather than implying they were configured.

## Evidence and limits

The OpenAPI bundles and API reference pages were retrieved on the evidence date; `api-docs.sitecore.com` is not a registered Brain source, so a change there will not flag this note automatically. Recheck the current contracts before acting. The workflow was not exercised against a connected SitecoreAI environment. Private tool outcomes, test counts and pull request states are deliberately not adopted as public results. No `PATCH` merge semantics beyond content items, path-based lookup support or ordering requirement beyond the cited examples is asserted.

The [migration evidence playbook](migration-evidence-and-dependencies.md) covers serialization versus Authoring API transport, deferred media and acceptance reporting. This note covers REST update semantics and read-only inspection only.
