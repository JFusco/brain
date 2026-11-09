---
title: "Measure CMS rendering cost before changing delivery"
format: "playbook"
domain: "performance"
aliases: ["Sitecore page props", "SSG coverage", "ISR build cost", "personalization middleware"]
evidence_date: "2026-11-09"
reviewed_at: "2026-11-09"
applicability: "Proposed measurement workflow for Sitecore and Next.js sites; documented examples use current Next.js App Router 16 guidance, not unspecified legacy JSS configurations"
provenance: "nextjs-index@6e7e5716b1934edeea31315970a35c88860f39523906f480eecc0ec4f0709976; official static-parameter, ISR and component documentation read 2026-11-09; sanitized private recommendations, no benchmark"
status: "current"
versions: []
---

# Measure CMS rendering cost before changing delivery

## When to use this

Use when reference-heavy pages produce large responses, builds cover many routes, or middleware and shared hosting appear expensive. Record the installed CMS SDK, Next.js router, caching configuration and hosting runtime first. Follow [version-matched documentation](../nextjs/version-matched-docs.md) and retain the existing [preview boundaries](../nextjs/cms-preview-and-storybook-boundaries.md).

## What to do

1. **Proposed payload investigation:** capture representative serialized page data and distinguish HTML, JavaScript and navigation/RSC responses. Trace referenced-item expansion to the fields actually consumed. Compare bytes before and after a server-side projection; verify public rendering, editing, links and required CMS metadata before adopting it. A smaller response alone is not correctness. **Documented App Router context:** the [component guide](https://nextjs.org/docs/app/getting-started/server-and-client-components) includes server-to-client props in the RSC payload; this is not a statement about every historical JSS payload shape.
2. **Proposed generation policy:** measure per-page and total build time, demand, freshness requirements and first-request behavior. Prebuild important routes and evaluate incremental generation for the remainder under the actual router/cache contract. **Documented:** [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) describes returning a subset of paths. Its treatment of unlisted paths depends on configuration. The [ISR guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration) explicitly separates implementations with and without Cache Components. Do not copy its non-Cache-Components recipe into the other mode.
3. **Proposed readiness check:** if route generation depends on a search index, verify a known recently published item is present before interpreting an empty query as missing content. Record the index/source and readiness evidence separately from browser hydration. No fixed indexing delay or universal page-count threshold is established here.
4. **Proposed middleware experiment:** inventory redirects, language handling, authentication and personalization responsibilities. Compare representative cached and uncached requests before and after an authorized removal. Disabling personalization is a product decision: obtain it and communicate the lost capability. Do not infer universal cache ordering from an unspecified middleware version.
5. **Proposed multisite comparison:** compare shared and separate deployment projects using equivalent workloads, required behavior, cost and operating responsibilities. Project separation is a hypothesis to measure, not a guaranteed speedup.

## Evidence and limits

No projection, middleware change, build or hosting comparison was executed. Private suggestions about inspection tools, reference expansion and remapping are investigation leads, not proof of a product defect or a safe transformation. Reported page-count recommendations, hours-long indexing and support-backed configuration changes are deliberately excluded because their applicable vendor evidence was not supplied. Retain those originals privately; obtain the actual support guidance before a rendering-definition change. This page adds application-delivery measurements rather than duplicating [batch timing](batch-time-and-history-indexes.md).
