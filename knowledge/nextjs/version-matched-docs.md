---
title: "Read installed Next.js docs before framework changes"
domain: "nextjs"
aliases: ["installed nextjs docs", "framework documentation"]
evidence_date: "2026-10-15"
applicability: "Next.js projects; bundled documentation is available in Next.js 16.2 and later"
provenance: "Candidates 69e67b6c9fcf7409631e2488 and ab5ee1b1919ac148038acd67; nextjs-index@7042244d22b56c78439c67e051a322db82720c09706bc77b44dc6f619df8300d"
---

# Read installed Next.js docs before framework changes

Before changing App Router caching, routing, or server APIs, identify the Next.js version used by the target application and read documentation matching that version.

Next.js 16.2 and later include documentation under `node_modules/next/dist/docs/`. In a monorepo, resolve the Next.js package from the application workspace; the repository root may use a different dependency or contain no installed Next.js package.

Use the repository's managed Next.js instructions to locate the relevant docs. Preserve that managed block while editing surrounding guidance. If bundled docs are absent, consult official documentation for the installed release. Confirm applicability before using advice from the rolling website or an older vendor skill.

This practice was observed in repository instructions and checked against the [official agent guide](https://nextjs.org/docs/app/guides/ai-agents) and the [captured documentation index](../../official/snapshots/nextjs-index/7042244d22b5-76f4b96aef1d/llms.txt) on the evidence date.
