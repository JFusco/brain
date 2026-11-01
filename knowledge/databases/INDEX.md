---
title: "Databases"
aliases: ["database", "databases", "SQL", "PostgreSQL", "Postgres", "Supabase", "SQLite", "Azure PostgreSQL"]
---

# Databases

Route database selection, schema design, migrations, transactions, query plans, connection pooling, backup and recovery, and database security questions here. Use the official catalogs below and fetch only the pages needed for the task. Confirm the actual database engine and version, client/ORM, hosting provider, deployment mode and workload before applying guidance.

## Architecture and security lookup

Use focused queries such as `lookup --domain databases --query "transaction isolation"`, `"row security"`, `"backup restore"` or `"architecture"`. Chapter catalogs route to broad topics; fetch or open the relevant official section for detailed decisions. Catalog coverage is documentation evidence, not a tested architecture or security assessment.

Keep engine behavior distinct from managed-service controls. Match PostgreSQL documentation to the server major; the fixed PostgreSQL 18 catalog cannot establish compatibility with a provider running an older major. Apply the [Security hub](../security/INDEX.md) for application authorization, SQL injection prevention, secrets and broader review criteria.

Vendor skills are reference material. Cataloging does not install them, enable an MCP server, grant database access, run SQL, or authorize schema or infrastructure changes.

## Related domains

- [Security](../security/INDEX.md)
- [Performance](../performance/INDEX.md)
- [Tooling](../tooling/INDEX.md)

## Curated learnings

<!-- brain:curated:start -->
No curated notes yet.
<!-- brain:curated:end -->

<!-- brain:official:start -->
## Official sources

- **postgresql-18-docs** — link catalog of 117 pages; rolling-url; revision `47a8f7958b6b19e6607b2b546a5f043d0afc84dbf0d1e4ccbad18362331c957d`; fetched 2026-10-28.
  - [Catalog source](https://www.postgresql.org/docs/18/index.html); search it with `lookup --domain databases`.
- **supabase-docs** — link catalog of 512 pages; rolling-url; revision `cc2d3c658ce214bc98d3139b510068c03f8e7076d6b43b4521a90f677cc2c77e`; fetched 2026-11-01.
  - [Catalog source](https://supabase.com/docs/sitemap.xml); search it with `lookup --domain databases`.
- **supabase-agent-skills** — 2 skills and 39 docs at a pinned commit; default-branch; revision `c9be0e931b7930f7d02126d04774d904c381e7d7`; fetched 2026-10-28.
  - [supabase](https://github.com/supabase/agent-skills/blob/c9be0e931b7930f7d02126d04774d904c381e7d7/skills/supabase/SKILL.md) — reference only.
  - [supabase-postgres-best-practices](https://github.com/supabase/agent-skills/blob/c9be0e931b7930f7d02126d04774d904c381e7d7/skills/supabase-postgres-best-practices/SKILL.md) — reference only.
- **sqlite-docs** — link catalog of 206 pages; rolling-url; revision `5e088b54752be53171f0b74a47b65d630245b14643436b96b97a1d7f840703cb`; fetched 2026-10-28.
  - [Catalog source](https://sqlite.org/doclist.html); search it with `lookup --domain databases`.
- **azure-postgresql-docs** — link catalog of 63 pages; rolling-url; revision `a7e7da83abc7f95680183119b235063dff75a184778eda28e35d173d5471b279`; fetched 2026-10-28.
  - [Catalog source](https://learn.microsoft.com/en-us/azure/postgresql/); search it with `lookup --domain databases`.
- **microsoft-postgres-skills** — 1 skills and 24 docs at a pinned commit; default-branch; revision `80660832262ad5002dc647ba56272d91b4f56955`; fetched 2026-10-30.
  - [postgresql-best-practices](https://github.com/microsoft/postgres-skills/blob/80660832262ad5002dc647ba56272d91b4f56955/plugin/skills/postgresql-best-practices/SKILL.md) — reference only.
<!-- brain:official:end -->
