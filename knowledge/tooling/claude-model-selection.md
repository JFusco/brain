---
title: "Choose Claude models and effort by task"
format: "playbook"
domain: "tooling"
aliases: ["Anthropic models", "Claude strengths and weaknesses", "Opus Sonnet Haiku Fable", "Claude effort"]
evidence_date: "2026-10-27"
reviewed_at: "2026-10-27"
review_after: "2026-11-03"
applicability: "Claude API current general-purpose lineup as documented on the evidence date; product availability and provider IDs require separate checks"
provenance: "anthropic-agent-docs@6b03d984c6d9b39eea32a4854af96b6d26babd30d8940af6fd16901d2b8eafa1; official model and product documentation read 2026-10-27; PDF linked without mirroring"
status: "current"
versions: []
---

# Choose Claude models and effort by task

## When to use this

Use when selecting a Claude model for coding, analysis, extraction or an agent workflow. These are dated vendor descriptions and documented tradeoffs, not Brain benchmarks or cross-provider rankings.

## What to do

The [model overview](https://platform.claude.com/docs/en/models/overview) gives these starting points:

| Model / API ID | Documented strength | Selection tradeoff |
| --- | --- | --- |
| Fable 5.1 / `claude-fable-5-1` | Demanding reasoning and long-horizon agent work | Slower and higher token pricing; consider when Opus at higher effort misses the quality target. |
| Opus 5.5 / `claude-opus-5-5` | Long-running coding and knowledge work; Anthropic's general starting recommendation | Moderate latency and higher token pricing than Sonnet; verify whether its quality benefit matters for this task. |
| Sonnet 5.5 / `claude-sonnet-5-5` | Speed and intelligence balance | Faster and lower token pricing than Opus; its fit for difficult work needs task-specific evaluation. |
| Haiku 5.5 / `claude-haiku-5-5` | High-volume, latency-sensitive classification, extraction and routing | Fastest tier; low price does not establish sufficient quality on complex reasoning. |

**Documented selection alternatives:** the [choosing-a-model guide](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model) also recommends starting with Haiku for straightforward, latency-sensitive or cost-sensitive workloads, then upgrading for demonstrated capability gaps. Its capability-first path starts with Opus, optimizes effort, and considers Fable when difficult tasks still fall short. Choose the path by workload constraints rather than treating the overview's default as universal.

1. **Documented:** [Opus 5.5 prompting guidance](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5) starts at explicit `medium` effort. Thinking is always on. Increase effort only when the measured quality gain justifies time and tokens. Equal effort names across model generations do not imply equal work. Leave output-token room for thinking and the answer; a small limit can truncate the response.
2. **Proposed practice:** compare candidate models on the same representative tasks, required tools, acceptance criteria and output constraints. Record exact model ID, product/provider, effort, prompt, correctness, latency and total task cost. Escalate on demonstrated quality gaps; an authentication or transport failure is not evidence that a stronger model is needed.
3. **Proposed practice:** treat weaknesses as specific failure cases in that evaluation. Do not infer unsupported personality claims such as one model being inherently careless or universally best at design. Check specialized and legacy model pages separately when the task requires them.

## Evidence and limits

The overview establishes vendor positioning and comparative latency/token pricing; the Opus guide establishes its prompting and effort behavior. No models were executed, compared or benchmarked here. Total cost includes retries, tool work and reasoning, so token prices alone do not determine the cheapest successful workflow. Availability, aliases and model retirement change; reopen official pages before adopting this dated selection table. See [Claude skill and rule authoring](claude-skills-and-rules.md) for workflow design.
