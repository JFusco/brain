---
title: "Revalidate OpenAI authoring boundaries"
date: "2026-11-14"
topics: [automatic-knowledge-maintenance]
plans: [2026-11-14-revalidate-openai-skill-and-rule-boundaries-b3fb17036b.md]
---

# Revalidate OpenAI authoring boundaries

The stale-first review for [issue 383](https://github.com/JFusco/brain/issues/383) re-read the official skill, AGENTS.md, command-rules and prompt-engineering pages linked by the existing [OpenAI authoring note](../../knowledge/tooling/openai-skills-and-rules.md). The note now highlights that duplicate skill names do not merge instructions and that project-local command rules require a trusted configuration layer.

The source comparison retains startup instruction ordering and limits, explicit versus implicit skill invocation, and request-specific API instructions. Host discovery and enforcement checks remain proposed practices; no skill installation, rule execution or API experiment was performed. The existing portability playbook remains the route for copying guidance between repositories.

The pending capture list was empty at review start. One existing note was revalidated; remaining stale signals were not cleared. The catalog refresh was delivered separately in [PR 382](https://github.com/JFusco/brain/pull/382). Independent content review, exact-head checks and final native run completion remain required before reporting this knowledge delivery complete.
