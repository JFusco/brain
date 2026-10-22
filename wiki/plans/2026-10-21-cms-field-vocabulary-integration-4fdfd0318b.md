---
status: "implemented"
executed: true
evidence: ["scripts/lib/vocabulary.mjs", "scripts/lib/lookup.mjs", "scripts/nightly.mjs"]
source_tool: "codex"
source: "Requested CMS vocabulary integration"
topics: ["cms-field-vocabulary"]
digest: "4fdfd0318bc3a731f50673f88a42a254918b449948c06a769d6d27b1a30a9915"
---

# CMS field vocabulary integration

1. Pin the published CMS vocabulary dependency and read its JSON data on demand.
2. Extend lookup with explicit CMS profile selection and selected field facts,
   preserving product/version/surface boundaries and official evidence locators.
3. Report newer npm releases through local maintenance without changing the pin
   or widening routine catalog publication.
4. Document usage in README and the opt-in Brain skill; record the executed
   decision in the wiki and run applicable runtime and wiki checks.

Scope: local implementation only. No Git delivery, automatic dependency upgrade,
new official reference registration, fixtures, tests or review-agent audit.
