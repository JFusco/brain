---
title: "Split lookup, link health and check"
date: "2026-10-24"
topics: [code-quality]
---

# Split lookup, link health and check

[Issue 155](https://github.com/JFusco/brain/issues/155) is phase 3d-2 of the cleanup. The last three oversized modules directly under `scripts/lib/` are split:

| Old module | New modules |
| --- | --- |
| `lookup.mjs` (414 lines) | `branch/search/{tokens,rank}`, `branch/lookup/{sources,excerpt,fetch-excerpt}`, `tree/lookup/lookup` |
| `link-health.mjs` (248 lines) | `branch/links/{summary,pool,schedule,classify}`, `tree/links/check` |
| `check.mjs` (203 lines) | `branch/check/{entries,knowledge-rules,local-links,repository-rules}`, `tree/check/check` |

- **Link health:** the 220-line `checkLinks` is now separate stages: pool, schedule, classify and an orchestrator. Due-ness and round-robin selection, probe classification and retry delays are pure and tested.
- **The repository gate:** its 190-line function is now entry collection plus rule modules. They are concatenated in the original issue order, which is visible in the deduplicated report.
- **Frontmatter:** the remaining direct requires of the wiki kit's parser now go through `leaf/frontmatter`.

Verification, comparing old and new code in throwaway checkouts:
- **`check` replay:** a clean tree, then seeded problems: invalid note metadata, broken, escaping, private and badly encoded links, a superseded note with no replacement, a stale hub, a stray official file, a tool directory and loose private permissions. Then `--staged` with a private file, a symlink and an oversized vendor file. Identical output.
- **Network:** two `lookup --fetch` queries, `links check` (sampled and website pointers) and `links status`, run concurrently on both versions from empty state. Identical normalized output, with link results sorted because concurrent probes finish in network order.
- **Baseline:** the read-only command baseline is unchanged, apart from `check`'s scanned-file count.
- **Gate:** `pnpm run verify:ci` passed.
