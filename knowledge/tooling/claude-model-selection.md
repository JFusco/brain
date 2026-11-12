---
title: "Choose Claude models and effort by task"
format: "playbook"
domain: "tooling"
aliases: ["Anthropic models", "Claude strengths and weaknesses", "Opus Sonnet Haiku Fable", "Claude effort"]
evidence_date: "2026-11-12"
reviewed_at: "2026-11-12"
review_after: "2026-11-19"
applicability: "Claude API current general-purpose lineup as documented on the evidence date; product availability and provider IDs require separate checks"
provenance: "anthropic-agent-docs@978de9c3dfd88c5c07cc711c1e5fdd68287133c70e61fdc42c1be085e2158dee; official model overview, selection and Opus prompting pages re-read 2026-11-12"
status: "current"
versions: []
---

# Choose Claude models and effort by task

## When to use this

Use when selecting a Claude model for coding, analysis, extraction or an agent workflow. These are dated vendor descriptions and documented tradeoffs, not Brain benchmarks or cross-provider rankings.

## What to do

The [model overview](https://platform.claude.com/docs/en/models/overview) gives these starting points:

| Model / API ID | Default effort | Documented strength | Selection tradeoff |
| --- | --- | --- | --- |
| Fable 5.2 / `claude-fable-5-2` | `high` | Demanding reasoning and long-horizon agent work | Moderate vendor-listed latency and higher token pricing than Opus; consider when Opus at higher effort misses the quality target. |
| Opus 5.5 / `claude-opus-5-5` | `medium` | Long-running coding and knowledge work; Anthropic's general starting recommendation | Moderate latency and higher token pricing than Sonnet; verify whether its quality benefit matters for this task. |
| Sonnet 5.5 / `claude-sonnet-5-5` | `high` | Speed and intelligence balance | Faster and lower token pricing than Opus; its fit for difficult work needs task-specific evaluation. |
| Haiku 5.5 / `claude-haiku-5-5` | `medium` | High-volume, latency-sensitive classification, extraction and routing | Fastest tier; low price does not establish sufficient quality on complex reasoning. |

**Documented selection alternatives:** the [choosing-a-model guide](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model) also recommends starting with Haiku for straightforward, latency-sensitive or cost-sensitive workloads, then upgrading for demonstrated capability gaps. Its capability-first path starts with Opus, optimizes effort, and considers Fable when difficult tasks still fall short. Choose the path by workload constraints rather than treating the overview's default as universal.

1. **Documented:** [Opus 5.5 prompting guidance](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5) starts at explicit `medium` effort. Thinking is always on. Increase effort only when the measured quality gain justifies time and tokens. Equal effort names across model generations do not imply equal work. Leave output-token room for thinking and the answer; a small limit can truncate the response.
2. **Proposed practice:** compare candidate models on the same representative tasks, required tools, acceptance criteria and output constraints. Record exact model ID, product/provider, effort, prompt, correctness, latency and total task cost. Escalate on demonstrated quality gaps; an authentication or transport failure is not evidence that a stronger model is needed.
3. **Proposed practice:** treat weaknesses as specific failure cases in that evaluation. Do not infer unsupported personality claims such as one model being inherently careless or universally best at design. Check specialized and legacy model pages separately when the task requires them.

## Evidence and limits

The overview establishes vendor positioning and comparative latency/token pricing; the Opus guide establishes its prompting and effort behavior. No models were executed, compared or benchmarked here. Total cost includes retries, tool work and reasoning, so token prices alone do not determine the cheapest successful workflow. Availability, aliases and model retirement change; reopen official pages before adopting this dated selection table. See [Claude skill and rule authoring](claude-skills-and-rules.md) for workflow design.

**Revalidated November 3, 2026:** The live overview, selection alternatives and Opus prompting guide were compared claim by claim with this note. The lineup, API IDs, relative latency/pricing and both selection paths remain supported; the table now shows each documented default effort next to its model. Effort defaults differ: the selection guide lists `high` for Fable 5.1 and Sonnet 5.5, and `medium` for Opus 5.5 and Haiku 5.5. Set the intended model and effort explicitly; do not carry one model's default across the lineup. No model execution or benchmark was performed.

**Revalidated November 12, 2026:** The current overview now lists Fable 5.2 (`claude-fable-5-2`) where the November 3 table listed Fable 5.1. It classifies both current Fable and Opus latency as moderate; that category does not establish equal measured latency. The documented default efforts and efficiency-first/capability-first selection paths remain supported. The Opus 5.5 guide still recommends explicit `medium`, evaluation-driven changes and enough output budget for thinking. This updates current selection guidance, not the status of any existing Fable 5.1 deployment; check lifecycle documentation before migrating. No model was run.
