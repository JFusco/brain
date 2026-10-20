---
title: "Keep browser storage out of the hydration render"
domain: "react"
aliases: ["localStorage hydration", "server client mismatch", "browser storage"]
evidence_date: "2026-10-20"
reviewed_at: "2026-10-20"
status: "current"
versions: ["react@19.3", "react-dom@19.3"]
applicability: "React 19.3 server-rendered interfaces hydrated by React DOM; check the application's installed versions"
provenance: "react-docs@ae5e48074d4f73f1e349eda2a66841f9a959023e; official useEffect/hydrateRoot guidance rechecked 2026-10-20; sanitized historical storage-initializer observation, not rerun"
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

**Documented and revalidated October 20, 2026:** React's [Effect guidance](https://react.dev/reference/react/useEffect#displaying-different-content-on-the-server-and-the-client) still requires matching initial output and explains that Effects run only on the client. [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content) still documents the additional render in a two-pass approach, its user-visible cost and the need to fix mismatches. These sections and development Strict Mode behavior were read again; the live references identify React 19.3. The refreshed pinned sources support keeping the existing procedure, rather than treating a repository revision change as new advice.

**Application limit:** use a post-mount storage read for state that an already server-rendered component needs after hydration; it is not a blanket instruction to put all state or every browser-only component in Effects. A lazy initializer still executes as part of rendering and does not itself defer the read until after mount.

**Historical observation:** sanitized authored evidence reports moving a storage-initializer read to a mount Effect. Its browser walkthrough was not repeated. Storage validation, cross-tab synchronization, authorization and compatibility with other installed React versions remain outside this note.
