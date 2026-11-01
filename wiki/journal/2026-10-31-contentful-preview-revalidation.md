---
title: "Revalidate Contentful Preview guidance"
topics: ["automatic-knowledge-maintenance"]
plans: ["2026-10-31-revalidate-contentful-preview-guidance-a6ef0f50b0.md"]
---

# Revalidate Contentful Preview guidance

[Issue 288](https://github.com/JFusco/brain/issues/288) updates the existing Contentful Preview note after the approved catalog refresh in [PR 287](https://github.com/JFusco/brain/pull/287). The pinned API guide and Preview example were retrieved and compared with the live official API overview. Preview still excludes Sync despite the skill's conflicting example; regional hosts, distinct Preview credentials and content-state scope remain explicit.

The note now presents one current claim comparison instead of repeated historical revalidation paragraphs. Earlier evidence remains in Git history. Application verification is labeled proposed and unexercised; no SDK, authenticated space or connected runtime was tested.

The change is limited to the existing note and same-delivery wiki records. Fresh independent content review, exact-head checks and the nightly publication/completion gates remain required. See [automatic knowledge maintenance](../topics/automatic-knowledge-maintenance.md).
