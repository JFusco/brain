---
title: "Add a launch script and plain-language README"
date: "2026-10-23"
topics: [brain-skill, code-quality]
---

# Add a launch script and plain-language README

[Issue 143](https://github.com/JFusco/brain/issues/143) adds two package scripts:
- `pnpm start` installs and builds the viewer, then serves it at http://127.0.0.1:4174/.
- `pnpm brain <command>` is a shortcut for the CLI.

The README is reorganized into two parts.
- **Plain-language guide (top):** requirements, install, launch, linking and invoking the `brain` and `brain-capture` skills in Claude Code, Cursor and Codex, everyday commands, folder layout, how a lesson becomes published, and the code quality gate.
- **Reference (below):** the operating rules, copied verbatim. They keep the section names cited by AGENTS.md (Curation and publication; Documentation lookup and official references; Maintenance; Nightly publication gate; Coverage watch list) and the `#cms-field-vocabulary` and `#ui-pattern-vocabulary` anchors linked from `knowledge/INDEX.md`. The two coverage tables now place their header separator correctly.

Verification:
- A line-level comparison confirmed that every removed line of the old README was a renamed heading or a moved install command. The heading "Capture lessons from working chats" is kept, because an earlier journal links its anchor.
- Every CLI command remains documented.
- `pnpm start` served the viewer, and `pnpm brain` ran a lookup.
- `pnpm run verify:ci` passed.
