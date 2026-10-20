---
title: "Contentstack kickstart skill applicability"
topics: [automatic-knowledge-maintenance]
---

# Contentstack kickstart skill applicability

[Issue 91](https://github.com/JFusco/brain/issues/91) documents the scope of the vendor's contentstack-kickstart skill after Joe asked whether it applies to arbitrary Contentstack projects. The skill explicitly targets the Next.js SSR starter; inspected code establishes its file paths, seeded content shapes, SDK choices and preview setup. Official guidance independently supports conditional server-request isolation and rendering-mode-specific Live Preview integration.

The new note separates reusable decisions from starter conventions, records a same-commit mismatch between the skill's endpoint dependency name and the implementation's Contentstack Utils import, and distinguishes declared dependency ranges from installed/runtime evidence. Upstream main matched the approved pin when checked; no vendor code, CMS connection or project installation was executed.

The Contentstack hub gains the note through curation hubs. Existing CMS routing guidance covers product/source selection rather than this starter applicability decision, so it is linked rather than duplicated. A fresh separate content review, exact-head preparation, Wiki integrity and guarded merge precede final main/merged-byte completion. This focused manual documentation run leaves the daily 5 p.m. schedule, source registrations, captures and other projects unchanged. Rollback is reverting the knowledge PR; receipts stay local.
