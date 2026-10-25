---
title: "Domain-aware activity pulses"
date: "2026-10-24"
topics: ["visual-brain"]
---

# Domain-aware activity pulses

[Issue 225](https://github.com/JFusco/brain/issues/225) makes live activity legible in the viewer. Previously every lookup and capture pulsed at the galaxy core, a second capture restarted the capture nebula mid-animation, and nothing remained a few seconds later. Joe approved the design before implementation.

`search-started` events (from `lookup --domain`, `route` and viewer searches with a domain) and `captured` events now name the configured domain by its public hub node, for example `knowledge/tailwind/INDEX.md`. Unknown domains and any other text record no node, and query and capture text are never recorded. Captures still count in daily totals but not toward a hub's per-node usage. `capture` output now includes the assigned domain.

In the viewer:
- A lookup sends a cyan comet from the core to the searched domain, then blooms at each domain holding found notes. Empty and failed lookups pulse grey and red at the core.
- Captures queue first-in, first-out, and each violet nebula condenses at its domain's rim sector. Beyond three waiting, later ones play a three-second version instead of eight, and beyond twelve a 1.5-second one.
- Agent reads and citations get a small halo on the note, including in focused mode when the note is shown.
- Each pulsed domain keeps a capped afterglow that fades over about a minute.
- A heartbeat strip beside the live indicator shows five minutes of coloured blips and a queued-capture count.
- Pending rim points now sit at their domain's sector angle, so a capture lands where its point appears. Reduced motion replaces travel and expansion with static flashes.
- Events without a domain fall back to the core.

Verification ran `pnpm run verify:ci` with new contract tests for hub naming, sector anchors and the queue policy. A local lookup's server-sent event carried the hub node. The animations were not visually inspected by the author because browser automation was unavailable. See [visual Brain](../topics/visual-brain.md).
