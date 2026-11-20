---
title: "Revalidate model and editor guidance"
date: "2026-11-20"
topics: [automatic-knowledge-maintenance]
plans: [2026-11-20-revalidate-model-and-editor-guidance-419ea8dd2c.md]
---

# Revalidate model and editor guidance

Issue [423](https://github.com/JFusco/brain/issues/423) extends the existing [OpenAI authoring](../../knowledge/tooling/openai-skills-and-rules.md), [model-selection](../../knowledge/tooling/openai-model-selection.md) and [Contentstack editor-guidance](../../knowledge/cms/contentstack/editor-guidance-from-field-definitions.md) notes after checking their cited primary sources.

Reusable developer messages and request-specific instructions have distinct roles in the current OpenAI guidance. Model comparisons distinguish documented advice about consistent inputs and checking time from proposed acceptance checklists and retry-cost accounting. Conversation-prefix continuity is a separate constraint from selecting a model. No model execution, caching measurement or integration test was performed.

Contentstack curriculum uses instruction/help terminology loosely; the native field references distinguish visible Instruction Value, tooltip Help Text and validation. Generated metadata should preserve those separate concepts. No generator extension, CMS mutation or accessibility result is implied.

The knowledge index now matches the repository's local nightly maintenance policy. The pending capture snapshot was empty; unrelated stale-note signals remain. This journal records the authored source comparison, while independent content review, exact-head checks and successful native completion remain separate publication gates.
