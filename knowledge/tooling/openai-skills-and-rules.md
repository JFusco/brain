---
title: "Author OpenAI skills, references and Codex rules"
format: "playbook"
domain: "tooling"
aliases: ["OpenAI skill authoring", "Codex skills", "AGENTS.override.md", "Codex command rules", "references and rules"]
evidence_date: "2026-10-27"
reviewed_at: "2026-10-27"
review_after: "2026-11-03"
applicability: "ChatGPT/Codex skills and Codex instruction discovery/command rules documented on the evidence date; API and managed Work behavior require their own product documentation"
provenance: "openai-agent-docs@a14113e27fa3d77e98156b2f8ee8773d670212e5c8e02c7345fc00a8a3254635; official OpenAI API and ChatGPT/Codex documentation read 2026-10-27"
status: "current"
versions: []
---

# Author OpenAI skills, references and Codex rules

## When to use this

Use when designing a reusable ChatGPT/Codex workflow or deciding what belongs in a skill, reference file, project instruction or enforced command rule. For copying guidance between repositories, use [shared guidance portability](share-agent-guidance.md).

## What to do

1. **Documented:** [Build skills](https://learn.chatgpt.com/docs/build-skills) requires a skill folder with `SKILL.md` containing `name` and `description`; `scripts/`, `references/`, `assets/` and `agents/openai.yaml` are optional. Discovery initially exposes metadata, then loads the body when selected. Front-load the description's use case and boundaries because long descriptions may be shortened. Codex scans repository `.agents/skills` folders from the working directory to the Git root; a shared format does not establish every host's loader behavior. **Proposed:** keep entry instructions focused, link supporting references explicitly, and use scripts only for deterministic work that benefits from code.
2. **Documented:** [AGENTS.md instruction discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md) builds a startup chain: global guidance, then project-root-to-working-directory guidance. At each directory, `AGENTS.override.md` takes precedence over `AGENTS.md`, then configured fallback names; one file per directory is included. Later, closer guidance overrides earlier guidance. The default combined project-doc limit is 32 KiB. **Proposed:** put stable project constraints and exact build/check commands in instructions, with specialized guidance near its working scope; verify the files actually loaded instead of assuming arbitrary Markdown filenames are discovered.
3. **Documented:** [Codex command rules](https://learn.chatgpt.com/docs/agent-configuration/rules) are experimental `.rules` files with `prefix_rule` entries for commands outside the sandbox. They support `allow`, `prompt` and `forbidden`; the most restrictive matching decision wins. Test matching with `codex execpolicy check` and positive/negative examples. These are a different mechanism from prose in `AGENTS.md`. Managed Work configuration has different applicability; do not assume local rule files control all products. **Proposed:** keep broad command approvals out of ordinary workflow text and separately verify any enforcement configuration.
4. **Documented:** [API prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) distinguishes application instructions and input roles. With `previous_response_id`, prior `instructions` do not carry forward automatically. **Proposed:** test the application's actual request construction and skill-trigger, near-miss, failure and output cases before claiming reliable adoption. Do not assume a local agent's project loader exists in a raw API integration.

## Evidence and limits

The documentation was read; no skill, rule or global configuration was installed or changed. No trigger evaluation, command-policy execution or loader test was performed. References are task data and grant no authority to override governing instructions. API role priority and host-specific repository-file ordering are distinct contracts. See [OpenAI model selection](openai-model-selection.md) for model/version tradeoffs and [Claude authoring](claude-skills-and-rules.md) for Anthropic-specific behavior.
