---
title: "Pin an agent CLI judgment call's settings"
format: "playbook"
domain: "tooling"
aliases: ["CLI model and effort", "agent harness argv", "schema-bound CLI judgment"]
evidence_date: "2026-10-29"
reviewed_at: "2026-10-29"
applicability: "Harnesses invoking Codex exec or Claude Code print mode; confirm installed CLI flags and model-supported effort levels"
provenance: "openai-agent-docs@cee2f0d46de2ef567418e2145606d882f1f321e0396afedf8471b7e7200e319d; anthropic-agent-docs@6b03d984c6d9b39eea32a4854af96b6d26babd30d8940af6fd16901d2b8eafa1; official CLI/settings pages read 2026-10-29; sanitized authored harness observation, not reproduced"
status: "current"
versions: []
---

# Pin an agent CLI judgment call's settings

## When to use this

Use when a harness needs a repeatable model judgment across machines. Choose the model using the existing [OpenAI](openai-model-selection.md) or [Claude](claude-model-selection.md) guidance; this page covers invocation settings rather than model ranking.

## What to do

**Proposed procedure:**

1. Pass the intended model and supported effort explicitly on every invocation. Build a structured argument list; record the requested settings, CLI version, input identity and reported model when available. An omitted setting or a generic default label cannot establish which configuration ran. These controls improve reproducibility, not deterministic model output.
2. For Codex, use `codex exec --model <id> -c 'model_reasoning_effort="<level>"' ...`. The [official settings guide](https://learn.chatgpt.com/docs/developer-settings) gives command-line overrides precedence over configuration defaults. The [command reference](https://learn.chatgpt.com/docs/developer-commands?surface=cli) documents `--ignore-user-config` as omitting user configuration while authentication still uses the configured Codex home. Treat that as a separate configuration decision; it is not complete isolation or permission to disable project protections.
3. For Claude Code, use `claude -p --model <id> --effort <level> ...`. Its [CLI reference](https://code.claude.com/docs/en/cli-reference) documents model and effort overrides; supported effort levels depend on the model. Match tool, MCP, permission and session-persistence options to the actual authorized task. `--safe-mode` disables customizations and can remove required project guidance, so it is a troubleshooting option, not a universal harness preset.
4. Choose the output contract deliberately. Codex documents `--output-schema`; Claude print mode documents `--json-schema` and JSON output formats. Preserve a local validator for the application's exact contract and distinguish schema failure, refusal, truncation and transport failure. If a provider's schema subset cannot express the contract, keep the alternative prompt/validation path explicitly documented and unverified until exercised.
5. Treat image attachment and fallback behavior as separate contracts. Codex documents `--image`; verify the installed parser's image/stdin argument boundaries rather than assuming an untested separator fix. Do not configure an optional fallback model where the harness requires the requested model; verify effective fallback policy separately.

## Evidence and limits

**Historical observation:** one authored report described a harness that omitted effort, inherited operator defaults and recorded insufficient telemetry. That implementation was not inspected or rerun here. Incidental runtime/CLI versions are not compatibility evidence for these rolling references.

The linked Claude Code and ChatGPT Learn CLI/settings pages are rolling references outside the API-index revision signals; reopen them before applying flags. No CLI judgment, image-read path, configuration-precedence experiment or schema integration was executed. A CLI image flag does not establish the API's effective image detail, and absence of a flag in one help listing does not establish every supported image route. See [vision input limits](vision-input-contract.md) and the separate [Opus API contract](opus-structured-judgment.md).
