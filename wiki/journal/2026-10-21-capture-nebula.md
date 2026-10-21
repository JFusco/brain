---
title: "Make capture arrivals and the nebula visible"
topics: [visual-brain]
---

# Make capture arrivals and the nebula visible

Joe requested visible star arrivals and a clear nebula reaction when a capture is received, and explicitly included the existing uncommitted galaxy/activity work in delivery.

`web/brain/capture-nebula.js` adds a reusable pool of 96 decorative stars, nine cloud sprites and an expanding ring. Each live capture batch restarts an eight-second arrival/bloom. It runs independently of lookup feedback and remains visible while a knowledge star is focused. A separate status notice labels the capture as pending curation. Reduced motion shows a static response; visible-frame timing holds the effect during hidden tabs. Existing pending counts remain metadata-only, and no published nodes or relationships are fabricated. Intake events remain relevant across knowledge snapshot changes.

Local validation: frontend build, JavaScript syntax checks, Brain content/privacy check and official-reference check passed. The existing large-bundle advisory remains. The local viewer server started successfully. Browser inventory was empty, so visual appearance and a real capture event were not browser-verified; no dummy captures, tests, fixtures or review agents were added.

A direct runtime smoke check confirmed 96 finite star positions, nine cloud sprites, focused scaling, a hidden ring under reduced motion and effect completion with a single reusable scene group. Final wiki integrity and whitespace checks passed. The temporary verification server was stopped.

The initial delivery attempt stopped before issue creation: shell GitHub access failed DNS resolution, and the connector returned HTTP 403. Joe then installed the connection for the personal account. Connector issue creation succeeded as [issue 102](https://github.com/JFusco/brain/issues/102), and remote main matched the local baseline. Delivery uses an isolated issue worktree, local privacy hooks and the GitHub connector for remote writes. The original checkout's edits remain preserved; the earlier access failure did not trigger an alternate publication or bypass.

See [Living visual Brain](../topics/visual-brain.md) for the durable behavior and privacy boundary.
