---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/brain/issues/49", "scripts/lib/deduplication.mjs"]
source_tool: "codex"
source: "issue 49 delivery plan"
topics: ["incremental-collection"]
digest: "3a697901c08c2d6a2c56ae65cf1e804deddddabde0f101e750a422ee2f31eac6"
---

# Deliver incremental collection and daily duplicate review

1. Preserve unrelated primary-checkout edits; fetch main and create issue 49 and its isolated branch.
2. Apply only the collection, comparison, proposal, CLI, instructions and wiki changes to current remote main.
3. Update the existing daily curator prompt to require the merged comparison procedure and verify exact saved text, unchanged schedule and review/privacy limits.
4. Run existing runtime/privacy, official-integrity, syntax, whitespace and wiki checks with unchanged private configuration and verified historical vendor bytes.
5. Commit with native guards, push an issue-linked PR, read back exact content/head, await hosted checks, merge only the verified head and confirm immutable merged bytes.
