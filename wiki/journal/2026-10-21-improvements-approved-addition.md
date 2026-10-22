---
title: "Add five practical Brain workflows"
topics: [brain-skill]
---

# Add five practical Brain workflows

Implemented all five approved improvements: an on-demand task evidence briefing plus agent response guidance; four source-backed proposed playbooks; applicability and authored guidance comparisons with an unresolved verdict; one explicit private usefulness response per note content hash; and visual connection explanations with suggested next reading. New endpoints retain same-origin and current-main-snapshot checks. Existing ranking, manual capture and private activity data are preserved.

Brain check, official check, skill metadata validation, JavaScript syntax checks and viewer build passed. The build reports the large-bundle warning. Bounded local runtime checks verified brief evidence/context, explanations, comparison scope and temporary feedback write/read/repeat/clear; the temporary response was removed. Stale snapshots returned 409, unsupported fields 400 and cross-origin requests 403. The local browser displayed the briefing, applicability, connection explanations and comparison. New playbooks remain absent from main-based runtime until merge; publication and post-merge retrieval still require final verification. No tests, fixtures, QA agents or implementation-review agents were added.

Scope and authorization: [124](https://github.com/JFusco/brain/issues/124). Joe authorized commit, push, merge and merged-branch cleanup. No Google Search Central source is included.
