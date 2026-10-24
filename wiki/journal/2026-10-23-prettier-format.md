---
title: "Format runtime code with Prettier"
date: "2026-10-23"
topics: [code-quality]
---

# Format runtime code with Prettier

[Issue 145](https://github.com/JFusco/brain/issues/145) is phase 2 of the cleanup. Prettier now formats `scripts/` (except the vendored `scripts/wiki/`) and the viewer sources, and `format:check` covers the whole repository. `.prettierignore` excludes knowledge, catalogs, wiki, Markdown, YAML and the pnpm lockfiles; pnpm owns lockfile formatting.

Logic was not edited by hand, with two exceptions. Formatting moved two `eslint-disable-next-line` directives in `core.mjs` off their lines, so the `safePath` control-character regex is now a named constant and the JSON reader's directive sits on its `throw`. The pre-commit hook now also runs `prettier --check` on staged JavaScript.

Verification:
- Normalized output from 19 read-only commands is byte-identical before and after the reformat. The commands cover help, lookup (including the CMS profile and UI patterns), route, brief, playbooks, check, official check, maintenance status, vocabulary, ui, skills, curation, inbox, CLI error paths and nightly status.
- `pnpm run verify:ci` passed.
- A new hook test proves that staged JavaScript failing lint or formatting blocks the commit.
