---
title: "Accelerate the historical Slack scan"
topics: ["incremental-collection"]
plans: ["2026-11-22-accelerate-the-historical-slack-scan-e010205fc5.md"]
---

# Accelerate the historical Slack scan

The historical rotation now prepares up to four channel windows of 28 days
per nightly run. The current scan runs first. Provider pagination and scope
gaps still control checkpoint advancement. A persisted cursor keeps both
bounds, including the original seven-day window for older cursors.

The focused regression test covers the larger rotation, successful checkpoint
advancement, retry gaps, and legacy and new cursor bounds. Actual provider
capacity for the larger windows requires evidence from a scheduled run.
