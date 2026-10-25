---
title: "HTML catalog link titles"
date: "2026-10-24"
topics: ["official-reference-expansion"]
---

# HTML catalog link titles

[Issue 210](https://github.com/JFusco/brain/issues/210) fixes two title defects in HTML-index catalogs, reported after the [Lighthouse registration](2026-10-24-lighthouse-docs.md). `htmlLinks` decoded only six named entities, so three Lighthouse audit titles kept `&#39;`, and the overview page took its title from a "Skip to main content" link.

The parser now decodes decimal and hexadecimal numeric character references, including uppercase `&#X` forms, and leaves control characters other than tab, line feed and carriage return, surrogates and out-of-range references undecoded. It also treats skip-link text as generic so the existing path-title fallback applies. A local `official sync chrome-lighthouse-docs` changed only those four titles; no other catalog contained either pattern. Sitemap and Markdown parsing are unchanged. See [official reference expansion](../topics/official-reference-expansion.md).
