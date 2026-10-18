---
title: "Keep browser storage out of the hydration render"
domain: "react"
aliases: ["localStorage hydration", "server client mismatch", "browser storage"]
evidence_date: "2026-10-17"
reviewed_at: "2026-10-17"
status: "current"
versions: ["react@19.3", "react-dom@19.3"]
applicability: "React 19.3 server-rendered interfaces hydrated by React DOM; check the application's installed versions"
provenance: "Fully reviewed candidate 77ecee6e04f5e18fb6f30050; react-docs@046f17d04295ba047bb5739026b4ac3110f17028; useEffect SHA256 d4fd102c75df4194f5fa4eae8387f3a0aa7b4ba773c3a5ba29e41bf997a61cdb; hydrateRoot SHA256 01b552ea68e4e45a089fb2d00b528bfc56f206977ab88e1a125c9dd97c2618f6; Git blobs verified 2026-10-17"
---

# Keep browser storage out of the hydration render

## When to use this

Use this when a server-rendered interface reads browser storage for preferences or saved UI state and reports a hydration mismatch.

## What to do

1. Choose initial output that the server and first client render can both produce. A lazy state initializer still runs while rendering; putting a storage read there does not make it hydration-safe.
2. When browser-only content is necessary, read it after mount in an Effect and update state then. Keep a usable initial view while hydration finishes.
3. Keep that update repeatable in development Strict Mode. Treat mismatches as defects rather than assuming React will repair differing attributes.

Two-pass rendering adds work and can visibly change the page on slow connections. Use it sparingly; the initial view still matters.

## Evidence and limits

A private historical record reports fixing a storage-initializer mismatch by moving the read to a mount Effect. Its browser walkthrough was not repeated here. React's [Effect guidance](https://react.dev/reference/react/useEffect#displaying-different-content-on-the-server-and-the-client) explains matching initial output and client-only Effects; [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content) documents two-pass rendering and its cost. Both pinned source bodies were verified against Git blob hashes. This does not define storage validation, cross-tab synchronization, authorization or a blanket rule to put all state in Effects.
