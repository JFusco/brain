---
title: "Bound design preparation by stable inputs and ownership"
domain: "frontend"
aliases: ["design delegation", "shared document ownership", "small Figma selections"]
evidence_date: "2026-10-21"
reviewed_at: "2026-10-21"
status: "current"
versions: []
applicability: "Proposed coordination for design-to-code or code-to-design work sharing components or a native document; no measured multi-agent speedup"
provenance: "Official Figma large-selection guidance read 2026-10-21; sanitized coordination proposal; no registered revision or benchmark"
---

# Bound design preparation by stable inputs and ownership

## When to use this

Use this when deciding whether to divide design preparation among workers while components, variables or source files remain shared.

## What to do

**Documented:** [Figma recommends smaller selections](https://developers.figma.com/docs/figma-mcp-server/avoid-large-frames/) and a lightweight metadata outline before requesting detailed context for needed sections of a large design.

**Proposed practice:** assign work only with stable inputs, a bounded independent output, explicit dependencies and ownership. Small selections reduce context; they do not make shared masters independent. Keep one owner for each shared source file and one coordinated mutation queue for a shared native document. Let workers report missing prerequisites instead of inventing IDs.

Recheck source/design baselines before integration. Separate read-only diagnosis, preparation and evidence indexing from shared mutations. Reduce stale handoffs and redundant calls before adding workers. Record blocked, integration/rework and native-wait time separately if evaluating throughput. Review a frozen candidate without silently changing the input under review.

## Evidence and limits

The official page establishes selection/context guidance, not a universal single-writer rule or request-serialization guarantee. Ownership and queueing above are proposed coordination practices. Private timing and reconstruction observations were not independently rerun; no overall speedup, model comparison or Figma-to-code benchmark is established. Use the target project's actual task contracts. See [component context](design-component-context.md) and [acceptance reporting](match-evidence-to-claim.md).

