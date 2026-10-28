---
topics: [database-coverage]
---

# Register Azure PostgreSQL documentation and architecture

[Issue 264](https://github.com/JFusco/brain/issues/264) adds `azure-postgresql-docs` to the database domain. Azure Database for PostgreSQL landing-page links plus selected Microsoft Well-Architected, security hardening, access management, security baseline and performance-planning pages. Flexible Server only; not a full Learn manual. Old landing-page links may redirect to reorganized sections; a redirect is not verification of technical content. Microsoft documentation repository discovery returned 404, so this registration uses the retrieved HTML index.

Local evidence: run `node scripts/brain.mjs official sync azure-postgresql-docs`, `check`, `official check`, focused lookup, `pnpm run verify:ci` and wiki integrity before delivery. The PR records actual outcomes; this journal describes scope, not hosted or database-runtime acceptance. Registration stops at the verified PR.

See [Database coverage](../topics/database-coverage.md).
