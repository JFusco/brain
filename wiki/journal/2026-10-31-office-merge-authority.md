---
title: "Office harness merge authority"
topics: [automatic-knowledge-maintenance]
---

# Office harness merge authority

[Issue 284](https://github.com/JFusco/brain/issues/284) aligns the delivery workflow with Joe's 2026-10-31 decision that every Office project runs hands-off. The Office harness now merges board-delivered Brain PRs once applicable checks pass on the saved, verified head, so [AGENTS.md](../../AGENTS.md) step 7 no longer tells agents to hold registry, workflow or code PRs for a human merge when the Office delivers them.

Work outside the Office keeps the earlier rule: only routine knowledge, catalog-refresh and wiki maintenance PRs merge automatically. Failed content is never merged, branch protections are never bypassed, and the independent content review and nightly publication gates are unchanged.
