---
title: "Choose image loading by visibility"
domain: "performance"
format: "playbook"
aliases: ["lazy loading", "LCP", "image performance playbook"]
evidence_date: "2026-10-21"
applicability: "Browser-delivered images; identify the likely LCP element and actual viewport conditions before choosing loading behavior"
provenance: "webdev-performance@018376bb81e7f77d0c2c23e8e554bac4297163b42153876117c519de5e69c174; official pages read for this proposed workflow; no target application run"
status: "current"
versions: []
reviewed_at: "2026-10-21"
---

# Choose image loading by visibility

## When to use this

Use this when a content-heavy page loads too much media or its main image appears late. Identify the visible content and likely Largest Contentful Paint (LCP) element in the target application.

## What to do

**Proposed practice:**

1. Inventory initial-view images separately from images farther down the page. Confirm the layout at relevant viewport widths.
2. Keep the likely LCP image discoverable and avoid lazy-loading it. Evaluate native lazy loading for images that are initially offscreen.
3. Choose appropriately sized resources and reserve image space. Check the application's image component and CMS transformation behavior rather than assuming every source image is served efficiently.
4. Measure the actual page before and after a change. Report what was measured using the [evidence guidance](../frontend/match-evidence-to-claim.md); do not infer an improvement from an attribute change alone.

## Where guidance differs

**Documented decision branch:** lazy loading can defer offscreen image work, while applying it to an initial-view or likely LCP image can delay important content. These recommendations apply to different visibility conditions. Re-evaluate when responsive layout changes which image appears first; do not apply one loading rule to every CMS image.

## Evidence and limits

The official [lazy-loading module](https://web.dev/learn/performance/lazy-load-images-and-iframe-elements) explains the visibility/LCP boundary, and [image performance](https://web.dev/learn/performance/image-performance) covers efficient image delivery. This workflow is proposed; no target site was benchmarked. It does not prove field Core Web Vitals, prescribe a framework image API, or establish which element is the LCP candidate without measurement.
