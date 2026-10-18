---
title: "Simplification phase 1: cross-agent skill and trimmed upkeep"
topics: ["brain-skill", "automatic-knowledge-maintenance"]
plans: ["2026-10-18-brain-simplification-phase-1-b9e8371654.md"]
issue: 'https://github.com/jfusco/brain/issues/52'
issues: ['https://github.com/jfusco/brain/issues/52']
---

# Simplification phase 1

[Issue 52](https://github.com/JFusco/brain/issues/52) delivers phase 1 of a project audit. The audit found seven substantive framework notes under far heavier machinery, and no clean way to use Brain from other projects. Phase 1 adds an opt-in skill and removes upkeep without touching `knowledge/`.

## Changes

- **Opt-in skill.** [`skills/brain/`](../../skills/brain/SKILL.md) is a manual-only router shared by Claude Code, Codex and Cursor; see [the decision](../topics/brain-skill.md). The README documents the two user-level symlinks. `check` now scans `skills/`.
- **Registry receipt removed.** `requireRegistryApproval` and every `.state/registry-approval.json` write are gone (`lookup`, `sync`, `recatalog`, `check`, `setup --approve-registry`, hosted setup, registry proposal apply). The lock's per-source policy hashes still fail `official check` and `official restore` on a mismatched registry.
- **Backup tooling removed.** `scripts/lib/backup.mjs`, the `backup` CLI commands, maintenance status/run hooks and the three config keys are deleted. Existing private archives and keys were not touched.
- **Wiki sync workflows removed.** `wiki-sync.yml` and `wiki-issue-sync.yml` no longer open reconciliation PRs. `Wiki integrity` and the wiki scripts remain.
- **`AGENTS.md` condensed** from 13,344 to 8,409 bytes. Every authorization and prohibition stays; procedure detail points to README sections and runbooks that already contain it, after checking each one. The commit standard and installer-owned wiki block are unchanged. The plan estimated about 5 KB; keeping every rule plus the unchanged blocks set the floor higher.

## Verification (cloud session, 2026-10-18)

The pinned Gitleaks 8.30.1 was installed with `scripts/hosted/setup.mjs` under Node 24.14.0, after Joe allowed the GitHub release hosts. That profile has no private client terms, so client-term redaction was not exercised. Secret scanning was.

- Baseline on unchanged `main`: `check --staged` passed (1,695 files). `lookup` failed with `Source registry changed without an approved proposal`.
- The pre-commit guard passed on every commit.
- With no receipt present, `lookup --domain react --query "hydration localStorage"` returned the curated hydration note first. An all-domain query returned Contentful and Optimizely results.
- `--help` lists no backup commands, and `backup status` reports an unknown command. `maintenance run --dry-run` returns only `dryRun`, `guidance`, `cache` and `status`. `maintenance status` has no `backup` field. It exits 1 with "Collection has no recent successful run" because the fresh session never harvested.
- `official restore` restored the two git-ignored active files missing from the fresh clone (`contentful-skills`, `optimizely-sdk`). Full `check` and `official check` then passed, with the warning that 230 historical cached files are unavailable; the hosted profile tolerates that gap.
- Skill frontmatter parsed with the repository parser and YAML; both switches are booleans. A simulated install in a scratch home resolved both links, and a repeated `ln` refused with "File exists".
- Wiki graph build and integrity check passed.

## Limits and follow-up

Discovery of the skill in Claude Code, Codex and Cursor must be confirmed on Joe's Mac; the Codex and Cursor details come from search results. The next hosted 03:15 run exercises the changed `hosted/setup.mjs`, and the next nightly curation reads the condensed `AGENTS.md`. Check both with `maintenance status`.

Phase 2 (capture → PR; retiring harvest digests and `approvals.json`; the `integration` and `skills install` decision) and phase 3 (official references as a link registry; pruning superseded snapshot revisions; replacing the link investigator) remain open.

Rollback: revert the individual commits, and delete the user-level skill symlinks.
