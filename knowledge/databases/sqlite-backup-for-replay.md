---
title: "Snapshot SQLite safely before an isolated replay"
format: "playbook"
domain: "databases"
aliases: ["SQLite WAL backup", "better-sqlite3 backup", "isolated replay"]
evidence_date: "2026-11-02"
reviewed_at: "2026-11-02"
applicability: "SQLite online backup and current better-sqlite3 API documentation; filesystem and application coordination require project-specific checks"
provenance: "sqlite-docs@5e088b54752be53171f0b74a47b65d630245b14643436b96b97a1d7f840703cb; SQLite online backup/WAL and better-sqlite3 API pages read 2026-11-02; replay procedure proposed, historical timings omitted"
status: "current"
versions: []
---

# Snapshot SQLite safely before an isolated replay

## When to use this

Use when profiling or replaying a local SQLite workload while its original database may still have a writer. An authorized experimental copy must be isolated from the live writer's coordination and external effects.

## What to do

**Documented:** SQLite's [online backup API](https://sqlite.org/backup.html) copies a database through SQLite and supports incremental work while other clients continue. With [WAL](https://sqlite.org/wal.html), the WAL file can hold committed changes absent from the main file. Copying only the main file, or independently copying live main/WAL/shared-memory files, does not establish a consistent snapshot.

**Proposed procedure:**

1. Open an authorized source connection read-only when supported and await `db.backup(destination)` using the installed binding's documented API. Select a new destination and handle failure before treating it as usable. The [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md) returns a promise; writes through another connection can restart the backup, so do not assume an invocation-time snapshot or guaranteed completion under continuous writes. Record completion time and the application revision/state actually captured.
2. Keep a pristine copy; run each experiment on a fresh clone. Copy-on-write can reduce copying cost where supported, but does not replace SQLite-consistent backup or effect isolation. On macOS, the installed `cp` manual documents `cp -c -R` for cloning surrounding non-database files; `-c` falls back to ordinary copying when the target filesystem lacks clone support. Keep the live database on the backup-API route.
3. Isolate leases, lock registries, state directories and output paths outside the database, and disable unauthorized remote effects. A replay must never acquire the live writer's lease. Confirm the application supports the selected isolation controls.
4. If referenced inputs moved, reconcile only the necessary references on the experimental copy from retained evidence. Compare the entire replay output and its canonical fingerprint with the intended baseline before trusting timings. Do not alter the live source to make a replay match.

## Evidence and limits

No backup or replay was performed during curation. Historical database sizes, elapsed times and successful replay claims remain private, unverified incident reports. Backup consistency does not by itself identify the historical application state desired for a replay; moved references and external files require their own evidence. Use [immutable checkpoint guidance](sqlite-immutable-checkpoints.md) separately when changing what is stored.
