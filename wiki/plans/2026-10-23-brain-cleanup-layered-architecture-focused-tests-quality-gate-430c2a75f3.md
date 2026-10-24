---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/brain/pull/142; pull/144; pull/146; pull/148; pull/150; pull/152; pull/154; pull/156; pull/158; pull/160; pull/168; pull/170", "pnpm run verify:ci with a blocking architecture check"]
source_tool: "repository"
source: "/Users/joe.fusco/.claude/plans/can-you-please-help-precious-sparrow.md"
topics: ["code-quality"]
digest: "430c2a75f3dd8dae71842305b2d5933b025a998d411c185c60a8b3db5fd27130"
---

# Brain cleanup: layered architecture, focused tests, quality gate

## Context

Brain's runtime is about 207 KB of extremely dense ESM: lines run up to about 1,000 characters, and three files mix many responsibilities.
- `scripts/lib/official.mjs` (24 KB) has 6 responsibilities.
- `nightly-publication.mjs` (16 KB) and `nightly.mjs` share the nightly logic between them.
- `web/brain/src.js` (31 KB) is a single viewer file.

The duplication and gaps the audit found:
- 7 separate git wrappers and 12 copies of the HTTPS-URL check.
- Many JSON reads bypass the "content suppressed" error path.
- The help text in `brain.mjs` has drifted from its flag table.
- There are no tests, no lint, no formatter, and no PR quality CI. `brain check` never runs on PRs.

Joe wants these outcomes:
- Clean, focused modules arranged in the layers Leaf, Branch, Tree and Root.
- A small test harness that only covers code that matters.
- A quality gate and CI matching his sibling repos (cms-field-vocabulary and agent-review-workflows).

He authorized commit, push, merge and branch/worktree cleanup for this work.

**Decisions made:**
- Keep the native `.githooks` hooks, not Husky.
- Use ESLint plus Prettier.
- Deliver in phases, merging each phase as it finishes.
- Include the viewer.

**Rule changes in this work:**
- **The "tests deferred for v1" rule ends.** Phase 1 updates `AGENTS.md:5`, `README.md:483`, `STATUS.md:34`, `brain.mjs:57-58` help and `scripts/nightly-content-review.md:29`. Joe's explicit request overrides AGENTS.md here.
- **Commit authorization is scoped to this task only.**

**Brain consult:** route session `1cf82904…` found no applicable guidance; its domains are frontend and CMS, not Node CLI architecture. The activity `complete` report failed ("Invalid activity identifiers"), so nothing was recorded.

## Target architecture (enforced, not just documented)

```
scripts/
  brain.mjs, nightly.mjs, nightly-push.mjs, setup.mjs, hosted/{setup,weekly}.mjs   ROOT
  lib/
    leaf/     pure or near-pure helpers. Imports only node: builtins and other leaf files.
    branch/<feature>/   domain logic and I/O adapters. Imports leaf and branch.
    tree/<feature>/     command handlers and orchestration. Imports branch and leaf.
  quality/check-architecture.mjs
web/brain/
  lib/ (leaf)  model/ (branch)  scene/ ui/ live/ (tree)  main.js (root)
```

**`scripts/quality/check-architecture.mjs`** follows the model of qa-operations `check-architecture.cjs`. It scans static and dynamic imports with a regex (there is no TypeScript) and fails on:
- an import that goes up a layer;
- any import cycle;
- a Root importing a file from `leaf`/`branch` that the Root doesn't own;
- any file over 200 lines after Prettier.

Its scope is `scripts/**` (excluding `scripts/wiki/**`) and `web/brain/**`.

**Planned module map** (from the audit; final names may shift while splitting):

**Leaf** (`scripts/lib/leaf/`)
- `paths` (ROOT, `at`)
- `fs-safe` (`inside`, `safePath`, `noSymlinks`, `atomic`, `mkdir`, `walk`)
- `json`: the single parse path that suppresses content. All 20+ raw `JSON.parse` reads route through it.
- `hash` (`sha`, `gitBlob`)
- `time`: `HOUR`, `DAY`, the New York day and 03:15 boundary, previously copied 4×.
- `url`: one HTTPS checker that replaces 12 copies and both `webURL` variants.
- `semver`: replaces 3 regexes and 2 comparators.
- `markdown`: fence strip, link regex, HTML strip and entity decode.
- `constants`: state-file paths, link states, retired statuses, marker regexes, publish-path allowlist.
- `frontmatter`: the single `createRequire` adapter, replacing 5 copies.

