---
title: "Choose OpenAI models and reasoning by task"
format: "playbook"
domain: "tooling"
aliases: ["OpenAI model strengths and weaknesses", "GPT-6 Astra Sol Terra Luna", "reasoning effort", "OpenAI model best practices"]
evidence_date: "2026-10-27"
reviewed_at: "2026-10-27"
review_after: "2026-11-03"
applicability: "OpenAI GPT-6 and GPT-6.1 general-purpose API models documented on the evidence date; ChatGPT and Codex availability and settings can differ"
provenance: "openai-agent-docs@a14113e27fa3d77e98156b2f8ee8773d670212e5c8e02c7345fc00a8a3254635; official OpenAI API and ChatGPT/Codex documentation read 2026-10-27"
status: "current"
versions: []
---

# Choose OpenAI models and reasoning by task

## When to use this

Use when selecting an OpenAI model for coding, research, writing or computer use. This is dated vendor positioning and selection guidance, not measured Brain performance or a ranking against Claude.

## What to do

The [model catalog](https://developers.openai.com/api/docs/models) and [selection guide](https://developers.openai.com/api/docs/guides/model-selection) describe these candidates:

| Model / API ID | Documented strength | Selection tradeoff |
| --- | --- | --- |
| GPT-6 Astra / `gpt-6-astra` | Demanding reasoning, coding and professional work; ambiguous problems and deep analysis | Highest token price among these candidates; assess completed-task cost and quality rather than token price alone. |
| GPT-6.1 Sol / `gpt-6.1-sol` | Complex work with a balance of intelligence, time and cost | Lower token pricing than Astra; near-Astra is vendor positioning, not equal performance on every task. |
| GPT-6.1 Terra / `gpt-6.1-terra` | Visual reasoning, computer use, clear writing and scoped code fixes | Evaluate accuracy of screen actions and saved results; focused strengths do not establish suitability for all deep reasoning. |
| GPT-6 Luna / `gpt-6-luna` | Focused, high-volume tasks, triage and frequent automations | Lowest token pricing of these candidates; validate quality before routing ambiguous or complex tasks to it. |

1. **Documented:** [Using GPT-6](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra) distinguishes reasoning support: Astra and GPT-6.1 Sol do not support `none`; Terra and Luna do. Sol and Terra default to `medium`; test quality before spending more time/tokens on higher effort. For these GPT-6 models, use Responses for reasoning with tools; do not assume Chat Completions accepts the same tool/parameter combinations.
2. **Documented:** the [selection guide](https://developers.openai.com/api/docs/guides/model-selection) recommends comparing Terra and Sol on the same inputs and effort, checking writing quality beyond length and computer-use results beyond completion reports. **Proposed:** extend that controlled comparison across your candidate models, recording exact IDs, product, prompt, effort, required tools, verified output, latency and completed-task cost, including retries.
3. **Documented:** [prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) recommends model snapshots where available and evaluation suites when prompts or models change. **Proposed:** define acceptance criteria before choosing the cheapest candidate that meets them. Treat concrete failed cases as weaknesses; do not invent general personality labels or transfer older o-series advice to all GPT-6 models.

## Evidence and limits

No model executions, performance benchmarks or cross-provider tests were run. Prices, availability and defaults can change; reopen the exact model page before adopting this dated table. Specialized audio, image, embedding, open-weight and legacy models are separate choices through the [complete catalog](https://developers.openai.com/api/docs/models/all). See [OpenAI skills and rules](openai-skills-and-rules.md) and [Claude model selection](claude-model-selection.md) for the corresponding workflow and provider boundaries.
