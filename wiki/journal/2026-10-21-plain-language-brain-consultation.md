---
title: "Plain-language Brain consultation"
date: "2026-10-21"
topics: ["brain-skill"]
plans: ["2026-10-21-enable-plain-language-brain-consultation-83b5657132.md"]
---

# Plain-language Brain consultation

Joe requested that an explicit natural-language request to consult Brain work from another project and count as a lookup, while captures remain manual-only. The previous model-invocation restriction blocked an agent from invoking the skill in response to such a request.

Enabled model invocation by removing the disabling flag in `skills/brain/SKILL.md`, and enabled implicit selection in `skills/brain/agents/openai.yaml`. The description and instructions scope selection to a user request to consult Brain rather than ordinary frontend or CMS work. Updated the README and [Brain skill decision](../topics/brain-skill.md).

Each consultation must run the existing `route` command, which already records a search and returned results through `captureLookup`. A zero-match result still records a lookup. Reads and citations remain separate reports; merely reading files does not count as a lookup. No metric runtime changes were needed. Both `brain-capture` files retain their manual-only settings.

The existing Claude Code and Codex user-level skill symlinks resolve to this checkout. Skill validation, repository checks and wiki integrity passed. Fresh-session invocation, fixtures, tests and dedicated QA remain deferred; no live cross-project invocation or animation verification is claimed.

Joe subsequently authorized Git delivery, PR merge and branch/worktree cleanup through [issue 113](https://github.com/JFusco/brain/issues/113). The delivery uses an issue branch from updated main and retains the privacy guard and required Wiki integrity check. Captures remain manual-only.
