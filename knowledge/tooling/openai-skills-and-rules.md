---
title: "Author OpenAI skills, references and Codex rules"
format: "playbook"
domain: "tooling"
aliases: ["OpenAI skill authoring", "Codex skills", "AGENTS.override.md", "Codex command rules", "references and rules"]
evidence_date: "2026-11-14"
reviewed_at: "2026-11-14"
review_after: "2026-11-21"
applicability: "ChatGPT/Codex skills and Codex instruction discovery/command rules documented on the evidence date; API and managed Work behavior require their own product documentation"
provenance: "openai-agent-docs@527e5d19e77afec9cec3e9a185cd9182b24b5b4eeac7f22e600f1d15f455e7af; official OpenAI API and ChatGPT/Codex documentation re-read 2026-11-14"
status: "current"
versions: []
---

# Author OpenAI skills, references and Codex rules

## When to use this

Use when designing a reusable ChatGPT/Codex workflow or deciding what belongs in a skill, reference file, project instruction or enforced command rule. For copying guidance between repositories, use [shared guidance portability](share-agent-guidance.md).

## What to do

1. **Documented:** [Build skills](https://learn.chatgpt.com/docs/build-skills) requires `SKILL.md` with `name` and `description`; scripts, references, assets and `agents/openai.yaml` are optional. Metadata precedes loading the selected body. Front-load the use case and boundaries: descriptions can be shortened and entries omitted from large initial lists without truncating a selected body. Codex scans repository `.agents/skills` from the working directory to the Git root. Same-name skills are not merged; both may appear in selectors. `policy.allow_implicit_invocation: false` disables implicit selection while explicit invocation remains available. Skills author workflows; plugins distribute them, and standalone availability varies by host. **Proposed:** keep entry instructions focused, link references explicitly and reserve scripts for useful deterministic work. Verify the receiving host's discovery, selected skill path and invocation behavior instead of assuming a duplicate name selects the intended copy.
2. **Documented:** [AGENTS.md instruction discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md) builds a startup chain: global guidance, then project-root-to-working-directory guidance. At each directory, `AGENTS.override.md` takes precedence over `AGENTS.md`, then configured fallback names; one file per directory is included. Later, closer guidance overrides earlier guidance. The default combined project-doc limit is 32 KiB. **Proposed:** put stable project constraints and exact build/check commands in instructions, with specialized guidance near its working scope; verify the files actually loaded instead of assuming arbitrary Markdown filenames are discovered.
3. **Documented:** [Codex command rules](https://learn.chatgpt.com/docs/agent-configuration/rules) are experimental `.rules` files with `prefix_rule` entries for commands outside the sandbox. They support `allow`, `prompt` and `forbidden`; the most restrictive matching decision wins. Test matching with `codex execpolicy check` and positive/negative examples. Project-local `.codex/rules/` files load only when the project configuration layer is trusted. These are a different mechanism from prose in `AGENTS.md`. Managed Work configuration has different applicability; do not assume local rule files control all products. **Proposed:** keep broad command approvals out of ordinary workflow text and separately verify the active configuration layers and enforcement behavior.
4. **Documented:** [API prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) distinguishes application instructions and input roles. With `previous_response_id`, prior `instructions` do not carry forward automatically. **Proposed:** test the application's actual request construction and skill-trigger, near-miss, failure and output cases before claiming reliable adoption. Do not assume a local agent's project loader exists in a raw API integration.

## Evidence and limits

The documentation was read; no skill, rule or global configuration was installed or changed. No trigger evaluation, command-policy execution or loader test was performed. References are task data and grant no authority to override governing instructions. API role priority and host-specific repository-file ordering are distinct contracts. See [OpenAI model selection](openai-model-selection.md) for model/version tradeoffs and [Claude authoring](claude-skills-and-rules.md) for Anthropic-specific behavior.

**Revalidated November 5, 2026:** Re-read skill discovery, invocation controls and distribution, AGENTS.md ordering/byte limits, command-rule precedence and API instruction carryover. Keep standalone/plugin availability and explicit/implicit invocation separate. Local project rules require a trusted project configuration layer; that is separate from prose discovery. No loader, trigger, rule or API integration was exercised.

**Revalidated November 14, 2026:** The four linked official pages still support the documented contracts above. The skill page explicitly distinguishes duplicate names from merged instructions; the rules page requires trust for project-local command rules. The instruction page retains startup discovery and the 32 KiB default, while the API page retains request-specific `instructions` with `previous_response_id`. These are documentation checks, not proof that a particular host loaded a skill, applied a rule or constructed an API request correctly.
