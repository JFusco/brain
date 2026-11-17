---
title: "Choose OpenAI models and reasoning by task"
format: "playbook"
domain: "tooling"
aliases: ["OpenAI model strengths and weaknesses", "GPT-6 Astra Sol Terra Luna", "reasoning effort", "OpenAI model best practices"]
evidence_date: "2026-11-17"
reviewed_at: "2026-11-17"
review_after: "2026-11-24"
applicability: "OpenAI GPT-6.2 Astra/Sol, GPT-6.1 Terra and GPT-6 Luna API models documented on the evidence date; ChatGPT and Codex availability and settings can differ"
provenance: "openai-agent-docs@05a126e0845f565030e232fcef708ce3cc740384fd692887526fedbd0c74657b; official model catalog, selection, GPT-6.2 compatibility and prompt-engineering pages re-read 2026-11-17"
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
| GPT-6.2 Astra / `gpt-6.2-astra` | Complex professional work, demanding reasoning and coding | Evaluate completed-task quality and cost; vendor positioning is not a workload benchmark. |
| GPT-6.2 Sol / `gpt-6.2-sol` | Coding, documents and multistep everyday work with lower cost than Astra | Compare representative work before deciding the efficiency/quality tradeoff. |
| GPT-6.1 Terra / `gpt-6.1-terra` | Visual workflows, computer use, concise writing and focused fixes | Verify saved results and screen actions; a useful specialization is not a universal ranking. |
| GPT-6 Luna / `gpt-6-luna` | Frequent, bounded tasks and extraction | Validate the quality bar before routing ambiguous work to an efficient model. |

1. **Documented:** the [GPT-6.2 guide](https://developers.openai.com/api/docs/guides/latest-model/gpt-6.2-astra) recommends `medium` for new Astra/Sol integrations and `low` when replacing `none` or `minimal`. Tool calling requires Responses; Chat Completions availability does not imply tool support. Set effort and endpoint explicitly for the exact model/product. The catalog lists `none` for Terra and Luna; do not transfer that setting to Astra/Sol.
2. **Documented:** the [selection guide](https://developers.openai.com/api/docs/guides/model-selection) recommends acceptance criteria, representative inputs and completed-task cost including retries. Check writing facts/voice, reopen saved computer-use results, and test code plus rendered interfaces. **Proposed:** record exact model ID, product, prompt, effort, tools, verified output, latency and review/repair cost. Compare models with consistent inputs and supported effort, then vary effort with model and inputs fixed.
3. **Documented:** [prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) recommends snapshots where available and evaluation suites when prompts or models change. **Proposed:** keep the lightest candidate that meets the actual acceptance criteria; describe weaknesses using failed cases, not general personality labels.

## Evidence and limits

No model executions, performance benchmarks or cross-provider tests were run. Prices, availability and defaults can change; reopen the exact model page before adopting this dated table. Specialized audio, image, embedding, open-weight and legacy models are separate choices through the [complete catalog](https://developers.openai.com/api/docs/models/all). See [OpenAI skills and rules](openai-skills-and-rules.md) and [Claude model selection](claude-model-selection.md) for the corresponding workflow and provider boundaries.

**Historical revalidation, November 2, 2026 (GPT-6/GPT-6.1 scope):** Current catalog and selection pages support the workload distinctions in the table. The GPT-6 guide requires Responses for tool calling with Astra, GPT-6.1 Sol and GPT-6.1 Terra; GPT-6 Sol and Luna permit Chat Completions function calling only with `none`. Use Responses for reasoning with tools and verify the exact model/endpoint combination. The prompt-engineering page still recommends snapshots and evaluations. Product availability, proposed comparisons and measured performance remain separate.

**Historical revalidation, November 12, 2026 (GPT-6/GPT-6.1 scope):** The live catalog and selection guide still support the four workload distinctions. The current compatibility guide distinguishes support for `none` from support for tool calling: Terra supports `none`, but its Chat Completions endpoint still cannot call tools. Use Responses for tool workflows and preserve supported effective effort during migration; do not infer defaults from a model tier. Snapshot/evaluation recommendations remain documented. No model execution or benchmark was performed.

**Revalidated November 17, 2026:** The current official catalog and selection page now identify GPT-6.2 Astra and Sol. The table and endpoint/effort guidance above use those exact versions; earlier revalidation paragraphs describe their own historical scope, not current defaults. Source text was checked, not just the catalog revision. No model execution or benchmark was performed.
