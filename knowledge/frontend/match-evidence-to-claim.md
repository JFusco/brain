---
title: "Match UI evidence to the acceptance claim"
domain: "frontend"
aliases: ["visual review evidence","migration acceptance","evidence limits"]
evidence_date: "2026-10-15"
applicability: "UI and migration reviews; observed review practices do not establish standards compliance"
provenance: "Candidates 432b83e2e9e5b4a4f1a773e1 and 8d308e6cda06d3a0001773a4; harvested authored procedures, generalized without executing their commands"
---

# Match UI evidence to the acceptance claim

## When to use this

Use this when reporting visual fidelity, UI behavior, accessibility observations, or coverage of a migration sample.

## What to do

Name the page, relevant state, viewport, source revision, and observed result. Keep fixture observations separate from observations against the actual application or CMS. Retain blocked or incomplete observations rather than reporting them as passed.

Distinguish a structurally valid evidence record from a correct visual or functional conclusion. A receipt showing that screenshots and source files match their recorded hashes establishes record integrity; it does not establish that a person correctly judged the page.

For sampled work, state which page families and interaction states were covered and which remain. Select specimens for the engineering question. Do not turn a purposive sample into a claim that every page or user journey works.

## Evidence and limits

These practices were extracted from two authored migration review procedures. Their project-specific commands and supporting contracts were not executed or independently validated in this curation batch. This page describes honest reporting boundaries; it supplies neither a visual acceptance checklist nor an accessibility compliance determination. Use the consuming project's actual review contract and applicable standards for those decisions.
