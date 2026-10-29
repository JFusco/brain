---
title: "Define a structured Opus 5.5 judgment contract"
format: "playbook"
domain: "tooling"
aliases: ["Opus 5.5 structured outputs", "adaptive thinking", "schema-bound vision judgment"]
evidence_date: "2026-10-29"
reviewed_at: "2026-10-29"
applicability: "Direct Claude API Messages calls using claude-opus-5-5; confirm the selected provider and SDK support, which was not exercised here"
provenance: "anthropic-agent-docs@6b03d984c6d9b39eea32a4854af96b6d26babd30d8940af6fd16901d2b8eafa1; official Opus, effort, structured-output, vision and streaming pages read 2026-10-29; proposed harness procedure, no API execution"
status: "current"
versions: []
---

# Define a structured Opus 5.5 judgment contract

## When to use this

Use when one direct Messages API judgment must consume JSON evidence or screenshots and return an application-defined object. This extends the [Claude model-selection guidance](claude-model-selection.md) with request/response boundaries; it is not a measured recommendation to choose Opus for every judgment.

## What to do

1. **Documented:** [Opus 5.5 changes](https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5) describe always-on adaptive thinking. Omit `thinking` or use `{"type":"adaptive"}`; disabled thinking and manual `budget_tokens` requests are rejected. Forced `tool_choice` values `any` and `tool` are also rejected. Use the documented automatic tool choice or structured output contract instead.
2. **Documented:** set `output_config.effort` using the [effort reference](https://platform.claude.com/docs/en/build-with-claude/effort). Opus 5.5 supports low, medium, high, xhigh and max, defaulting to medium. **Proposed:** choose an explicit level against acceptance examples, rather than silently inheriting the older Opus 5 default of high. Reserve room for thinking and response text in `max_tokens`.
3. **Documented:** [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) use `output_config.format` for the JSON schema. Refusal can arrive with HTTP 200 and `stop_reason: "refusal"`; `max_tokens` can leave incomplete output. Schema features have limits. **Proposed:** inspect stop reason before consuming the result, select content by type and validate the complete result against the application's local schema. Schema shape does not prove factual correctness.
4. **Proposed:** make fallback a deliberate caller policy. When a harness requires the requested model, surface a refusal or unavailable result rather than silently substituting another model; where fallback is authorized, identify the actual model and preserve the original outcome. Provider recommendations do not override that caller contract.
5. **Documented:** [vision](https://platform.claude.com/docs/en/build-with-claude/vision) accepts base64 image blocks; apply the separate [screenshot sizing guidance](vision-input-contract.md). The [streaming guide](https://platform.claude.com/docs/en/build-with-claude/streaming) describes incremental Messages events. **Proposed:** stream long calls through the supported SDK, handle error/incomplete termination, and consume the assembled final message rather than a partial JSON fragment.

## Evidence and limits

The [model page](https://platform.claude.com/docs/en/models/opus-5-5/overview) lists 1M context and 128K maximum output; those maxima are not recommended per-call budgets. The [pricing page](https://platform.claude.com/docs/en/about-claude/pricing) lists standard input/output at $4/$20 and cache hits at $0.20 per million tokens on the evidence date. Cache writes, provider/geography modifiers, thinking, tools and retries can affect total cost; this note does not estimate workload cost.

No SDK was installed and no API request, vision judgment, refusal or fallback was exercised. CLI settings and alternate providers are separate contracts. Current live pages replace reliance on an older bundled reference; they do not validate an application's implementation.
