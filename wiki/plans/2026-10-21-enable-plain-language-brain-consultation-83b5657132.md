---
status: "implemented"
executed: true
evidence: ["skills/brain/SKILL.md; skills/brain/agents/openai.yaml; README.md"]
source_tool: "codex"
source: "brain-plain-language-consultation"
topics: ["brain-skill"]
digest: "83b565713222a0ecbc79a7630d366b0af8f219034ab542d0d380558fd73a99ee"
---

# Enable plain-language Brain consultation

Date: 2026-10-21

1. Enable model selection for the Brain retrieval skill in Claude Code/Cursor and Codex, scoped to an explicit user request to consult Brain.
2. Require the existing route command for each consultation so normal lookup and returned-result metrics are recorded. Preserve read/citation reporting and manual-only capture settings.
3. Update the README and Brain skill wiki decision, archive this plan, and run skill validation, repository checks and wiki integrity. Do not add tests or perform Git delivery.

Implementation evidence: skills/brain/SKILL.md, skills/brain/agents/openai.yaml, README.md and wiki/topics/brain-skill.md. Lookup recording already exists in scripts/lib/visual-brain/retrieval.mjs and scripts/lib/visual-brain/metrics.mjs; no runtime code changes are needed. Existing user-level Brain links resolve to this checkout. Fresh-session invocation and animation QA remain deferred.
