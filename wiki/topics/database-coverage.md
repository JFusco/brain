# Database coverage

Database references live in the dedicated [Databases hub](../../knowledge/databases/INDEX.md), keeping large database catalogs out of frontend and application-security lookup rankings. The Security hub links to it. Distinctive engine/provider keywords route captures; generic SQL, query, table and schema words do not.

Source registrations are separately reviewed, stacked issue-linked PRs. No source registration merges automatically. Catalogs store bounded links and metadata; downloaded vendor bodies stay out of Git. Skills remain reference-only and are never installed or executed by source sync.

## PostgreSQL 18 documentation

[Issue 260](https://github.com/JFusco/brain/issues/260): PostgreSQL 18 chapter links and explicitly selected architecture, row security, privileges, schema security, transaction isolation, locking, TLS, query-plan and recovery sections. The major is fixed at 18; minor documentation rolls. Other majors and development docs are excluded. Confirm the target server major before use.

## Supabase documentation

[Issue 261](https://github.com/JFusco/brain/issues/261): Supabase guide sitemap filtered to database, Auth/RLS, API, security, migrations/local development, deployment, platform, storage, realtime, functions, observability and self-hosting. Excludes API reference, blogs and pricing. Rolling product guidance requires plan, hosting mode, server and client version checks.

## Supabase native agent skills

[Issue 262](https://github.com/JFusco/brain/issues/262): Supabase native product skill and Postgres best-practices skill, including their supporting references, from the official MIT repository. Pinned to the locally synced commit; reference-only. Provider-specific security and workload-dependent optimization examples are not universal engine contracts.

## SQLite documentation

[Issue 263](https://github.com/JFusco/brain/issues/263): SQLite alphabetical document index supplies architecture, engine selection, transactions/WAL, query planning, backup, corruption and defensive security. This bounded index is not a full C API catalog. No SQLite-maintained agent skill was found in the scoped official-source search; this does not prove none exists. Check the embedded engine version and compile options.

## Azure PostgreSQL documentation and architecture

[Issue 264](https://github.com/JFusco/brain/issues/264): Azure Database for PostgreSQL landing-page links plus selected Microsoft Well-Architected, security hardening, access management, security baseline and performance-planning pages. Flexible Server only; not a full Learn manual. Old landing-page links may redirect to reorganized sections; a redirect is not verification of technical content. Microsoft documentation repository discovery returned 404, so this registration uses the retrieved HTML index.

