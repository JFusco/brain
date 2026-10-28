---
topics: [database-coverage]
---

# Register Microsoft PostgreSQL agent skills

[Issue 265](https://github.com/JFusco/brain/issues/265) adds `microsoft-postgres-skills` to the database domain. Microsoft official PostgreSQL best-practices skill and its supporting general-engine and Azure references. Only that skill subtree is selected; the separate graph skill is excluded. References are pinned to the synced MIT repository commit. Check provider/version/capabilities; cataloging does not activate postgres-mcp, Azure CLI or resource operations.

Local evidence: run `node scripts/brain.mjs official sync microsoft-postgres-skills`, `check`, `official check`, focused lookup, `pnpm run verify:ci` and wiki integrity before delivery. The PR records actual outcomes; this journal describes scope, not hosted or database-runtime acceptance. Registration stops at the verified PR.

See [Database coverage](../topics/database-coverage.md).
