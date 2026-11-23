---
title: "Match nightly review notes to the required path set"
date: "2026-11-23"
topics: [automatic-knowledge-maintenance]
---

# Match nightly review notes to the required path set

A nightly content review for a diff with knowledge and wiki changes listed an extra wiki-plan row in `notes`. `prepare` compares the sorted `notes` paths with the set `publicationScope` derives and rejected the otherwise approved review. The validator was already correct, so the fix is guidance plus a regression test rather than new enforcement.

`scripts/nightly-content-review.md` now states that `notes` lists exactly the changed `knowledge/` files except domain hubs whose only edits are generated official/curated sections. Wiki and catalog paths never get a row; the reviewer still reviews every changed public path and records wiki findings in `summary`. `tests/nightly-decisions.test.mjs` asserts that an extra wiki row is rejected.

Issue: [JFusco/brain#439](https://github.com/JFusco/brain/issues/439).
