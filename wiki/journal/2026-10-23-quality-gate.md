---
title: "Add focused tests and a quality gate"
date: "2026-10-23"
topics: [code-quality]
---

# Add focused tests and a quality gate

[Issue 137](https://github.com/JFusco/brain/issues/137) is phase 1 of Joe's requested cleanup. It adds ESLint, Prettier, commitlint, a warn-only architecture check, focused `node:test` tests, hook and workflow tooling tests, the **Quality** and **Commit message lint** workflows, and the sibling PR template and validator. Joe's explicit request replaces the earlier "tests deferred for v1" rule in AGENTS, README, STATUS, the CLI help and the content-review brief.

Fifteen lint findings in existing code were resolved without behavior changes:
- unused imports and variables were removed;
- unneeded regex escapes were dropped;
- intentional empty catches now carry their reason;
- the lock liveness check was restructured equivalently.

Two deliberate patterns are annotated rather than changed. The JSON reader still drops the `SyntaxError` cause, because its message can quote file content. The path guard still rejects control characters.

Verification: `pnpm run verify:ci` passed locally (37 unit and 9 tooling tests). A probe confirmed that a nested checkout resolves the parent `node_modules/.bin`, which the nightly pre-push gate depends on. Formatting the existing code and splitting modules are later phases; see [code quality](../topics/code-quality.md).

At Joe's request this delivery also moves Brain from npm to pnpm, reversing the npm-only declaration from [issue 135](https://github.com/JFusco/brain/issues/135).
- Both projects declare `pnpm@10.33.0` and track `pnpm-lock.yaml`, imported with `pnpm import` so resolved versions are unchanged. The npm lockfiles are removed.
- The root `.npmrc` sets `node-linker=hoisted`, because pnpm's default symlinked layout would fail the `noSymlinks` guards that read pinned packages. `vocabulary profiles` and `ui status` were verified after the switch.
- `check` now scans `pnpm-lock.yaml` and `.npmrc` instead of `package-lock.json`.
- pnpm does not search parent directories for binaries, so the hooks borrow the primary checkout's `node_modules/.bin`. A probe confirmed that a nested checkout without its own dependencies resolves ESLint and commitlint this way.
- The external nightly automation instructions are outside this repository and must be updated to pnpm separately.