**Branch** (`scripts/lib/branch/`)

Adapters:
- `platform/{config,lock,log,cli-args,git,github,network,archive,gitleaks,pinned-package}`
- `git`/`github` replace 7 git and 3 gh wrappers, plus the repo-identity regex.
- `gitleaks` holds the install logic shared by `setup.mjs` and `hosted/setup.mjs`.
- `pinned-package` is shared by vocabulary and ui-patterns.

Domain:
- `privacy/`, `project-context/`, `guidance/`, `cache/`, `documentation/`, `package-releases/`
- `official/{registry,catalog-build,fetch,hubs,validate}`
- `search/{tokens,rank,excerpt}`
- `lookup/sources`, `links/classify`, `vocabulary/`, `ui-patterns/`
- `nightly/{paths,scope,review,receipts,schedule,ledger}`
- `visual-brain/{snapshot,metrics,connecting-path}`
- `publication-ledger`

**Tree** (`scripts/lib/tree/`)
- `cli/commands.mjs`: one declarative `{command:{sub:{flags,mutating,run}}}` table. Help text is generated from it, which fixes the drift and replaces the `brain.mjs:67` precedence chain.
- `capture`, `inbox`, `check`, `lookup`, `links`, `skills`, `maintenance`
- `official/sync`: makes the hub regeneration and stale-guidance write explicit.
- `nightly/{commands,checks,push-guard}`
- `visual-brain/{route,guidance-tools,feedback,server}`
- `hosted/weekly/{restore,render,issue}`

**Root**: thin argument dispatch only. `nightly.mjs` logic moves to `tree/nightly`.

**Preserved exactly:**
- every CLI subcommand and flag in the help and README;
- `CHECKS` strings at `nightly-publication.mjs:7` (they are compared against stored receipts);
- the paths `scripts/brain.mjs`, `scripts/nightly.mjs`, `scripts/nightly-push.mjs`, `scripts/setup.mjs`, `scripts/hosted/*.mjs` and `scripts/nightly-content-review.md`;
- `web/brain/index.html`'s entry, updated if renamed;
- the server asset allowlist regex;
- all runtime guards.

**Not touched:**
- `scripts/wiki/**` (the vendored kit);
- `knowledge/`, `official/`, `wiki/` content;
- `brain-weekly.yml` and `brain-sync.yml` triggers and enablement. They are never dispatched.

**Dead code:** removed only where the audit proved there are no callers:
- the `retrieval.mjs:50` re-export;
- unused vars at `src.js:145` and `src.js:173`.

Internal-only exports are un-exported. The legacy compatibility branches stay: protocol v1 at `nightly.mjs:79`, `policySha256` cleanup, and old capture IDs.

## Quality tooling (matching siblings, translated to npm)

Root `package.json` gets exact-pinned devDependencies, installed with `npm install --save-dev --ignore-scripts` with the lockfile retained:
- `eslint`, `@eslint/js`, `globals`, `prettier`, `@commitlint/cli`, `@commitlint/config-conventional`.
- Versions match cms-field-vocabulary where it has them; Prettier is current stable.

Scripts:
- `lint`: `eslint . --max-warnings=0`
- `lint:fix`
- `format`, `format:check`
- `architecture:check`
- `test`: `node --test --test-concurrency=4 'tests/**/*.test.mjs'`
- `test:tooling`: hooks, workflows, PR body
- `lint:commit`, `lint:pr`
- `brain:check`: `node scripts/brain.mjs check && node scripts/brain.mjs official check`
- `wiki:check`
- `viewer:build`: `npm run build --prefix web/brain`
- `verify:push`: lint + format:check + architecture:check + test
- `verify:ci`: verify:push + test:tooling + brain:check + wiki:check + viewer:build

New files:
- `eslint.config.js` (cms-field-vocabulary style; ignores `scripts/wiki/**`, `wiki/**`, `web/brain/dist/**`, `node_modules`; browser globals for `web/brain/**`).
- `.prettierrc.json` (single quotes, semicolons, `printWidth` 100) and `.prettierignore`. The ignore list matters: `knowledge/`, `official/`, `wiki/`, `scripts/wiki/`, `*.md`, `inbox/`, `.state/`, lockfiles and dist. Formatting knowledge or catalogs would break hashes.
- `commitlint.config.cjs`, copied verbatim from the siblings.
- `.nvmrc` containing `24.14.0`.
- `scripts/validate_pr_body.cjs` and `.github/pull_request_template.md`, both copied verbatim with the checklist set to `npm run verify:ci`.

