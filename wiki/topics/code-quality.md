---
title: "Code quality gate and architecture"
aliases: ["quality gate", "tests", "architecture layers", "verify:ci"]
---

# Code quality gate and architecture

Brain's runtime code is gated by `pnpm run verify:ci`. That runs ESLint, a Prettier check, `scripts/quality/check-architecture.mjs`, focused `node:test` tests, the hook and workflow tooling tests, `check`, `official check`, wiki integrity and the viewer build. The **Quality** GitHub check runs the same gate on pull requests and on `main`. **Commit message lint** checks the PR title, the PR body against the template, and every commit.

The tooling mirrors Joe's sibling repositories (cms-field-vocabulary, agent-review-workflows), on pnpm. Brain keeps its native `.githooks` (set with `core.hooksPath`) instead of Husky; dependency lifecycle scripts stay disabled. Because pnpm does not search parent directories for binaries, `.githooks/tool-path.sh` adds the primary checkout's `node_modules/.bin` for nightly worktrees.

- `pre-commit` keeps the blocking privacy `check --staged` first. It lints staged JavaScript only when some is staged, so nightly knowledge commits need no dev dependencies. The advisory wiki lifecycle stays last.
- `commit-msg` runs commitlint with the shared conventional configuration.
- `pre-push` runs the nightly push guard first. It then clears Git-local environment variables and runs `pnpm run verify:push`. Nightly worktrees have no `node_modules` of their own; hooks borrow the primary checkout's binaries, so the primary checkout must have dev dependencies installed. These hooks check working-tree copies and the current checkout, not the exact pushed refs: the PR checks are authoritative. Nightly guarded merges require only Wiki integrity unless Quality and Commit message lint are made required checks.

Tests cover guards, decisions and contracts: path and symlink safety, the untrusted tar reader, secret patterns, argument parsing, version fit, knowledge and official validation, ranking, the CLI surface, hooks and workflows. Trivial getters, snapshot tests, scene rendering and live network calls are excluded.

Code follows a Leaf → Branch → Tree → Root layout. Leaf modules are pure or near-pure helpers, branch modules hold domain logic and I/O adapters, tree modules hold command handlers and orchestration, and roots only parse, dispatch and report:

- `scripts/lib/{leaf,branch,tree}` with thin roots (`brain.mjs`, `nightly.mjs`, `nightly-push.mjs`, `setup.mjs`, `hosted/*.mjs`). `brain.mjs` dispatches from the declarative command table in `tree/cli/`, which also generates the help.
- `web/brain/lib` (leaf), `model` (branch), `scene`, `ui` and `live` (tree), and `main.js` (root). Scene and panel modules open nodes through the injected `model/navigation` rather than importing the details view.

The architecture check enforces layer direction, no import cycles and at most 200 lines per file, and blocks `verify:ci` since [the viewer split](../journal/2026-10-24-split-viewer.md). The executed plan is archived as [Brain cleanup: layered architecture, focused tests, quality gate](../plans/2026-10-23-brain-cleanup-layered-architecture-focused-tests-quality-gate-430c2a75f3.md).
