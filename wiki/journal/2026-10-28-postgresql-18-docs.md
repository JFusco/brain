---
topics: [database-coverage]
---

# Register PostgreSQL 18 documentation

[Issue 260](https://github.com/JFusco/brain/issues/260) adds `postgresql-18-docs` to the database domain. PostgreSQL 18 chapter links and explicitly selected architecture, row security, privileges, schema security, transaction isolation, locking, TLS, query-plan and recovery sections. The major is fixed at 18; minor documentation rolls. Other majors and development docs are excluded. Confirm the target server major before use.

Local evidence: run `node scripts/brain.mjs official sync postgresql-18-docs`, `check`, `official check`, focused lookup, `pnpm run verify:ci` and wiki integrity before delivery. The PR records actual outcomes; this journal describes scope, not hosted or database-runtime acceptance. Registration stops at the verified PR.

See [Database coverage](../topics/database-coverage.md).
