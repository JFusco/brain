---
topics: [database-coverage]
---

# Register Supabase documentation

[Issue 261](https://github.com/JFusco/brain/issues/261) adds `supabase-docs` to the database domain. Supabase guide sitemap filtered to database, Auth/RLS, API, security, migrations/local development, deployment, platform, storage, realtime, functions, observability and self-hosting. Excludes API reference, blogs and pricing. Rolling product guidance requires plan, hosting mode, server and client version checks.

Local evidence: run `node scripts/brain.mjs official sync supabase-docs`, `check`, `official check`, focused lookup, `pnpm run verify:ci` and wiki integrity before delivery. The PR records actual outcomes; this journal describes scope, not hosted or database-runtime acceptance. Registration stops at the verified PR.

See [Database coverage](../topics/database-coverage.md).
