---
status: "implemented"
executed: true
evidence: ["scripts/lib/harvest.mjs", "scripts/lib/deduplication.mjs", "scripts/lib/inbox.mjs"]
source_tool: "codex"
source: "repository implementation plan"
topics: ["incremental-collection"]
digest: "18503b94544a912eba956320f941761d9aa32dfbf74f68e049f9723a28485c04"
---

# Incremental collection and duplicate lesson review

1. Preserve unrelated dirty work and inspect the existing source/candidate identities.
2. Add source metadata checkpoints with nanosecond identity/change times, race checks, counters and an explicit rehash path.
3. Add bounded comparison retrieval and require curator semantic review decisions bound to current knowledge hashes before proposal publication; retain uncertain candidates and historical evidence.
4. Run the real collector once, inspect follow-up dry-run body-read counts, and use an existing eligible candidate for comparison retrieval. Keep tests and fixtures deferred.
5. Document behavior and limits, archive this executed plan, rebuild/check the wiki and run existing runtime privacy/content checks. Leave changes local because this request did not request Git delivery.
