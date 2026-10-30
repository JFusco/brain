---
title: "Separate review transport and context capacity failures"
format: "playbook"
domain: "tooling"
aliases: ["input_too_large", "prompt_too_long", "file-reference transport", "resumed review context"]
evidence_date: "2026-10-30"
reviewed_at: "2026-10-30"
applicability: "Proposed recovery for CLI review harnesses; Claude Opus 5.5 API context facts are separate from invocation-specific Codex transport reports"
provenance: "anthropic-agent-docs@6b03d984c6d9b39eea32a4854af96b6d26babd30d8940af6fd16901d2b8eafa1; official context-window page read 2026-10-30; sanitized historical capture reports not independently reproduced"
status: "current"
versions: []
---

# Separate review transport and context capacity failures

## When to use this

Use when a review harness rejects a large packet or a resumed reviewer reports that its prompt is too long. First preserve the native error and identify which boundary failed; changing permissions or models without that evidence can obscure the actual failure. Use the [CLI invocation contract](agent-cli-invocation-contract.md) for requested settings and output validation.

## What to do

1. **Proposed:** keep character counts, UTF-8 byte counts and model tokens separate. Record the failing command/surface, error code, measured input and stated limit. A harness byte allowance does not establish a downstream CLI character allowance. Classify explicit terminal signals; an empty permission-denial list does not turn a capacity error into an authorization error. Real authentication, permission, malformed-response and stale-target failures still block the operation.
2. **Documented:** Anthropic's [context-window guide](https://platform.claude.com/docs/en/build-with-claude/context-windows) lists a 1,000,000-token window and up to 128,000 output tokens for Opus 5.5. Input history, system instructions, tool definitions/results, documents and generated output consume context. Cache-read and cache-creation tokens also count; caching does not enlarge the window. The output ceiling is within total capacity, not extra space above it. Check the actual model/provider surface before applying these API figures to a CLI.
3. **Proposed:** for a message transport cap, consider an immutable evidence file plus a short reference only when the receiving workflow can read it. Bind the packet hash, stage identity and source fingerprint; verify access and complete coverage through bounded reads. Preserve model/effort settings, reviewer independence, read-only permissions, writer scope and response validation. Never silently truncate. Before maintaining a transport adapter, add focused boundary coverage in its own authorized project; an incident workaround is not a maintained feature.
4. **Proposed:** for accumulated context, avoid repeatedly reinjecting full evidence into a resumed session. Preserve the evidence required by the authorized scope and remove irrelevant repetition. A file reference can reduce the initial message, but reading that file still consumes model context. Aggregated usage across earlier turns does not measure the failed request's instantaneous occupancy; zero reported usage does not establish the exact overage.
5. **Proposed:** use a fresh read-only reviewer or capacity fallback only where the frozen workflow explicitly supports it. Retain the exact source fingerprint, handoff revision, finding identities, checks and repair evidence. A same-model fresh session also needs an authorized route. Do not invent a model substitution, replay a writer or weaken a gate. A recorded fallback selection is not evidence that it executed or passed review.

## Evidence and limits

**Unverified historical reports:** one capture describes a native `input_too_large` rejection of 2,429,003 characters against 1,048,576, while the packet occupied 2,429,764 UTF-8 bytes. Another describes a resumed Opus recheck ending with `prompt_too_long`, HTTP 400 and an empty permission-denial list. Exact CLI versions at those failures were not recorded. These reports illustrate distinct units and failure classes; they do not establish universal CLI limits, a measured context composition or a successful recovery.

The captures also describe a temporary file adapter and recorded reviewer fallback. Their implementation, evidence completeness and review acceptance were not independently verified here. No provider trial, adapter change, loader test or review recovery was run. Transport size, model context, output ceiling, rate limits and account quotas remain separate diagnoses. Model selection belongs in the existing [OpenAI](openai-model-selection.md) and [Claude](claude-model-selection.md) notes.
