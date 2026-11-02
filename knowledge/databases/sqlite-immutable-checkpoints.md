---
title: "Checkpoint mutable SQLite state without rewriting history"
format: "playbook"
domain: "databases"
aliases: ["SQLite JSON checkpoint", "immutable ledger history", "canonical fingerprint rollback"]
evidence_date: "2026-11-02"
reviewed_at: "2026-11-02"
applicability: "Proposed design for application JSON checkpoints in SQLite; confirm true immutability, transaction boundaries, JSON support and reader compatibility"
provenance: "sqlite-docs@5e088b54752be53171f0b74a47b65d630245b14643436b96b97a1d7f840703cb; official SQLite JSON/UPDATE and better-sqlite3 API pages read 2026-11-02; SQLite forum explanation distinguished from engine contract; private performance reports not reproduced"
status: "current"
versions: []
---

# Checkpoint mutable SQLite state without rewriting history

## When to use this

Use when a tool repeatedly serializes one large JSON state row, including history that cannot change during the run. First measure compact serialized bytes by top-level key and time serialization separately from the database write. This is a proposed optimization, not a measured speedup.

## What to do

1. **Proposed:** after auditing every assignment site for immutability, store the fixed portion once in a separate table keyed by the same record ID. Insert it and the first mutable checkpoint in one transaction. Preserve every existing durability boundary, including pending intent before a remote request. Reduce bytes per checkpoint without redesigning the tool into an event store merely to achieve this split.
2. **Proposed:** use the database's insert-if-absent decision rather than an in-memory written-ID cache. A rolled-back insert must remain eligible on retry. Reject a conflicting existing immutable value; never silently keep different history. Reattach the fixed portion on every read.
3. **Proposed:** retain the application's canonical parsed-document hashing algorithm. Compare reconstructed values and fingerprints for every existing row before adoption; key order can be ignored only if the actual canonicalizer ignores it. Ordinary JSON serialization does not provide that guarantee.
4. **Proposed:** prepare and rehearse an offline rollback for old readers on an isolated copy. Restore missing history through a one-to-one ID join, validate every reconstructed record and fingerprint, and remove split rows only after validation, in the same successful transaction. Preserve the original database if any comparison fails. Require older readers to refuse incompatible state and use one authorized runtime per database during the transition.

**Documented SQL limits:** [SQLite JSON functions](https://sqlite.org/json1.html) distinguish `json_insert`, which does not replace an existing key, from `json_set`. A plain SQL text value becomes a JSON string; `json(...)` preserves its parsed structure. [UPDATE FROM](https://sqlite.org/lang_update.html) requires SQLite 3.33.0 or later. These mechanisms support a carefully checked rollback; they are not a generic ready-to-run migration. The [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md) documents transaction commit/rollback on synchronous return/throw; verify the installed binding's nested-transaction behavior before depending on it.

## Evidence and limits

A [SQLite forum explanation](https://sqlite.org/forum/forumpost/8019aa22f6?t=h) describes overflow-page rewrites when record length changes, and the optimization for unchanged page content. It is a dated explanation, not a promise that every update rewrites every page. SQLite's [internal/external BLOB study](https://sqlite.org/intern-v-extern-blob.html) measures historical read workloads; its size crossover is not a modern JSON checkpoint threshold or a reason to move this history outside the database.

Private reports describe an initial proposal and a later implementation, canonical comparisons and rollback timings. Those historical success and timing claims were not reproduced and are deliberately omitted here; they are not relabeled as proposed results. Validate disk/WAL behavior, failure recovery, storage growth and old-reader refusal in the adopting project. Keep the separate [backup/replay procedure](sqlite-backup-for-replay.md) when creating an experimental copy.
