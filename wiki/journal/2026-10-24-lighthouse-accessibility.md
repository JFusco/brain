---
title: "Lighthouse docs in Accessibility"
date: "2026-10-24"
topics: ["official-reference-expansion"]
---

# Lighthouse docs in Accessibility

[Issue 211](https://github.com/JFusco/brain/issues/211) routes the `chrome-lighthouse-docs` catalog to Accessibility as well as Performance, so that its 11 accessibility audit pages under `/docs/lighthouse/accessibility/` are reachable from Accessibility lookups and the Accessibility hub. Source domains apply to the whole catalog. A separate accessibility-only source would have duplicated those URLs. See the [Lighthouse registration](2026-10-24-lighthouse-docs.md).

A local `official sync chrome-lighthouse-docs` kept the same 72 pages. An Accessibility `keyboard focus` lookup now includes two Lighthouse audits alongside the axe rules and the APG keyboard guide. Accessibility still has no curated notes, so its three fixed queries give no retention evidence. The unscoped `browser verification accessibility` lookup kept both curated notes (positions 1 and 4, previously 1 and 3). A Lighthouse best-practices page entered that top five because the domain name now matches the query term. All four Performance comparisons kept the image-loading playbook first. See [official reference expansion](../topics/official-reference-expansion.md).
