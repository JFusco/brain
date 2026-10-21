---
title: "Build the living visual Brain"
topics: [visual-brain]
---

# Build the living visual Brain

Added a local brain-shaped knowledge interface, committed-main snapshot graph, ranked reading lists with explanatory paths, explicit agent activity and persistent SQLite metrics. The wiki remains a separate dataset. Existing lookup selection behavior is retained through a shared ranking function.

Initial local evidence: frontend build, Brain check, official check and wiki integrity passed. Focused requests rejected cross-origin access, wrong Hosts, project-path input, private files, wiki nodes and stale note snapshots. Four concurrent duplicate read reports produced one count; repeated note opens and graph refreshes did not inflate counts. Browser inspection confirmed rendering and accessible search controls. Final review, recheck and Git delivery outcomes belong in the saved PR rather than being inferred from these initial checks.

Node SQLite emits its current experimental warning. The production frontend build reports a large-chunk advisory for the bundled 3D library. Neither warning is hidden. No tests, fixtures or unrelated project changes were added.

Evidence: https://github.com/JFusco/brain/issues/98.
