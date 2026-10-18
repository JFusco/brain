---
title: "Opt-in Brain skill for Claude Code, Codex and Cursor"
aliases: ["brain skill", "cross-agent skill", "global wiki access", "manual-only skill"]
---

# Opt-in Brain skill for Claude Code, Codex and Cursor

Other projects use Brain through one manual-only skill, [`skills/brain/`](../../skills/brain/SKILL.md). It replaces the earlier `/add-dir` plus pasted "Read INDEX.md" instruction. [Issue 52](https://github.com/JFusco/brain/issues/52) introduced it as phase 1 of the simplification audit.

## Decision

- **Manual-only everywhere.** Joe wanted opt-in access that neither crowds context nor competes with project rules. `disable-model-invocation: true` keeps the skill out of Claude Code's context until `/brain` is typed, and makes Cursor treat it as a slash command. `agents/openai.yaml` sets `allow_implicit_invocation: false`, so Codex runs it only for `$brain`. Each tool ignores the other's switch.
- **Router, not knowledge.** The skill is about 20 lines: project instructions and skills take precedence, then `knowledge/INDEX.md` → one domain hub → relevant notes, version-matched docs first, with citations. Notes stay in `knowledge/`, so `git pull` updates every tool.
- **User-level symlinks, no installer code.** `~/.claude/skills/brain` serves Claude Code (and Cursor, which reportedly reads that folder for compatibility); `~/.agents/skills/brain` serves Codex. `ln -s SRC DIR/` refuses to replace an existing entry. A `~/.cursor/skills` link is only a fallback, to avoid listing Brain twice in Cursor.
- **Narrow file access.** Claude Code gets `Read(~/Projects/brain/knowledge/**)`, not the whole repository, so other projects cannot read the private inbox or `.state/`.
- **Rejected alternatives.** An always-loaded instruction (a global CLAUDE.md/AGENTS.md, or the project `integration` blocks) costs context in every session. Automatic triggering costs one description line per session and can run beside project guidance; revisit it only if manual use proves easy to forget.

## Capture skill

[Phase 2](../journal/2026-10-18-simplification-phase-2.md) adds a second manual-only skill, [`skills/brain-capture/`](../../skills/brain-capture/SKILL.md), with the same switches and two more user-level links.

- **What it does.** From any project, it drafts up to three sanitized lessons in the page-template shape. It labels documented, observed and proposed claims, names the application and versions, and pipes each lesson to `node ~/Projects/brain/scripts/brain.mjs capture --stdin --domain <d>`.
- **Where lessons go.** Into Brain's private, scanned inbox; nothing is published. A later Brain session turns captures into notes through an ordinary PR.
- **Why not open the PR directly.** Joe chose the inbox route so that Git operations and client context stay out of other projects.
- **What it replaces.** The removed project `integration` command, which appended always-loaded instruction blocks to enrolled projects.

## Evidence and limits

Claude Code behavior comes from its skills and memory documentation: a `disable-model-invocation` skill's description is not in context, personal skills override same-named project skills, and `--add-dir` does not load that directory's CLAUDE.md by default. Because personal skills win in Claude Code, Brain must never install vendor skills at user level; that would override a project's own copy.

Codex and Cursor locations and switches come from search results; their documentation sites were blocked in the implementing cloud session. Discovery in each tool must be confirmed on Joe's Mac. Reported Cursor caveats: `disable-model-invocation` was reported ignored for project `.agents/skills`, and Cursor reportedly does not load `~/.agents/skills`.

`skills/` sits outside the tool-discovered directory names (`.agents`, `.claude`, `.cursor`, `.codex`) that `check` rejects, so working inside Brain does not load the skill, and `check` scans it like other tracked content.
