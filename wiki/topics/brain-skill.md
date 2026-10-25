---
title: "Opt-in Brain skill for Claude Code, Codex and Cursor"
aliases: ["brain skill", "cross-agent skill", "global wiki access", "manual-only skill"]
---

# Opt-in Brain skill for Claude Code, Codex and Cursor

Other projects use Brain through the on-demand [`skills/brain/`](../../skills/brain/SKILL.md). It replaces the earlier `/add-dir` plus pasted "Read INDEX.md" instruction. [Issue 52](https://github.com/JFusco/brain/issues/52) introduced it as phase 1 of the simplification audit, initially with manual command invocation only.

## Decision

- **Plain-language consultation, manual capture.** On 2026-10-21 Joe explicitly requested that a project be able to consult Brain when asked in plain language. `brain` now omits `disable-model-invocation` to allow model invocation by default and sets `allow_implicit_invocation: true`. Its description and instructions limit use to a user request to consult Brain, including `/brain` or `$brain`; a framework mention alone is not a trigger. The description is available for selection, while knowledge remains on demand. Capture retains both manual-only switches.
- **Router, not knowledge.** Project instructions and skills take precedence, then `knowledge/INDEX.md` → `route` → applicable ranked notes, version-matched docs first, with citations. Each consultation runs `route`, which already records lookup and returned-result metrics; reading files alone does not. Reads and citations use the returned session and separate reports. Notes stay in `knowledge/`, so `git pull` updates every tool.
- **User-level symlinks, no installer code.** `~/.claude/skills/brain` serves Claude Code (and Cursor, which reportedly reads that folder for compatibility); `~/.agents/skills/brain` serves Codex. `ln -s SRC DIR/` refuses to replace an existing entry. A `~/.cursor/skills` link is only a fallback, to avoid listing Brain twice in Cursor.
- **Narrow file access.** Claude Code gets `Read(~/Projects/brain/knowledge/**)`, not the whole repository, so other projects cannot read the private inbox or `.state/`.
- **Approved usage recording.** Cross-project consultation also writes metadata through the CLI to `.state/visual-brain/`. The skill now asks for the host's approved execution access when the chat cannot write there, checks recording separately from retrieval, and retains the same permission context for read/citation/completion reports. Read access or a different working directory does not grant writes. Denied access remains a disclosed recording failure; the skill does not alter sandbox configuration or manufacture past events. See the [October 25 repair](../journal/2026-10-25-cross-project-activity-permissions.md).
- **Rejected alternatives.** An always-loaded instruction (a global CLAUDE.md/AGENTS.md, or the project `integration` blocks) costs context in every session. The original manual-only selection was revised to recognize explicit natural-language requests; there is still no automatic consultation for unrelated work or project instruction injection.

## Practical project workflows

[Issue 124](https://github.com/JFusco/brain/issues/124) extends the existing opt-in
skill with all five workflows Joe approved: project briefings, source-backed
playbooks, explaining differing guidance, explicit usefulness feedback, and visual
connection explanations. The conditional skill reference is
[`project-work.md`](../../skills/brain/references/project-work.md); ordinary
consultation retains its existing path and invocation policy.

- `brief` uses the same ranked route, session and committed-main snapshot and
  returns evidence and gaps. The agent composes the task-specific briefing after
  reading the evidence; the CLI performs no model inference or project edits.
- Playbooks are ordinary current notes with validated `format: playbook`, four
  initial proposed workflows, official provenance, applicability and evidence
  limits. Listing is not reading, and publishing remains the normal Git flow.
- Explanations derive from explicit committed graph edges. Comparisons expose
  version/surface differences and authored decision branches; their verdict stays
  unresolved until claims are read and assessed. No similarity-based conflict
  detector or automatic ranking changes were added.
- One explicit usefulness response belongs to a note content hash. It stays in an
  additive private SQLite table, preserves older activity and note-version
  responses, accepts no free-text comments and does not infer votes from usage.
- The viewer exposes evidence briefings, playbook browsing, applicability,
  comparison pinning, connection reasons and next reading. Same-origin and
  committed-snapshot checks also protect the new endpoints. Unrelated main
  updates retain feedback for unchanged notes; changed content has a separate
  response. Rollback preserves the database and its additive table.

## Capture skill

[Phase 2](../journal/2026-10-18-simplification-phase-2.md) adds a second manual-only skill, [`skills/brain-capture/`](../../skills/brain-capture/SKILL.md), with `disable-model-invocation: true`, `allow_implicit_invocation: false` and two more user-level links. These settings remain unchanged by plain-language consultation support.

- **What it does.** From any project, it drafts up to three sanitized lessons in the page-template shape. It labels documented, observed and proposed claims, names the application and versions, and pipes each lesson to `node ~/Projects/brain/scripts/brain.mjs capture --stdin --domain <d>`.
- **Where lessons go.** Into Brain's private, scanned inbox; nothing is published. A later Brain session turns captures into notes through an ordinary PR.
- **Why not open the PR directly.** Joe chose the inbox route so that Git operations and client context stay out of other projects.
- **What it replaces.** The removed project `integration` command, which appended always-loaded instruction blocks to enrolled projects.

## Evidence and limits

Claude Code behavior comes from its skills and memory documentation: a `disable-model-invocation` skill's description is not in context, personal skills override same-named project skills, and `--add-dir` does not load that directory's CLAUDE.md by default. Because personal skills win in Claude Code, Brain must never install vendor skills at user level; that would override a project's own copy.

Codex and Cursor locations and switches come from search results; their documentation sites were blocked in the implementing cloud session. Discovery in each tool must be confirmed on Joe's Mac. Reported Cursor caveats: `disable-model-invocation` was reported ignored for project `.agents/skills`, and Cursor reportedly does not load `~/.agents/skills`.

`skills/` sits outside the tool-discovered directory names (`.agents`, `.claude`, `.cursor`, `.codex`) that `check` rejects, so working inside Brain does not load the skill, and `check` scans it like other tracked content.
