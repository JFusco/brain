---
title: "Layer the visual Brain backend"
date: "2026-10-24"
topics: [code-quality, visual-brain]
---

# Layer the visual Brain backend

[Issue 157](https://github.com/JFusco/brain/issues/157) is phase 3e of the cleanup. `scripts/lib/visual-brain/` is replaced by layered modules, so `scripts/lib/` now holds only `leaf/`, `branch/` and `tree/`.

| Old module | New modules |
| --- | --- |
| `snapshot.mjs` (254 lines; one 205-line function) | `branch/visual/snapshot/{blobs,ids,graph,knowledge-nodes,catalog-nodes,links,snapshot,health}`. Passes run in the original order, so node insertion and edge order are unchanged. |
| `server.mjs` (213 lines; one 175-line function) | `tree/visual/server/{request,api-get,api-post,static,server}`. The loopback same-origin check, strict request fields and the asset allowlist are pure functions with tests; check order is unchanged. |
| `metrics.mjs` | `branch/activity/{database,sessions,events,summary}` |
| `retrieval.mjs` | `branch/visual/{connecting-path,intake}`, `branch/activity/reporting`, `tree/visual/route` |
| `guidance-tools.mjs`, `feedback.mjs` | `branch/visual/guidance-graph`, `tree/visual/{explain,compare,playbooks,brief,feedback}` |

`brain.mjs` keeps loading these on demand. The guidance commands now go through an explicit map, and retrieval's unused `startSession`/`snapshot` re-export is removed.

Verification:
- The full snapshot graph, 10,036 nodes and 10,326 edges, hashes identically from the old and new code, and so does the health overlay.
- A visual replay ran in fresh throwaway clones for `main` and this branch. Its 1,393 normalized lines were identical. It covered:
  - the snapshot hash;
  - explain, compare, playbooks, brief, route and the activity summary;
  - the live server: graph, intake, metrics, index, asset, note and events, plus every guard (wrong host, cross origin, cross site, missing POST origin, wrong content type, PUT, extra fields, a stale snapshot, a bad feedback value, unknown notes and assets, path traversal).
- The read-only command baseline is unchanged, apart from `check`'s scanned-file count.
- `pnpm run verify:ci` passed.
