---
title: "Profile Node test files and replace avoidable waits"
format: "playbook"
domain: "tooling"
aliases: ["node test concurrency", "mock timers named import", "test clock seam"]
evidence_date: "2026-11-06"
reviewed_at: "2026-11-06"
applicability: "Node 24 test-runner suites; CLI semantics checked at 24.14.0 and rolling v24 timer docs; verify the installed release and test concurrency settings"
provenance: "nodejs-24-docs@ff36dfdb2741f2c837d57f053c8439266912fb7e2bf91afc9b4a36d23352ec42; official Node CLI/test docs and upstream issue 66549 read 2026-11-06; performance procedure proposed, private timings not reproduced"
status: "current"
versions: ["node@24"]
---

# Profile Node test files and replace avoidable waits

## When to use this

Use when a Node test suite spends time in long files, request pacing, browser settling or repeated CLI startup. Preserve the [behavior a test protects](behavior-focused-test-pruning.md) before optimizing its cost.

## What to do

**Documented:** the [24.14.0 CLI reference](https://github.com/nodejs/node/blob/v24.14.0/doc/api/cli.md#--test-concurrency) describes one child process per file under default process isolation. File concurrency defaults to `os.availableParallelism() - 1`; set and record an appropriate positive limit explicitly when needed. Isolation `none` shares one process and forces file concurrency to one. Tests within files have their own concurrency controls. The [upstream load-time-error report](https://github.com/nodejs/node/issues/66549) is another reason to check the selected release before relying on shared-process behavior; it is not a reproduced failure here.

**Proposed profiling procedure:**

1. Compare file and test durations with total wall time, CPU use, actual runner allocation and known sleeps. Nested durations and overlapping tests prevent a simple sum from proving idle time. Split a long scenario file by meaningful behavior only when the saved parallelism outweighs setup and coordination cost. Remove unnecessary real waits before raising concurrency or distributing shards.
2. Keep production pacing real by default, but allow the owning transport or capture helper to receive a clock/wait option. Tests can install it before first use. For a shared singleton, a narrowly scoped test-only replacement may be appropriate; restore it and preserve per-file isolation. Separate instances can check actual pacing decisions against a controlled clock. A file-local timer mock does not isolate external servers or shared files.
3. Verify the timer interception path. [Node's timer-mock docs](https://nodejs.org/docs/latest-v24.x/api/test.html#class-mocktimers) cover timer modules, including promises, but warn that destructured imports are unsupported. A private Node 24.14.0 report describes a named promises timer still sleeping in real time; that observation was not reproduced. Check elapsed behavior before claiming a speedup. A namespace/default module property call and a previously captured function are distinct cases.
4. Keep representative real CLI-spawn contracts; use in-process command tests for other equivalent cases. Select one viewport only where additional widths protect no distinct behavior; preserve responsive coverage when relevant. Retain critical slow tests and behavioral assertions. Do not shorten a meaningful deadline merely to make a test green.

The CLI also documents `--test-shard` and, from 24.7, `--test-rerun-failures`. The rolling v24 test guide documents early-development `--test-randomize` from 24.16 for order-dependence diagnosis; record its seed and verify installed-release support. Prefer structured `TestsStream` events for automation because human reporter output can change.

## Evidence and limits

Historical file counts, wall/CPU timings, CLI-start costs and predicted savings are omitted; no suite or production wait changed during curation. Clock injection, file splits and reduced redundant captures are proposed practices, not measured improvements. Process-wide mocks and environment edits can become order-dependent when process isolation is removed.
