---
title: "Lighthouse accessibility scope"
date: "2026-10-24"
topics: ["official-reference-expansion"]
---

# Lighthouse accessibility scope

[Issue 220](https://github.com/JFusco/brain/issues/220) narrows the [earlier Accessibility routing](2026-10-24-lighthouse-accessibility.md). Adding Accessibility to every `chrome-lighthouse-docs` page let the domain name match all 72 Lighthouse pages: in the unscoped `browser verification accessibility` lookup, a best-practices page had displaced the Next.js accessibility page.

`chrome-lighthouse-docs` is back to Performance only. A new `chrome-lighthouse-accessibility` source reads the same Lighthouse overview index, limited to `/docs/lighthouse/accessibility/`; its local sync catalogued the scoring overview and 10 audits. Both catalogs list those 11 URLs, and lookup ranking deduplicates by URL, so an unscoped `focus traps` lookup returns that page once.

The unscoped lookup is back to its pre-routing top five, with both curated notes kept. The Accessibility `keyboard focus` lookup still includes two Lighthouse audits, and the Performance comparisons kept the image-loading playbook first. The README Coverage watch list now names the Lighthouse paths for Performance and Accessibility. See [official reference expansion](../topics/official-reference-expansion.md).
