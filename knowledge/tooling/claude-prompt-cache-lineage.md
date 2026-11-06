---
title: "Measure prompt-cache reuse across headless stages"
format: "playbook"
domain: "tooling"
aliases: ["Claude headless cache", "prompt cache lineage", "cache token telemetry"]
evidence_date: "2026-11-06"
reviewed_at: "2026-11-06"
applicability: "Claude Code headless stages and Claude API caching; rolling CLI/billing/TTL controls must be checked for the deployed version and provider"
provenance: "anthropic-agent-docs@d5a6f4f8ba427b778bfb000c15d3f2fc17c46c2aef3ec33f455c36cffac532cd; official Claude Code and Claude API prompt-caching pages read 2026-11-06; telemetry/reordering practice proposed, private cache rates unknown"
status: "current"
versions: []
---

# Measure prompt-cache reuse across headless stages

## When to use this

Use when a harness starts a new headless process for each stage and expects prompt reordering to reduce input cost. Use the [invocation contract](agent-cli-invocation-contract.md) separately for model and tool settings.

## What to do

**Documented:** [Claude Code caches prefixes server-side](https://code.claude.com/docs/en/prompt-caching). Separate sessions can share a matching prefix; sequential sessions also require matching startup Git-status snapshots, including branch/recent commits. A changed HEAD can change that prefix. Process identity alone neither guarantees a hit nor forbids reuse. Model, tools, system content, directory/context and cache lifetime matter.

**Documented TTL boundary:** the same Code guide places print-mode main-conversation requests in the main bucket. Defaults differ by billing/request bucket: subscription main conversations get one hour; API/usage-credit/cloud requests default to five minutes. Current Code versions expose TTL overrides, including an API main-conversation one-hour setting from 2.1.242. Verify the installed version, provider and effective controls; one-hour reuse is not subscription-only. The [API guide](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) explains tools → system → messages prefix order and explicit/automatic caching.

**Proposed procedure:**

1. Bound repeated stage history and retain only evidence needed for that stage. Put stable content before volatile identity/diagnostics where the CLI contract permits; readability and bounded growth are useful even without cross-stage hits. Preserve required identity, permissions and evidence.
2. Record effective model/tool/context and startup revision alongside `cache_read_input_tokens`, `cache_creation_input_tokens` and uncached `input_tokens` when the provider exposes them. The API defines these as separate quantities; uncached input alone is not total input.
3. Compare equivalent requests and actual cache counters before and after reordering. Record absent telemetry as unknown, not zero hits. Do not hold repository state stale, omit required context or weaken session isolation merely to chase a matching prefix.

## Evidence and limits

No CLI process, cache experiment or billing comparison was run. A private harness report recorded no cache-token counters, so its hit rate and proposed benefit remain unknown. This note does not establish cache behavior for Codex or other providers, nor enlarge the model context window.
