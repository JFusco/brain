---
title: "Page title"
format: "note"
domain: "nextjs"
aliases: []
evidence_date: "YYYY-MM-DD"
applicability: "Product versions, project conditions, and limits"
provenance: "Exact official source-id@revision values plus a sanitized description of other evidence; no inbox IDs"
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

For a practical playbook, use `format: "playbook"` and give an ordered procedure.
Add `## Where guidance differs` when documented conditions select different
recommendations. Name the relevant versions, product surfaces or evidence gaps;
do not invent a conflict from similar titles or links. Label an unexercised
workflow as proposed practice, separately from its documented supporting facts.

## Evidence and limits

Distinguish observed outcomes, verified documentation, and suggestions. State what has not been checked and when the advice does not apply. Keep client identifiers, private source paths, raw transcripts, and secrets out of the page. Cite official sources as `source-id@revision` in `provenance` so a source change flags the note for review.

When advice becomes obsolete, retain its exact history with `status: "superseded"` and `superseded_by: "knowledge/domain/replacement.md"`, or `status: "retired"` when there is no replacement. Publish the status change through an ordinary knowledge PR. Changing a source hash alone never revalidates a claim.
