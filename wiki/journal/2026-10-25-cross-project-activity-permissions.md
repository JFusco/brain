---
title: "Recover Brain activity recording across project sandboxes"
topics: [brain-skill]
plans: [2026-10-25-recover-cross-project-brain-usage-recording-e3fd54aa78.md]
---

# Recover Brain activity recording across project sandboxes

The Next.js migration chat returned Brain results with `metricsRecorded: false`
and no session. The activity database opened successfully from the Brain
workspace and passed SQLite's quick integrity check. This points to the other
chat's write boundary; its generic warning did not expose the underlying error.

Updated the shared Brain skill to use the host's approved permission mechanism
when Brain's activity directory is outside the chat's writable roots, verify
recording independently of retrieval, and retain approved access for reports.
The existing user-level links point to this skill, so no project edits or global
permission changes are needed. Existing chats must reread the updated section.

Recovery is bounded: retry a consultation once when it has no session, preserve
existing sessions and report event IDs, and disclose denied or continuing
failures. Retrieval remains available. The change does not replay lost activity
or change the database, viewer, or runtime permission enforcement.

## Verification

A controlled host-approved child sandbox denying activity-directory writes
reproduced SQLite error 8 (`attempt to write a readonly database`). A diagnostic
consultation from `/private/tmp` with approved host execution returned
`metricsRecorded: true`, created a session and recorded completion. The existing
viewer on port 4174 returned HTTP 200; its live event stream delivered
`search-started`, `search`, `returned`, `planned` and `complete` for that session.
This verifies event delivery, not a visual inspection of the animation or an
automatic retry in the already-running migration chat.

`pnpm run verify:ci` passed: 88 focused tests, 9 tooling tests, lint, formatting,
architecture, Brain and official-reference checks, wiki integrity and viewer
build. The viewer build retained its large-chunk advisory warning.
