---
status: "implemented"
executed: true
evidence: ["scripts/lib/ui-patterns.mjs; scripts/lib/package-releases.mjs; local Banner lookup and npm release readback; no Git delivery"]
source_tool: "codex"
source: "user-request:UI-pattern-integration"
topics: ["ui-pattern-vocabulary"]
digest: "7e3eb512b3f8710186ec48b2bdc8d62911fc27da2fb9c1b009b97d6e8a363a1d"
---

# UI pattern lookup and shared release detection

1. Verify CMS vocabulary is merged and update clean main.
2. Pin the published UI Design Brain package, reading data without running its CLI.
3. Add opt-in pattern lookup with canonical names, contextual aliases, package identity and selected hash-checked guidance. Preserve accessibility authority limits and existing project design systems.
4. Extract the existing CMS advisory release checker, retain its commands and state, and reuse it for UI Design Brain in nightly claims and maintenance status. Detection never upgrades dependencies.
5. Document usage, record wiki history, and run applicable runtime, privacy, official and wiki checks. Add no tests, fixtures, review agents, hosted reference jobs or automatic upgrades.

Scope: local implementation only. No commit, push, PR or merge was requested.
