---
title: "Separate file moves from refactors and check merges"
format: "playbook"
domain: "tooling"
aliases: ["Git rename detection", "merge-tree rehearsal", "file move path traps"]
evidence_date: "2026-11-02"
reviewed_at: "2026-11-02"
applicability: "Git with modern merge-tree --write-tree support; inspect installed version, merge strategy and rename configuration"
provenance: "Official git-diff, git-merge-tree and git-merge documentation read 2026-11-02; path audit and graph comparison proposed; private refactor success not reproduced"
status: "current"
versions: []
---

# Separate file moves from refactors and check merges

## When to use this

Use when reorganizing many files while other branches are in flight. A move plus required import/path repairs can be rename-friendly without being byte-identical; it never guarantees automatic conflict resolution.

## What to do

1. **Proposed:** isolate moves and necessary import/runtime/reference path updates from extractions, splits and cleanup. [Git diff](https://git-scm.com/docs/git-diff) detects renames by similarity (`-M`, default 50%), not an enduring file-identity record. Before committing, run `git diff --cached -M --name-status`; inspect each intended move's `R<score>` and investigate delete/add pairs.
2. **Documented:** `git merge-tree --write-tree <move-commit> <other-branch>` simulates a merge without changing the index or working tree; it can write Git objects. The [modern command](https://git-scm.com/docs/git-merge-tree) includes rename detection. For the ordinary two-head invocation, exit 0 is clean, 1 means conflicts, and other statuses are errors. Read the conflict output; an empty per-file list is not proof of a clean merge. Confirm command support in the installed Git first.
3. **Proposed:** rehearse against each relevant live branch. The [`ort` rename options](https://git-scm.com/docs/git-merge) and effective configuration matter. A heavily rewritten file may no longer match as a rename. Give branch owners old-to-new paths and symbol/export mappings for manual reconciliation; a successful staged rename check does not prove every later merge or split will be recognized.
4. **Proposed path audit:** check depth-relative `import.meta.url` resolution, spawned entry points, copied generated files, functions serialized with `.toString()` or browser evaluation, and bytes hashed into stored proofs. A serialized function cannot acquire module imports just because its source moved. Verify the actual consumer of every changed path or byte contract.
5. **Proposed:** translate the old import graph through the move map and compare edges/cycles with the new graph. Combine this with build/runtime checks for affected path traps; graph equality alone cannot establish runtime equivalence. Preserve explicit import-extension and resolver constraints until separately authorized to change them.

## Evidence and limits

No merge rehearsal, file move or history/blame trial ran during curation. A captured refactor reports rename recognition and one manual repair, but those completion claims and incidental runtime versions are omitted rather than generalized. Git's single-path history tools do not supply a full symbol map across a split; preserve the map instead of promising effortless history traversal.
