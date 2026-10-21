---
title: "Match UI evidence to the acceptance claim"
domain: "frontend"
aliases: ["visual review evidence","migration acceptance","evidence limits"]
evidence_date: "2026-10-21"
reviewed_at: "2026-10-21"
status: "current"
applicability: "UI and migration reviews; observed review practices do not establish standards compliance"
provenance: "Historical sanitized authored review procedures; official Figma responsibility page read 2026-10-21; new capture proposal compared with existing reporting guidance"
---

# Match UI evidence to the acceptance claim

## When to use this

Use this when reporting visual fidelity, UI behavior, accessibility observations, or coverage of a migration sample.

## What to do

Name the page, relevant state, viewport, source revision, and observed result. Keep fixture observations separate from observations against the actual application or CMS. Retain blocked or incomplete observations rather than reporting them as passed.

Distinguish a structurally valid evidence record from a correct visual or functional conclusion. A receipt showing that screenshots and source files match their recorded hashes establishes record integrity; it does not establish that a person correctly judged the page.

For sampled work, state which page families and interaction states were covered and which remain. Select specimens for the engineering question. Do not turn a purposive sample into a claim that every page or user journey works.

## Bind the source before generating

**Proposed practice:** for design-to-code or code-to-design work, identify the authoritative revision, selected frames/components, variants, locales, widths and behavioral states. Record whether exact reproduction, authorized normalization or new design is intended. Supplied designs do not themselves authorize editing or rebuilding them; completed code used as input needs its own identified baseline.

The [official Figma responsibility page](https://developers.figma.com/docs/figma-mcp-server/mcp-vs-agent/) distinguishes structured context supplied by MCP from the final implementation written and adapted by the agent. Receiving context does not establish delivered quality. Keep source checks, rendered comparison, supported interaction and any library publication/import as separate acceptance observations. A screenshot does not demonstrate keyboard behavior or prototype playback. Component reuse and shared-document work have [separate preparation guidance](design-component-context.md).

## Evidence and limits

These practices were extracted from two authored migration review procedures. Their project-specific commands and supporting contracts were not executed or independently validated in this curation batch. This page describes honest reporting boundaries; it supplies neither a visual acceptance checklist nor an accessibility compliance determination. Use the consuming project's actual review contract and applicable standards for those decisions.

The Figma page is a rolling official URL read on October 21; no registered source revision or target application compatibility is claimed. The new source-contract procedure is proposed practice. Private construction/readback claims were not rerun and do not establish a complete Figma-to-code workflow.
