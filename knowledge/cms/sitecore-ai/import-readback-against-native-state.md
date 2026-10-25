---
title: "Verify SitecoreAI imports against native state"
format: "playbook"
domain: "cms/sitecore-ai"
aliases: ["standard values", "Reset Blank", "_PublishingGroupingTemplate", "readback hash", "GUID format"]
evidence_date: "2026-10-24"
reviewed_at: "2026-10-24"
status: "current"
versions: []
applicability: "Content imports into existing SitecoreAI templates through the Authoring and Management GraphQL API; SitecoreAI service build unknown; connected observations come from one migration tool and are not general compatibility claims"
provenance: "sitecoreai-docs@70bb71bac4acc8a15e85e2f8ec2e11ed186d309fd527df48fdf956c43ce473f6; relevant official pages read 2026-10-24; sanitized private connected-import observations, not reproduced during curation"
---

# Verify SitecoreAI imports against native state

## When to use this

Use this when an import writes content into existing SitecoreAI templates and its acceptance check compares readback with the write plan. Planned values can match while the native item differs: inherited defaults remain, a parent revision moves, or a hash compares unlike things. These checks complement the [migration evidence playbook](migration-evidence-and-dependencies.md), which covers planning, transport and media.

## What to do

### Read effective standard values, not only field definitions

**Documented:** Sitecore's [standard values](https://doc.sitecore.com/sai/en/developers/sitecoreai/content-modeling-and-presentation/data-templates/standard-values-for-data-template-fields/standard-values-for-data-template-fields.html) supply a field's value when the item's value is NULL. They can be inherited from any base template. When several templates set one, the first template in the inheritance list wins. Tokens such as `$name` are replaced only at item creation and are not re-evaluated on rename. A blank value differs from NULL: a cleared field shows blank, not the standard value, unless the field definition's **Reset Blank** option turns blanks into NULL. The [Authoring API examples](https://doc.sitecore.com/sai/en/developers/sitecoreai/content-modeling-and-presentation/sitecore-authoring-and-management-graphql-api/query-examples-for-authoring-operations.html) update fields with `reset: false`.

**Observed (one migration tool, unverified elsewhere):** field-definition default values were empty while the template's standard-values item held non-empty values. Reading the standard-values item in the target language, with its effective fields, exposed inherited metadata, images and actions that the planned write did not mention.

**Proposed:** give the mapper the effective standard values separately from field-definition defaults. List non-empty inherited business values that the plan omits for review, rather than leaving them silently. Treat explicit blanks and overrides as intentional assignments, and check the field's Reset Blank setting before proposing a clear. After import, check all relevant business fields, including retained defaults. Report planned-value coverage separately from full content acceptance.

### Re-verify grouped datasource parents after child writes

**Documented:** a datasource parent that inherits [`_PublishingGroupingTemplate`](https://doc.sitecore.com/sai/en/developers/sitecoreai/content-modeling-and-presentation/sitecoreai-for-developers/pages-configuration/add-the-manage-items-section-to-pages-for-a-custom-component.html) has its revision changed when a child item is modified, so publishing detects child-only updates. Inserting a child under a parent in a final workflow state creates a new version of the parent.

**Observed (one migration tool, unverified elsewhere):** approved child edits advanced the parent's revision and audit timestamp without changing its business values. The parent had been verified before the child writes, so its recorded outcome was stale at the final audit.

**Proposed:** discover the template inheritance and record the parent's before-state before dispatch. Verify the parent again after owned child operations. Record an explained native effect explicitly, keep earlier observations, and base a whole-run claim on final native state rather than each operation's immediate readback. Unexplained revision, identity, content or structural drift should still stop the run. Do not treat every parent revision change as safe, or infer grouping from a component name.

### Compare readback hashes on a consistent basis

**Documented:** the Authoring API examples pass item IDs in braced, hyphenated GUID form and return `itemId` as a compact 32-character string.

**Observed (one migration tool, unverified elsewhere):** a sparse read of only planned fields changed its payload hash when assignments were added, although identity and revision were unchanged. A media upload result and later item reads also spelled the same GUID differently, producing false conflicts.

**Proposed:** normalize GUIDs only to prove identity, and keep stored identifiers and earlier hashes unchanged. Compare an update's before-state using the original baseline's field set; never reinterpret an old hash with a larger projection. Keep the final expanded readback as a separate result. Do not remove revision checks or adopt a changed destination to clear a conflict. A hash match is meaningful only when identity representation and field projection are comparable.

## Evidence and limits

The documented passages were read on the evidence date. The observations come from sanitized private notes from one connected migration tool; they were not reproduced during curation, and its service build and versions are not adopted as applicability. The proposals describe evidence checks, not a verified recovery procedure, exactly-once guarantee or production-readiness claim.
