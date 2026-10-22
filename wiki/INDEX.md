# Context wiki

This wiki is the durable project record for decisions, executed plans, and substantive change history.

## Start here

- [Wiki mechanics](./MECHANICS.md) — authoring, plan capture, validation, and automation.
- [Plan ledger](./plans/INDEX.md) — executed-plan archives and historical audit results.
- [Automatic knowledge maintenance](./topics/automatic-knowledge-maintenance.md) — curation, documentation coverage, privacy, automation, and audit findings.
- [Incremental collection](./topics/incremental-collection.md) — skip unchanged source bodies and compare lessons before publication.
- [WordPress coverage](./topics/wordpress-coverage.md) — official developer handbooks and reference-only agent skills.
- [CMS field vocabulary](./topics/cms-field-vocabulary.md) — pinned field facts, explicit profiles and advisory release detection.
- [UI pattern vocabulary](./topics/ui-pattern-vocabulary.md) — optional component naming and guidance, with shared package release detection.
- [Opt-in Brain skill](./topics/brain-skill.md) — use Brain from Claude Code, Codex and Cursor without loading it into every session.
- `wiki/topics/` — durable decision and domain pages.
- `wiki/journal/` — chronological substantive-change entries.
- `wiki/connections.md` — generated relationship summary.

For a direct single-topic history or rationale question, use the links above and open only the page they route to. Only for a cross-page question, run `node scripts/wiki/navigate.cjs --intent why --query "<terms>"` (or `wiring` / `impact`) and read only its byte-counted itinerary. Never bulk-load `wiki/` or `scripts/wiki/graph/data/graph.json`. If navigation returns candidates or no route, retry with exact Source and Target node IDs; if ambiguity remains, ask one focused question or use one targeted `rg`.

Wiki navigation is command-line only. The visual Brain is a separate knowledge interface; wiki content never enters its graph.
