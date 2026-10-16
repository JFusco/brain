---
title: "Page title"
domain: "nextjs"
aliases: []
evidence_date: "YYYY-MM-DD"
applicability: "Product versions, project conditions, and limits"
provenance: "Sanitized candidate IDs and exact official source IDs/revisions"
status: "current"
versions: []
reviewed_at: "YYYY-MM-DD"
---

# Page title

## When to use this

Name the concrete task or decision and relevant product versions or project conditions.

Use optional `versions` constraints such as `"next@>=16.2"` or `"tailwindcss@4"` only when the whole note has that scope. Unsupported or unknown ranges must not be described as confirmed compatibility. `review_after` may set an explicit ISO review date; otherwise review is due 30 days after `reviewed_at` or `evidence_date`.

## What to do

Give the smallest actionable procedure and explain why it helps. Link existing guidance instead of duplicating it.

## Evidence and limits

Distinguish observed outcomes, verified documentation, and suggestions. State what has not been checked and when the advice does not apply. Keep client identifiers, private source paths, raw transcripts, and secrets out of the page.

When advice becomes obsolete, retain its exact history with `status: "superseded"` and `superseded_by: "knowledge/domain/replacement.md"`, or `status: "retired"` when there is no replacement. Publish the status change through the same proposal/PR process. Changing a source hash alone never revalidates a claim.
