---
title: "Choose SQLite connection durability explicitly"
format: "playbook"
domain: "databases"
aliases: ["SQLite synchronous FULL", "node sqlite defaults", "BEGIN IMMEDIATE", "SQLite optimize"]
evidence_date: "2026-11-06"
reviewed_at: "2026-11-06"
applicability: "SQLite WAL services and binding changes; Node API details checked against 24.14.0, not every Node build"
provenance: "sqlite-docs@5e088b54752be53171f0b74a47b65d630245b14643436b96b97a1d7f840703cb; nodejs-24-docs@ff36dfdb2741f2c837d57f053c8439266912fb7e2bf91afc9b4a36d23352ec42; SQLite official pages, Node 24.14.0 API source and better-sqlite3 performance guide read 2026-11-06; practices proposed, private runtime reports not reproduced"
status: "current"
versions: []
---

# Choose SQLite connection durability explicitly

## When to use this

Use when a local service records intent before a remote mutation, keeps connections open, or changes SQLite bindings. Decide what must survive a lost commit before choosing performance settings.

## What to do

1. **Documented:** in WAL mode, [NORMAL preserves consistency but can lose recent commits after power loss or an operating-system crash](https://sqlite.org/pragma.html#pragma_synchronous). [WAL synchronization](https://sqlite.org/wal.html#performance_considerations) differs between FULL commits and NORMAL checkpoints. **Proposed:** use explicit `synchronous=FULL` when losing a committed intent could cause an unsafe resend. Verify the filesystem/storage honors synchronization. This does not atomically commit a remote effect or provide exactly-once delivery; retain provider reconciliation. NORMAL may fit recomputable or safely retryable data.
2. **Proposed:** record and read back `journal_mode`, `synchronous`, busy timeout, foreign-key enforcement and relevant compile options per connection after binding/build upgrades. The [better-sqlite3 distribution](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md#a-note-about-durability) documents WAL NORMAL as its compile default. Do not assume another binding shares it. Reduce oversized checkpoint writes before weakening required durability; use the separate [immutable-checkpoint design](sqlite-immutable-checkpoints.md).
3. **Documented Node boundary:** the [24.14.0 API source](https://github.com/nodejs/node/blob/v24.14.0/doc/api/sqlite.md) documents `DatabaseSync` busy `timeout` default 0, foreign-key enforcement default true and defensive mode default true from 24.14.0. That version labels `node:sqlite` active development. It exposes `exec`, `isTransaction`, `createTagStore()` and `backup()`; it does not document the better-sqlite3 `transaction()` helper. **Proposed:** select explicit connection options and cache hot prepared statements deliberately. Recheck availability and API stability for the installed release.
4. **Documented:** [deferred read-to-write upgrades can fail](https://sqlite.org/lang_transaction.html); WAL has a specific [BUSY_SNAPSHOT case](https://sqlite.org/rescode.html#busy_snapshot). A [busy handler may be skipped to avoid deadlock](https://sqlite.org/c3ref/busy_handler.html). **Proposed:** for known write transactions, consider short `BEGIN IMMEDIATE` units, with provider/network calls outside. IMMEDIATE can still return BUSY; provide bounded error handling. For synchronous wrappers, reject returned promises and preserve rollback handling rather than allowing asynchronous work to outlive the transaction.
5. **Documented:** [SQLite recommends `PRAGMA optimize=0x10002` on opening long-lived connections](https://sqlite.org/pragma.html#pragma_optimize), then `PRAGMA optimize` periodically and after schema changes such as CREATE INDEX. **Proposed:** consider a graceful-close pass where appropriate; measure planner benefit for the workload.

## Evidence and limits

No power-loss, cross-process contention, binding comparison or planner benchmark was performed. Private reports of build-specific pragma values, successful integrity checks and workload sizes are deliberately omitted as general guarantees. Query the actual build rather than copying those values. Keep the [consistent backup/replay procedure](sqlite-backup-for-replay.md) separate from connection tuning.
