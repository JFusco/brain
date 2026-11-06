---
title: "Activate Husky before composing native Git hooks"
format: "playbook"
domain: "tooling"
aliases: ["Husky 9", "shared hooksPath", "GUI Git hooks"]
evidence_date: "2026-11-06"
reviewed_at: "2026-11-06"
applicability: "Husky 9 setup, with installer source checked at 9.1.7; project package-manager and required-hook policies take precedence"
provenance: "Official Husky setup/how-to pages, Husky v9.1.7 index.js and Git worktree configuration documentation read 2026-11-06; setup and composition procedure proposed, historical installation not reproduced"
status: "current"
versions: ["husky@9"]
---

# Activate Husky before composing native Git hooks

## When to use this

Use when an authorized repository adopts Husky or adds a tool's native hooks to an existing hook manager. Check existing privacy and quality hooks before changing dispatch.

## What to do

**Documented:** [Husky setup](https://typicode.github.io/husky/get-started.html) installs a development dependency; `husky init` creates a sample pre-commit hook and updates the prepare script. Its [how-to](https://typicode.github.io/husky/how-to.html) covers manual prepare setup, POSIX shell entrypoints for non-shell scripts, GUI version-manager initialization and projects below the Git root. Use the repository's declared package manager; Yarn's lifecycle setup differs.

**Source observation:** the [9.1.7 installer](https://github.com/typicode/husky/blob/v9.1.7/index.js) sets `core.hooksPath` to `.husky/_`, generates wrappers there and writes an ignore file. User-authored hooks live in `.husky/`. [Git shares repository configuration across worktrees by default](https://git-scm.com/docs/git-worktree#_configuration_file); worktree-specific configuration requires explicit separate setup.

**Proposed procedure:**

1. Activate the chosen manager through its declared install/prepare lifecycle before installing another tool's hooks. Inspect `git config --show-origin --get core.hooksPath`, hook bodies and tracked files. Keep generated wrappers separate from authored hooks.
2. Account for every affected checkout: a shared hooks-path change can precede availability of its tracked files on primary main. After integration, run the authorized package-manager lifecycle there and verify required dispatch. Worktree isolation does not isolate shared Git configuration.
3. Read tool-generated bodies before composing them; early exits can skip appended checks. Preserve required failure behavior. For Graphify's versioned mapping and interpreter-path limits, use [the existing code-map procedure](graphify-code-map.md).
4. Where project policy permits CI/container hook omission, use Husky's documented `HUSKY=0` control and a deliberate production/CI install guard when dev dependencies are absent. The same how-to documents per-command bypass and global GUI/startup disabling through the Husky init file; these are mechanisms, not authorization to bypass required gates. Prefer explicit install conditions over hiding arbitrary failures.

## Evidence and limits

No hook install, GUI invocation, CI omission or Windows/Yarn setup was exercised. A private setup report is not new runtime proof. Review machine-specific paths before sharing hook files; installing hooks does not establish that a later background job succeeded.
