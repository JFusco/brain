---
title: "Split core helpers and fix the mutation lock"
date: "2026-10-23"
topics: [code-quality]
---

# Split core helpers and fix the mutation lock

[Issue 147](https://github.com/JFusco/brain/issues/147) is phase 3a of the cleanup. `scripts/lib/core.mjs` is replaced by focused, layered modules:
- `leaf/paths`, `leaf/hash`, `leaf/json`, `leaf/fs-safe`, `leaf/cli-args` and `leaf/time`;
- `branch/platform/config`, `branch/platform/lock` and `branch/platform/log`.

Its 28 importers now import only what they use. Function bodies moved by extraction, not retyping.

On-disk and package JSON reads in `vocabulary`, `ui-patterns`, `cache`, `official`, `privacy` and `snapshot` now go through `parseJSON`, so a malformed file cannot echo content into an error. Remote API payloads and `gh` output are left for their area phases.

The mutation lock fixes were written test-first. Against the old logic, the stale/unreadable-takeover and foreign-release tests failed. The lock now:
- links a complete temporary record into place;
- treats an unreadable record as stale;
- treats `EPERM` as a live owner;
- removes a stale lock only if it is unchanged since inspection;
- serializes stale-lock takeover through an exclusive `.break` file, so racing processes cannot both remove a stale lock and run together;
- bounds retries (about one second when a breaker is busy);
- releases only its own record.

A review agent reproduced the stale-takeover race. With 8 racers on a stale lock, 2 of 3 trials let two processes hold the lock at once. The old `core.mjs` had the same race with a wider window. A new multi-process test now races 8 processes over 8 trials; it failed intermittently before the breaker and passed in 5 of 5 runs after it. Known limits: a breaker orphaned by a crash expires after 30 seconds, and on filesystems without hard links the lock fails closed.

The lock file gains a random `token` field; nothing else reads it.

Verification:
- 43 unit tests pass.
- Normalized output from the read-only command baseline is unchanged, apart from `check`'s scanned-file count (+9 modules, −1 removed).
- `pnpm run verify:ci` passed.
