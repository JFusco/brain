---
title: "Discard obsolete responses from React effects"
domain: "react"
aliases: ["effect cleanup", "stale responses", "request races"]
evidence_date: "2026-10-16"
reviewed_at: "2026-10-16"
status: "current"
versions: ["react@19.3"]
applicability: "React 19.3 client Effects that manually fetch data; verify the target application's installed release"
provenance: "Partial candidate f4baa475d5f72287073b7024; react-docs@046f17d04295ba047bb5739026b4ac3110f17028; useEffect response SHA256 d4fd102c75df4194f5fa4eae8387f3a0aa7b4ba773c3a5ba29e41bf997a61cdb, fetched 2026-10-16T07:20:23.858Z"
---

# Discard obsolete responses from React effects

## When to use this

Use this when client-side data loading depends on changing props or state, and an older request can finish after a newer one.

## What to do

Prefer the framework's data-loading mechanism or an established client cache. When a manual Effect is necessary:

1. Declare every reactive input used by the Effect as a dependency.
2. Give each setup its own active-result guard. Cleanup invalidates that setup, so a late completion cannot overwrite current state.
3. Apply the guard to success and error updates. Awaiting a promise does not replace cleanup.
4. Keep cleanup correct across dependency changes, unmounting, and the extra development setup/cleanup cycle in Strict Mode.

An illustrative failure is selecting a second item while the first item's slower request is still pending: only the active selection's result should update the view.

## Evidence and limits

The [official React reference](https://react.dev/reference/react/useEffect#fetching-data-with-effects) documents the cleanup guard and recommends framework loading or client caching. The pinned catalog response was verified against its Git blob; the live reference identifies React 19.3. The private candidate supplied an observed lifecycle issue, not a reproduced benchmark or a compatibility guarantee for older releases. This guard protects UI state; it does not prove network cancellation, caching, or server authorization.
