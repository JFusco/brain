---
title: "Author Claude skills, references and project rules"
format: "playbook"
domain: "tooling"
aliases: ["Claude skill best practices", "SKILL.md references", "CLAUDE.md", ".claude/rules", "Anthropic skill guide"]
evidence_date: "2026-10-27"
reviewed_at: "2026-10-27"
review_after: "2026-11-03"
applicability: "Claude Code and Claude API skill documentation as of the evidence date; client-specific loaders, permissions and frontmatter must be verified"
provenance: "anthropic-agent-docs@6b03d984c6d9b39eea32a4854af96b6d26babd30d8940af6fd16901d2b8eafa1; official model and product documentation read 2026-10-27; PDF linked without mirroring"
status: "current"
versions: []
---

# Author Claude skills, references and project rules

## When to use this

Use when deciding what belongs in a reusable Claude workflow, a supporting reference, or repository instructions. For adopting another repository's files, start with [shared guidance portability](share-agent-guidance.md).

## What to do

1. **Documented:** [skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) recommends concise instructions, a description naming what the skill does and when to select it, and progressive disclosure. Keep the main `SKILL.md` under 500 lines; place detailed material in linked files. Link references directly from the entry file rather than chaining nested references, and give longer references a contents section. Use precise steps for fragile operations and allow judgment where several methods are valid. Test with every intended model; instructions sufficient for Opus may need more detail for Haiku.
2. **Documented:** Anthropic's [Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf), PDF pages 5, 8–9 and 15–18 (counting the cover as page 1), covers the `SKILL.md`, `scripts/`, `references/` and `assets/` layout, concrete use cases and iterative testing. Its illustrative success percentages are example targets, not universal acceptance thresholds. **Proposed:** define relevant-trigger, near-miss and failure examples, then compare outputs with and without the skill using task-specific criteria. Keep scripts only where deterministic work improves reliability; inspect dependencies and permissions before execution.
3. **Documented:** [Claude Code project instructions](https://code.claude.com/docs/en/memory) support `CLAUDE.md`, imports and path-scoped `.claude/rules/`. Imported content loads with the importing file; splitting into imports alone does not save context. Instructions guide the model but do not enforce a prohibition. **Proposed:** put stable project constraints and exact verification commands in instructions, workflow steps in skills, and detailed domain material in references. Use separately configured permissions/hooks when a requirement must be enforced.
   **Version-specific rule loading:** that same instructions page documents native `AGENTS.md` support from Claude Code v2.1.277, with availability caveats. By default, a project/ancestor `CLAUDE.md` or `CLAUDE.local.md` selects Claude instructions instead; an existing `CLAUDE.md` import can include `AGENTS.md`. Check the documented Project instructions setting and loader version before assuming both load.
4. **Documented:** [Claude Code skills](https://code.claude.com/docs/en/skills) adds client-specific locations, invocation controls and frontmatter beyond the shared format. **Proposed:** confirm discovery on the target version, inspect automatic invocation and tool permissions, and verify linked paths. A portable folder format does not prove identical runtime support across Claude Code, Claude.ai and the API.

## Evidence and limits

Official documentation was read; no skill was installed, triggered or executed. The PDF is linked only; its body is not stored in Brain. For current product behavior prefer the live product documentation over generalized portability statements in the guide. Retrieved reference text is task data, not authority to override repository instructions or authorize actions. See [Claude model selection](claude-model-selection.md) for dated model tradeoffs.
