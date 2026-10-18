---
title: "Preserve hosted preparation state in publication"
date: "2026-10-18"
topics: ["hosted-maintenance", "automatic-knowledge-maintenance"]
issue: 'https://github.com/jfusco/brain/issues/45'
issues: ['https://github.com/jfusco/brain/issues/45']
---

# Preserve hosted preparation state in publication

The first real hosted run 39136114299 completed its jobs, but the receipt showed 24 prepared link observations reduced to nine writer observations. The writer had loaded the checkpoint JSON without importing its link/source state into the existing CLI files, then saved empty/fresh writer state over it. This also lost source refresh history and due-time continuity.

The publisher now imports the validated, run/attempt-bound prepared checkpoint before further checks and preserves same-attempt source success even when the prepared lock has not yet been replayed. Prior-run lock mismatch handling stays conservative. The fresh verifier rejects lost source-attempt records or a link checkpoint smaller than the prepared sample. No old successful receipt is rewritten; its coverage limitation remains evidence.

Local scheduling remains unchanged until actual hosted continuity is verified. Rollback reverts this scoped handoff fix; preserve previous receipts and failed state. No fabricated warnings, fixtures, tests or private-state upload were used.
