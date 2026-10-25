---
title: "Backlog batch 2"
date: "2026-10-24"
topics: ["automatic-knowledge-maintenance"]
---

# Backlog batch 2

Joe requested the second thin-domains-first backlog session after [batch 1](2026-10-24-sitecore-ai-backlog-batch-1.md). `curation stale --limit 12` reported no stale notes. Twelve captures were reviewed individually: the five remaining SitecoreAI captures (excluding the one already held for a frontend batch), both Contentful captures and the first five Contentstack captures. None was quarantined.

[Issue 217](https://github.com/JFusco/brain/issues/217) adds [Verify SitecoreAI imports against native state](../../knowledge/cms/sitecore-ai/import-readback-against-native-state.md). It covers effective standard values, grouped datasource parents whose revisions advance after child edits, and consistent identity and projection in readback hashes. The [migration evidence playbook](../../knowledge/cms/sitecore-ai/migration-evidence-and-dependencies.md) gains an upload-route section that separates per-file authoring uploads from environment transfer. Documented passages were checked against current SitecoreAI pages; connected-import results are labelled as observations from one tool. A claimed editor ZIP batch upload was left out because the current upload pages do not state it.

The Contentful and Contentstack captures were project delivery logs and tool conventions without reusable CMS guidance. One SitecoreAI-tagged capture holds agent SDK lessons rather than CMS guidance and stays pending for an `_unsorted` batch. Captures are resolved only after merge and successful verification on `main`. No connected CMS check was run.