**Hooks** (`.githooks`, `core.hooksPath` unchanged):
- **`pre-commit`**:
  1. `brain check --staged` (unchanged, still blocking).
  2. Then, only if staged `*.{js,mjs,cjs}` files exist: ESLint plus a `prettier --check` on just those files. Nightly knowledge commits stage no JavaScript, so they need no extra dependencies.
  3. `WIKI_HOME` and the advisory wiki block, still last.
  4. Fix the dead `$?` capture under `set -e`.
- **`commit-msg`** (new): commitlint `--edit "$1"`.
- **`pre-push`**:
  1. Unset Git-local environment variables (sibling pattern).
  2. `nightly-push.mjs` (unchanged guard).
  3. `npm run verify:push`.
- Load-bearing assumption: nightly worktrees live under `.state/worktrees/` inside ROOT, so `npm run` finds ROOT's `node_modules/.bin`. This is verified in Phase 1 with a throwaway worktree. If it fails, the push gate skips lint for knowledge- or catalog-only ranges.

**CI**:
- **`.github/workflows/quality.yml`**, job name `quality`:
  - Triggers: PR to main, push to main, `workflow_dispatch`.
  - `contents: read`, concurrency cancel, `actions/*@v4` (matching the repo's existing `wiki-check.yml`), Node `24.14.0`.
  - Steps: `npm ci --ignore-scripts`, `npm ci --prefix web/brain`, `node scripts/hosted/setup.mjs` (pinned scanner and empty client profile, as `brain-sync.yml` already does), then `npm run verify:ci`.
- **`.github/workflows/commitlint.yml`**, job name `commitlint`: lints the PR title, the PR body (`lint:pr`) and the commit range.
- **`wiki-check.yml`** is untouched.

## Focused tests (`tests/`, `node:test` + `node:assert/strict`, flat `*.test.mjs`, `tests/helpers.mjs` with `tmpdir` + `t.after` cleanup)

Tests cover only guards, decisions and contracts.

**Security and privacy**
- `fs-safe`: `safePath` rejects traversal, absolute paths, backslashes and control characters; `inside`; `noSymlinks` against real symlink, dangling-link and escape fixtures; `atomic` permissions under `.state`.
- `archive`: `..` entries, links and devices, duplicates, size and entry limits, checksum mismatch, pax/long-name headers.
- `privacy`: builtin secret patterns; `clientHits`/`scrub` with injected terms. Requires making config injectable.
- `server`: host and origin check, asset-path allowlist, `strict` parameter handling.
- `hosted/weekly/restore`: rejects unsafe artifact contents.

**State machines and gates**
- `lock`: stale lock, live owner, and the create/write race. The audit found real bugs here. They are fixed in Phase 3 with a test first: rm without `force`, unbounded recursion, and the misleading JSON error.
- `nightly/schedule`: due date across both DST transitions, using an injected clock.
- `nightly/ledger`: claim, retry limit 3, 1-hour backoff, rerun keeps the scheduled completion.
- `nightly/review`, `scope` (hub-only change and the publish allowlist), `receipts` (expiry and second-precision timestamp comparisons), `push-guard` (stdin parsing), `completionChecks`.
- `publication-ledger`: `recordPublication` and `overdue`.

**Parsing and ranking**
- `cli-args`: unknown flags, booleans, `--x=v`.
- `versionConstraint`/`versionFit`.
- `validateKnowledge`, `guidanceState` review-due logic, `curatedBlock`.
- `official/validate` and `catalog-build` against small registry and catalog fixtures.
- `tokens` and `rankEntries` ordering.
- `connectingPath`.
- Link classification and retry delay.
- `domainFor` tie-break.

**Viewer leaves**
- `markdown` `resolveLink`: internal, external and inert links (security-relevant).
- `layout`/`isVisible`, `neighborhood`, `overviewReferences`, `domainCoverage`, session TTL.

**Contracts**
- CLI, spawned via `process.execPath`: an unknown command or flag exits non-zero; generated help lists every command in the table; read-only commands never take the lock.
- `tests/tooling/`, following agent-review-workflows `support.cjs`:
  - In a temp repo, a failed pre-commit check blocks the commit while a failed wiki block stays advisory.
  - pre-push clears the Git environment and passes the exit code through.
  - Workflow YAML assertions: no `--hosted`, and no reference-maintenance dispatch.
  - The PR template matches the validator.

**Excluded:** trivial getters, Three.js scene and animation, DOM wiring, and network calls (covered only through pure classifiers). No snapshot tests.

## Phases (each = one issue, `codex/<n>-<slug>` branch from updated main, PR, merge, cleanup)

**Each phase follows the AGENTS.md delivery flow:**
1. Create and read back the issue with `github-issue-creator`.
2. Branch from updated main.
3. Implement.
4. Run `npm run verify:ci`, then a read-only review agent.
5. Make a conventional commit; the pre-commit and pre-push guards stay on and are never bypassed.
6. Push, then open a PR with the template and `lint:pr`, and read it back.
7. Merge only after all checks are green (`gh pr checks`).
8. Delete the remote branch, local branch and any worktree.

**Wiki:** each PR adds the wiki journal and topic updates per `wiki/MECHANICS.md`, then runs `build-graph.cjs` and `check.cjs`. The final phase archives this plan.

**Nightly safety:**
- Before merging any phase, run `node scripts/nightly.mjs status`. Never merge while a nightly run is active or within the 5 p.m. ET window.
- Phases 3-4 must keep `nightly.mjs status`, `claim` and the receipt formats byte-compatible.

**The phases:**
1. **`build(quality)`: tooling, gate, CI, characterization tests.**
   - ESLint/Prettier/commitlint config, hooks, quality and commitlint workflows, PR template and validator, architecture check (warn-only for now).
   - Tests against the current exports.
   - Doc updates that end the "tests deferred" rule.
   - The worktree `node_modules` probe.
1b. **`docs(readme)`: launcher script and README rewrite** (added at Joe's request).
   - Add `npm start` (alias `npm run brain`): build the viewer if needed, then run `visual serve`. It is npm, not pnpm: the repo declares `packageManager: npm`, and AGENTS.md forbids pnpm installs.
   - Rewrite the README as plain human instructions: what Brain is, install, launch, everyday commands, and how to invoke the `brain` and `brain-capture` skills in Claude Code, Codex and Cursor. Move the operator and nightly detail into a short maintenance section.
   - Every command and flag stays documented. Precise rules that AGENTS.md cites must stay reachable under the section names it references.
2. **`style(scripts)`: Prettier reformat only.**
   - Covers `scripts/**` (not wiki) and `web/brain/*.{js,css,html}`.
   - Tests prove no behavior change.
   - Lint fixes stay limited to what is mechanically safe.
3. **`refactor(lib)`: split `scripts/lib` into leaf, branch and tree.**
   - Shared git, github, url, json, time and gitleaks modules.
   - Lock fixes, test first.
   - Move the tests to the new paths and add tests for newly extracted internals.
4. **`refactor(cli)`: thin roots.**
   - The command table with generated help.
   - `nightly.mjs` and `hosted/*` logic moves into tree modules.
   - Turn the architecture check to blocking.
5. **`refactor(viewer)`: split `web/brain/src.js` into `lib`, `model`, `scene`, `ui`, `live` and `main`.**
   - Dedupe `$`/`element` and the TTL.
   - Break the `choose → focusNode → rebuild` cycle through injected callbacks.
   - Verify with a `vite build` and a manual `visual serve` check in the browser.
6. **`docs(wiki)`: archive the plan, add the final journal entry, update the README architecture section.**

**Branch protection:** after Phase 1 merges, offer to add `quality` and `commitlint` as required checks. That is a GitHub setting, so it needs a separate yes.

## Verification

**Per phase:**
- `npm run verify:ci` locally: lint, format:check, architecture:check, test, test:tooling, brain:check, wiki:check, viewer:build.
- `node scripts/brain.mjs check` and `official check` pass.
- Read-only commands give unchanged output: run `node scripts/nightly.mjs status`, `brain.mjs lookup --query "react cache" --domain react` and `route` before and after each refactor phase, and diff the JSON with volatile fields removed.
- `git diff --stat` shows no changes to `knowledge/`, `official/` or `scripts/wiki/`.
- Green `quality`, `commitlint` and `Wiki integrity` checks on the PR before merging.
- The viewer gets a manual `visual serve` smoke test in Chrome after Phase 5.

**Open risks:**
- Nightly pre-push dependency resolution; probed in Phase 1.
- The disabled hosted workflows can't be run end to end, so `weekly.mjs` and `brain-sync` paths are covered only by unit tests on their pure parts.
- The large mechanical diffs in Phases 2 and 3 are reviewed through tests plus a review agent.
