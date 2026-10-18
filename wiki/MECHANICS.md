# Wiki mechanics

The wiki records why the project changed. Source code remains authoritative for current behavior, but it is never a node in the wiki graph.

## Same-delivery rule

When Claude, Codex, or Cursor executes a plan or makes a substantive change:

1. Archive the executed plan with `node scripts/wiki/archive-plan.cjs <plan> --status implemented --evidence "<commit, PR, test, or exact path>" --topic "<slug>"`. Use `partial` when only part was delivered.
2. Add a dated page under `wiki/journal/` describing the change, rationale, evidence, and affected topic pages.
3. Update durable decisions under `wiki/topics/`.
4. Run `node scripts/wiki/build-graph.cjs` and `node scripts/wiki/check.cjs`.

Implemented and partial plan archives require evidence and at least one existing topic. Plans classified as `not-implemented`, `superseded`, or `out-of-scope` remain audit rows in [the plan ledger](./plans/INDEX.md); their bodies are not copied into the wiki and may remain topicless.

## Frontmatter relationships

Topic links may be declared with `topics: [topic-slug]`. Journal entries may link archived plans with `plans: [archive-filename.md]`. Every referenced topic and plan must exist; unresolved relationships fail validation.

Ordinary relative Markdown links between wiki pages are graph relationships too. Links to code or other files outside `wiki/`, like web citations, do not become nodes or edges.

## Recovery and checks

- `node scripts/wiki/navigate.cjs --intent why|wiring|impact --query "<terms>"` returns the deterministic, byte-counted Markdown itinerary. Use exact `--from`/`--to` IDs after an ambiguous result; never bulk-load the wiki.
- In Brain, use `WIKI_HOME="$PWD/.state/wiki-plan-scope" node scripts/wiki/discover-plans.cjs` to inspect repository history/plans while excluding home agent session stores. The native hook sets this privacy scope automatically. Do not use unscoped home discovery in this repository.
- `node scripts/wiki/build-graph.cjs` deterministically regenerates the wiki-only graph and connection summary.
- `node scripts/wiki/check.cjs` rejects stale output, dangling relationships, non-wiki nodes, or executed archives without evidence and a topic.
- The installer-owned pre-commit block is fail-open: it warns, rebuilds, and stages generated graph artifacts without blocking uncertain execution classification or lifecycle failures. It preserves a preceding command's nonzero status so advisory wiki work cannot mask a blocking lint or test gate.

Brain removed the automatic merge and issue reconciliation workflows. Record history through the same-delivery rule above; Git history and PR descriptions remain the authoritative change log.
