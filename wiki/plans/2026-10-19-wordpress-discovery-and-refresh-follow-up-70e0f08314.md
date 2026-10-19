---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/brain/issues/73; scripts/lib/capture.mjs; scripts/lib/documentation.mjs; scripts/lib/official.mjs; official/sources.json"]
source_tool: "codex"
source: "https://github.com/JFusco/brain/issues/73"
topics: ["wordpress-coverage"]
digest: "70e0f0831417c078fc519d957f2f8dec58a31db5010151faadd17f56666dfaaa"
---

# WordPress discovery and refresh follow-up

Complete issue 73 after the review of WordPress registration PR 72.

1. Expand the opt-in Brain skill description to include WordPress, TypeScript and accessibility.
2. Recognize WordPress-specific capture terms and prefer explicit WordPress context over tied React/frontend matches. Preserve explicit domain selection and other score ordering.
3. Watch the WordPress GitHub organization and Make WordPress AI; add the officially identified MCP adapter as a website pointer only.
4. Expose successful collection-index download counts in sync results, private source-run records and logs. Validate an optional maxIndexes integer from 1 to 128, keeping the default 32 and existing catalog digests and failure retention.
5. Run the scoped live refresh and existing runtime/privacy, official-integrity and wiki checks. Record evidence and rollback, deliver an issue-linked PR and merge the authorized maintenance change after saved-head verification.

Keep unrelated work intact. Defer shared title disambiguation, tests, fixtures, new CI, fresh-session checks, dedicated QA and review agents for v1. Never install or execute vendor tools.
