---
title: "Clarify CMS branch and publishing decisions"
date: "2026-11-21"
topics: [automatic-knowledge-maintenance]
plans: [2026-11-21-clarify-cms-branch-changes-and-publishing-e1cfb1d811.md]
---

# Clarify CMS branch and publishing decisions

Issue [JFusco/brain#427](https://github.com/JFusco/brain/issues/427) extends existing guidance instead of introducing another overlapping CMS page.

- Contentstack branch comparison and merge affect schemas; generated entry migration is a separate operation with limited coverage. The branch note now separates branch/alias selection, publishing environments, merge strategy, backup recovery and credential cleanup.
- Optimizely shared-block guidance was revalidated against the current blocks page. Publication visibility and editor access remain separate from reuse and folder selection.
- Current official sources support the documented mechanisms. Proposed operational checks, historical pilot reports and account-specific limits remain bounded; no CMS mutation, migration experiment or connected rendering was performed.

The private capture accounting maps all reusable guidance to the branch note and related import note. Independent review of the exact committed diff and successful final native completion remain required before capture acceptance. Other stale signals remain visible. See [automatic knowledge maintenance](../topics/automatic-knowledge-maintenance.md).
