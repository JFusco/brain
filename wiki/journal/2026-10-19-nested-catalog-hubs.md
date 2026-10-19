---
title: "Generated nested CMS hubs in catalog preparation"
topics: [automatic-knowledge-maintenance]
---

# Generated nested CMS hubs in catalog preparation

[Issue 84](https://github.com/JFusco/brain/issues/84) fixes the catalog guard's one-directory hub matcher. A real manual refresh changed the generated Contentful CMS hub and preparation stopped before push. The matcher now recognizes nested domain hubs; safe paths and exact comparison of bytes outside generated sections remain enforced. The original run and failed preparation evidence are preserved, followed by rebase, fresh review and preparation against the repaired main.

Existing runtime/official/wiki checks and the real subsequent preparation provide validation. Tests, fixtures and implementation audits remain deferred. No public knowledge claim, private operational state or source registration changes. Rollback is reverting the matcher; the original failing receipt remains private.
