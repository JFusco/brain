---
status: "implemented"
executed: true
evidence: ["scripts/lib/visual-brain; web/brain; issue JFusco/brain#98"]
source_tool: "codex"
source: "issue:JFusco/brain#98"
topics: ["visual-brain"]
digest: "13ece996ca383b8ec46473cacb9561384f98c9c0b7c0293108f826032cf5ed82"
---

# Living visual Brain

## Outcome

Build an independently reviewable local knowledge interface using 3d-force-graph and Node 24 SQLite. Markdown/Git remain authoritative. Keep wiki and Brain datasets separate. No hosting, Supabase, model chat, embeddings, automatic publication, replay, new tests or fixtures. User subsequently authorized independent implementation reviews, precise repairs, merges after passing checks and branch/worktree cleanup.

## Interface and snapshot

Add a vanilla JavaScript frontend with pinned dependencies and a lockfile. Build assets locally. Add `visual serve` on loopback port 4174 with an override, strict Host/Origin validation, bounded APIs and approved asset/node IDs. Browser requests cannot select project paths. Display note text inertly and open HTTPS official references externally. Preserve project manifest lookup through the CLI only.

Read approved knowledge Markdown and official registry/lock/catalog blobs from one committed local main snapshot. Exclude wiki, templates, retired/superseded notes, private operational data and working edits. Return the snapshot ID. Refresh graph/content together on local main changes, never fetching remotes automatically. Derive connections only from explicit links and domain/source membership. Generate the graph in memory rather than publishing another catalog.

Arrange domain clusters in a two-hemisphere brain silhouette with stable anchors, restrained glow, breathing and bounded drift. Add orbit/zoom, focus, search, domain/version filters, node details, source expansion, pause and reduced motion. Stop rendering in hidden tabs. Keep an accessible text result list. Decorative motion does not imply evidence retrieval.

## Retrieval and events

Share existing ranking and compatibility behavior. Route returns up to five ranked sources and optional explanatory shortest paths from the highest-ranked result to other selected results. Apply version eligibility to intermediate nodes too. Preserve disconnected results. Paths explain relationships and do not prescribe unnecessary reading. Reuse pure utilities without loading wiki content. Preserve ordinary lookup results.

Add explicit session/activity commands and opt-in skill guidance. Record planned paths, returned results, opened content, agent-reported reads/citations and completion distinctly. Unknown external references never create arbitrary nodes. Update the viewer through SSE within roughly two seconds; reconnect refreshes current state without recounting. Do not imply passive file monitoring or observe unrelated chats.

## Metrics and overlays

Store private SQLite metadata under ignored .state/visual-brain. Instrument ordinary lookups while the viewer is closed. Store only IDs, snapshot identifiers, event types and timestamps; no questions, answers, project paths, transcripts or vendor bodies. Use transactional writes and stable retry IDs. One returned appearance per result per lookup; reads/citations once per session/node/type. Sessions expire at 24 hours; retain event detail and deduplication 30 days, with permanent daily aggregates. Use America/New_York calendar dates for today, seven-day and all-time views. Counters span revisions and represent recorded activity rather than authority.

Display totals, node counts, last use, frequently used knowledge, recent activity and usage heat. Health uses existing revalidation and link-check records; unknown remains unknown. Domain coverage shows notes, references and usage. Highlight new knowledge on snapshot refresh. Count zero-result searches without storing text. Metrics failures must leave retrieval available, report missing recording and never reset damaged storage. Preserve databases on code rollback; document stopped-process backups.

## Validation and delivery

Run Brain privacy/runtime checks, official check, frontend build and wiki integrity. Perform focused manual browser, access-boundary, duplicate/concurrent event, persistence, version filtering and snapshot checks. Record actual failures and evidence; do not claim production or full audit acceptance. Update the wiki in the same delivery with scoped plan discovery, archive, journal/topic records and generated graph. Preserve hooks and disabled reference Actions. Run the authorized implementation-review workflow, repair accepted findings and independently recheck. Verify PR contents and heads, require passing Wiki integrity, then merge and remove only merged branches/worktrees whose tips match the saved heads. Preserve private metrics/review evidence during cleanup.
