---
title: "Name the private storage mode the repository check requires"
date: "2026-11-23"
topics: [automatic-knowledge-maintenance]
---

# Name the private storage mode the repository check requires

One publication preparation was rejected because private state copied into a worktree had group or other access. Preparation then succeeded on the same head once the permissions were corrected. `check`, which `prepare` executes, already rejected broad modes on `.state/`, `inbox/` and `brain.config.local.json`, so enforcement needed no change. The gaps were remediation guidance and a regression test.

The repository rule now names the offending path and its required mode (0700 for the directories, 0600 for the configuration), keeping the existing "Private storage permissions are too broad" prefix. It accepts an explicit root, and `tests/repository-rules.test.mjs` covers owner-only storage and each private path with group or other access. README → "Nightly publication gate" says to confirm those modes before `prepare`. `AGENTS.md` is unchanged because this is command guidance, not a repository convention.

Issue: [JFusco/brain#408](https://github.com/JFusco/brain/issues/408).
