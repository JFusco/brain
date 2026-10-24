---
title: "Pin the CLI command contract in tests"
date: "2026-10-24"
topics: [code-quality]
---

# Pin the CLI command contract in tests

[Issue 167](https://github.com/JFusco/brain/issues/167) follows up the phase 4 review. The table-driven contract test read its command list from the table it was checking, so deleting a command and its README entry still passed. The test now pins the 19 public commands and requires the table to match them exactly; a mutation check confirmed that removing one fails.

The lock assertions now cover `feedback` with and without `--value`, `vocabulary` and `ui releases`, `links check` and `status`, `capture`, `inbox rescan`, `maintenance publication` and `curation` with an unknown subcommand. `keepLink` is also checked against null and URL-less records. Test-only change; `pnpm run verify:ci` passed.
