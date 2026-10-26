---
title: "Keep a Graphify code map scoped and reproducible"
format: "playbook"
domain: "tooling"
aliases: ["Graphify", "graphifyy", "code graph", "Graphify worktree churn", "Husky Graphify"]
evidence_date: "2026-10-26"
reviewed_at: "2026-10-26"
applicability: "Source inspection of graphifyy 0.9.36; proposed code-only sharing in an explicitly authorized repository; verify other releases and hook managers separately"
provenance: "Official PyPI graphifyy 0.9.36 wheel checksum verified and selected Python source read without execution; sanitized unverified local setup reports and proposed practices; no installation or graph build reproduced"
status: "current"
versions: ["graphifyy@0.9.36"]
---

# Keep a Graphify code map scoped and reproducible

## When to use this

Use this when a repository has explicitly chosen Graphify for a shared map of maintained source. This is a code orientation aid, separate from a documentation/history wiki. It does not authorize installation or changing another repository's hooks or agent instructions.

## What to do

1. **Proposed corpus policy:** begin an explicit `.graphifyignore` allowlist with `*`, re-include maintained source directories and their ancestors (for example `!src/` and `!src/**`) and selected root configurations, then explicitly exclude documentation/media, dependencies, generated output, fixtures, runtime data, environment and private files. Verify the resulting corpus rather than assuming ignore syntax proves exclusion or every config emits nodes. Install language parser extras only for actual corpus needs. SQL extras and JSON/CSS classification need release-specific checks.
2. **Source observation:** the [official 0.9.36 release](https://pypi.org/project/graphifyy/0.9.36/) includes code-only CLI extraction/update and native hooks that export `PYTHONHASHSEED=0`; the hook source explains string-set iteration affecting clustering. **Proposed:** for an approved baseline use `PYTHONHASHSEED=0 graphify extract . --code-only --force`, then an intentional full `PYTHONHASHSEED=0 graphify update . --force`; ordinarily use `PYTHONHASHSEED=0 graphify update .`. Full rebuilds are deliberate operations, not default rerun advice. Compare identical-source outputs and inspect real source changes before interpreting differences as churn. Fixed hashing alone does not prove cross-checkout reproducibility.
3. **Source observation:** release detection records filesystem mtimes in `manifest.json`; export code writes a build commit and the report helper derives a name from the working directory for `.`. **Proposed sharing policy:** keep the manifest, caches, root/interpreter paths, detect/AST/old temporary files and backup files local. An allowlist of candidate shared outputs is `graph.json`, `graph.html`, `GRAPH_REPORT.md`, `.graphify_analysis.json`, `.graphify_labels.json` and `.graphify_labels.json.sig`; inspect them for private data before committing. This six-file policy supersedes the earlier captured seven-file suggestion that included the volatile manifest. It is a proposal, not a universal vendor tracking contract. Reconcile any existing tracked manifest through a reviewed change; do not delete unrelated work.
4. **Proposed:** generate and stage canonical graph output from one agreed checkout. Use other worktrees for source work and read-only graph orientation; refresh canonical output after integration. A captured comparison reported directory-name-sensitive communities/labels/HTML, and same-name directories differing by the build stamp. Those comparisons were not rerun. Source inspection establishes name/stamp/mtime inputs, not every claimed clustering outcome. Do not claim that naming directories alike guarantees identical output. Review legitimate commit-stamp changes without bypassing hooks.
5. **Source observation:** `hooks.py` resolves Git's configured hooks directory and maps Husky 9's `.husky/_` wrappers to user hooks in `.husky/`. It installs post-commit/post-checkout hooks and a `graph.json` union merge driver. **Proposed:** activate the repository's existing hook manager with its declared package manager first, then run authorized `graphify hook install` and inspect `graphify hook status`, generated bodies, Git configuration and `.gitattributes`. Do not copy an npm installation command into a pnpm repository. Preserve existing privacy/quality hooks; a union merge result is not semantic correctness.
6. **Source observation:** these native hooks skip linked worktrees, rebase/merge/cherry-pick states, explicit skip requests and graph-output-only commits; checkout rebuilding is limited to branch switches with an existing graph. Rebuilds detach, use a default 600-second timeout and log locally. The installer embeds an interpreter path with fallback probes. **Proposed:** rerun installation and review changes on a new machine, avoid publishing private interpreter paths, and use a foreground update where hooks do not fire or freshness matters. The inspected installer creates no post-merge hook. Existing native bodies contain shell exits: review composition before appending other hook work, and verify required checks still execute. Native dispatch or status alone is not proof of a fresh graph.
7. **Proposed:** use query/explain/path/affected results to locate evidence, follow cited lines into source, and confirm inferred or ambiguous relationships. A missing directed path does not prove disconnection; inspect whether an undirected query answers the intended question. Graph edges establish neither runtime behavior nor business outcomes.

## Evidence and limits

The official release wheel was checksum-verified and source files read in memory without installing or executing them. Relevant files include `hooks.py`, `detect.py`, `watch.py`, `export.py` and CLI entry points. This source observation is narrower than an exercised integration.

Private reports describe a clean code-only corpus, stable repeated outputs, hook install/status, source-matching edges and checkout comparisons. Exact counts and claimed byte identity are not independently reproduced, and are not acceptance thresholds. Python, Node, Husky and frontend versions from those workspaces do not establish compatibility elsewhere. No real hook-triggered rebuild, semantic/LLM extraction, Windows behavior or other Graphify release was tested.

**Source observation:** detection separately includes its canonical output `memory/` tree. **Proposed:** keep that canonical feedback directory empty for a strict code-only map and use an explicitly separate ignored location for optional saved outcomes; confirm each command's `--memory-dir` support in the selected release. A custom feedback directory does not itself prove it will never enter a corpus. Never import raw agent memories or private sessions into the shared map.
