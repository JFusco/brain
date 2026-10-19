---
title: "WordPress discovery and refresh follow-up"
topics: [wordpress-coverage]
plans: [2026-10-19-wordpress-discovery-and-refresh-follow-up-70e0f08314.md]
---

# WordPress discovery and refresh follow-up

[Issue 73](https://github.com/JFusco/brain/issues/73) addresses the follow-up review of [PR 72](https://github.com/JFusco/brain/pull/72). The implementation completes the Brain skill description, recognizes WordPress capture identifiers, resolves recognizable WordPress ties with React/frontend, broadens the official coverage watch list, and records the official MCP adapter as a website pointer.

Collection refreshes expose logical index download counts in sync output and private source-run records/logs, including partial failures and unchanged refreshes. Registry validation and runtime enforce an optional integer `maxIndexes` from 1 to 128. The default remains 32. Neither catalog serialization nor page revision identity includes the operational count.

Observed verification:

- `official sync wordpress-docs`: unchanged catalog, zero failures, 18 successful index downloads against the default limit of 32. The saved catalog remains 1,013 links across the original seven sections.
- In-memory routing diagnostics: all four reported WordPress examples select `cms/wordpress`; additional package and `functions.php` examples also select it. Plain React, frontend and TypeScript examples retain their expected domains. Explicit `--domain` remains ahead of inference in the capture call path; no candidate was created for these diagnostics.
- Limit diagnostics: default 32 and explicit 64/128 accepted; zero, 129, fractional, string and null values rejected. A live one-index crawl downloaded one index, then refused a partial catalog; the saved catalog hash was unchanged.
- `official check`: zero issues and warnings. The runtime/privacy `check` passed with zero issues and warnings using the existing private pinned scanner configuration, copied without displaying it. No scanner installation or privacy bypass was needed.
- Syntax checks passed for the three changed runtime modules. The delivery also uses existing wiki integrity, graph regeneration, privacy-scoped plan discovery and the native staged privacy guard; their final outcomes are recorded in the PR.

The [AI handbook](https://make.wordpress.org/ai/handbook/projects/mcp-adapter/) identifies the official adapter repository, and the [documentation policy](https://make.wordpress.org/docs/licensing/) confirms CC0 general content and GPLv2-or-later code snippets. No vendor code was installed or executed. These observations do not establish exhaustive handbook coverage or compatibility with a particular application version.

Tests, fixtures, fresh-session checks, dedicated QA and review agents remain deferred for v1; no new CI is introduced. Shared lookup-title disambiguation is deferred. Rollback is a revert of this follow-up, including its generated hub pointer and same-delivery wiki records; existing source registrations and catalogs remain available. The dirty primary checkout and unrelated Contentful worktree are preserved.
