---
title: "Discard obsolete responses from React effects"
domain: "react"
aliases: ["effect cleanup", "stale responses", "request races"]
evidence_date: "2026-10-20"
reviewed_at: "2026-10-29"
status: "current"
versions: ["react@19.3"]
applicability: "React 19.3 client Effects that manually fetch data; verify the target application's installed release"
provenance: "react-docs@0821e7d9428a6c58c922765b891bbffba9ed6249; official useEffect cleanup/dependency/Strict Mode guidance rechecked 2026-10-29; sanitized authored lifecycle observation, not rerun"
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

**Documented and revalidated October 20, 2026:** the [React useEffect reference](https://react.dev/reference/react/useEffect#fetching-data-with-effects) still invalidates an earlier request's result during cleanup, requires reactive dependencies and recommends framework loading or a client cache. The dependency-change, unmount and development Strict Mode cleanup rules were checked as well. The live reference identifies React 19.3; the refreshed pinned [useEffect source](https://github.com/reactjs/react.dev/blob/0821e7d9428a6c58c922765b891bbffba9ed6249/src/content/reference/react/useEffect.md) supports these same conclusions. A new repository revision did not change this advice.

**Proposed application of that rule:** guard error-state updates as well as success-state updates, because an obsolete setup should own neither. Awaiting a promise alone does not invalidate its completion.

**Historical observation:** sanitized authored evidence described a lifecycle issue; it was not rerun as a benchmark or application walkthrough here. The result guard protects UI state, not network cancellation, caching or server authorization. No compatibility guarantee for other installed releases is established.

**Revalidated October 29, 2026:** The current useEffect reference and refreshed pinned source still invalidate obsolete request results in cleanup, require reactive dependencies, and cover dependency changes, unmounting and the development Strict Mode cycle. Framework loading or a client cache remains the documented alternative. The [version page](https://react.dev/versions) identifies the rolling documentation as React 19.3. Guarding error updates remains a proposed extension; the historical application observation was not rerun.
