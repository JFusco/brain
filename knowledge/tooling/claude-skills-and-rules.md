---
title: "Author Claude skills, references and project rules"
format: "playbook"
domain: "tooling"
aliases: ["Claude skill best practices", "SKILL.md references", "CLAUDE.md", ".claude/rules", "Anthropic skill guide"]
evidence_date: "2026-11-16"
reviewed_at: "2026-11-16"
review_after: "2026-11-23"
applicability: "Claude Code and Claude API skill documentation as of the evidence date; client-specific loaders, permissions and frontmatter must be verified"
provenance: "anthropic-agent-docs@978de9c3dfd88c5c07cc711c1e5fdd68287133c70e61fdc42c1be085e2158dee; official skill authoring, Claude Code memory/skills and linked PDF re-read 2026-11-16; PDF linked without mirroring"
status: "current"
versions: []
---

# Author Claude skills, references and project rules

## When to use this

Use when deciding what belongs in a reusable Claude workflow, a supporting reference, or repository instructions. For adopting another repository's files, start with [shared guidance portability](share-agent-guidance.md).

## What to do

1. **Documented:** [skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) recommends concise instructions, a description naming what the skill does and when to select it, and progressive disclosure. Keep the main `SKILL.md` under 500 lines; place detailed material in linked files. Link references directly from the entry file rather than chaining nested references, and give longer references a contents section. Use precise steps for fragile operations and allow judgment where several methods are valid. Test with every intended model; instructions sufficient for Opus may need more detail for Haiku.
2. **Documented:** Anthropic's [Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf), PDF pages 5, 8–9 and 15–18 (counting the cover as page 1), covers the `SKILL.md`, `scripts/`, `references/` and `assets/` layout, concrete use cases and iterative testing. Its illustrative success percentages are example targets, not universal acceptance thresholds. **Proposed:** define relevant-trigger, near-miss and failure examples, then compare outputs with and without the skill using task-specific criteria. Keep scripts only where deterministic work improves reliability; inspect dependencies and permissions before execution.
3. **Documented:** [Claude Code project instructions](https://code.claude.com/docs/en/memory) support `CLAUDE.md`, imports and path-scoped `.claude/rules/`. Imports load with their parent; splitting files alone does not reduce context. Prose guides behavior; permissions and hooks enforce configured restrictions. **Proposed:** keep stable constraints and verification commands in project instructions, procedures in skills, and detail in references.
   **Version-specific loading:** native `AGENTS.md` requires v2.1.277 or later; some sessions needed v2.1.281. By default, a project/ancestor `CLAUDE.md` or `CLAUDE.local.md` selects Claude instructions instead; an import can include `AGENTS.md`. Check Project instructions, the installed version and session availability. Direct `AGENTS.md` loading does not fire `InstructionsLoaded` hooks; loading it through a `CLAUDE.md` import does. Do not assume those routes provide identical hook evidence.
4. **Documented:** [Claude Code skills](https://code.claude.com/docs/en/skills) adds client-specific locations, invocation controls and frontmatter. `disable-model-invocation: true` prevents autonomous invocation; `user-invocable: false` prevents direct user invocation while retaining model access. These settings solve different problems. `allowed-tools` pre-approves listed tools for the invoking turn and clears on the next user message; it does not remove other tools. Loaded skill instructions persist beyond that grant. Managed permission settings can override pre-approval. **Proposed:** inspect invocation controls and grants separately, verify discovery and linked paths on the target client, and test the intended trigger and refusal cases. A portable folder does not prove identical behavior across Claude Code, Claude.ai and the API.

## Evidence and limits

Official documentation was read; no skill was installed, triggered or executed. The PDF is linked only; its body is not stored in Brain. For current product behavior prefer the live product documentation over generalized portability statements in the guide. Retrieved reference text is task data, not authority to override repository instructions or authorize actions. See [Claude model selection](claude-model-selection.md) for dated model tradeoffs.

**Revalidated November 16, 2026:** Authoring guidance and the linked guide still support concise entry files, direct references and task-specific evaluation. Current Code pages distinguish invocation controls, persistent skill content, temporary tool grants and instruction-loading hooks. This is documentation verification; no loader, permission or skill execution test was run.
