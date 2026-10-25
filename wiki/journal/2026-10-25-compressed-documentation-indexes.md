---
title: "Bounded compressed documentation indexes"
topics: [automatic-knowledge-maintenance]
plans: [2026-10-25-compressed-documentation-index-validation-926ffded76.md]
---

# Bounded compressed documentation indexes

[Issue 227](https://github.com/JFusco/brain/issues/227) began with a Schema.org refresh reporting unexpected binary documentation. Later live requests returned plain XML, so the original response and its precise cause were not reproduced. The original failure, last-good catalog and maintenance receipts remain preserved.

A focused regression test reproduced the same validator error when a valid sitemap at an XML URL arrived with HTTP gzip encoding. The crawler previously selected decompression only from the input URL's gzip suffix. A leaf decoder now handles HTTP gzip and gzip byte signatures as well as gzip sitemap filenames, retaining the configured expansion bound before the existing document validation. HTTP gzip wrapping a gzip file is decoded in two bounded layers. Unsupported encodings, corrupt compression, decoded HTML challenges and binary data still fail; no host, size, content or privacy guard is bypassed.

The targeted live Schema.org sync succeeded with an unchanged catalog. Its response was uncompressed, so that live success does not establish that gzip caused the original incident. Compression-path acceptance comes from the controlled regression test, with separate expansion-limit and rejection coverage. No vendor bodies or private run evidence are part of the delivery.

This is an ordinary code PR that stops for review. It does not alter the daily 5 p.m. schedule, mark earlier failed runs successful, clear primary failure state or change dependency pins. The fixed checkout keeps its own source-verification observation; original receipts remain intact.
