---
title: "Simplification phase 2: knowledge publishes as ordinary Git changes"
topics: ["automatic-knowledge-maintenance", "incremental-collection", "brain-skill"]
plans: ["2026-10-18-brain-simplification-phase-2-publish-knowledge-as-ordinary-git-changes-e971dbeb8b.md"]
issue: 'https://github.com/jfusco/brain/issues/54'
issues: ['https://github.com/jfusco/brain/issues/54']
---

# Simplification phase 2

[Issue 54](https://github.com/JFusco/brain/issues/54) delivers phase 2 of the simplification audit. A lesson used to travel harvest → private inbox → proposal digest → isolated-worktree export → PR → merge → `record-merge` → `approvals.json`. Over 3,075 harvested candidates, that path accepted one and published about ten notes. Its exact-byte ledger made `publishedGuidance()` throw on any hand edit, and through `generateHubs()` that broke `lookup`, maintenance, `official sync` and the hosted run.

## Joe's decisions

- Leave the 2,726 pending harvested records untouched and review them only on request; add a rescan path.
- `/brain-capture` saves to the private inbox rather than opening a Brain PR from another project.
- Keep only `skills suggest`; no project used the installer.
- Remove `integration`; no project was enrolled.
- Repoint the nightly Codex curator to stale notes and new captures.

## Changes

- **Proposal pipeline retired.** `inbox compare`, knowledge `propose`/`apply`, `curation export`/`record-merge` and `deduplication.mjs` are gone.
  - `inbox propose`/`apply` remain for `official/sources.json` only, with the same function names and arguments the hosted link-warning repair calls. They keep the digest, transaction journal, lock policy-hash update and runtime check.
  - `inbox resolve` gains `--as accepted --pr <n>`, which verifies the merged Brain PR.
- **No approval ledger.** `knowledge/approvals.json` is deleted.
  - `publishedGuidance()` reads every note except hubs and templates, and skips invalid pages instead of throwing.
  - Hubs list `current` notes. `check` reports a hub whose curated links no longer match, in full and staged mode, and `curation hubs` regenerates them. The superseded-target check stays.
- **No automatic harvest.** `harvest.mjs` became `capture.mjs`. The `harvest` command, the scheduled harvest step and the `harvest` config block are gone; `capture.candidateBytes` replaces the block.
  - The privacy-policy hash covers only client terms and the scanner version.
  - `inbox rescan` re-scans older records without rewriting bodies.
  - `inbox list` shows captures by default; `--backlog` adds the harvested records.
- **Capture skill.** [`skills/brain-capture/`](../../skills/brain-capture/SKILL.md) is manual-only and documented in the README; see [the skill decision](../topics/brain-skill.md).
- **Integration and installer removed.** `scripts/lib/integration.mjs`, `scripts/integration/` and the `integration` command are deleted. `skills.mjs` keeps only the read-only `suggest`, which now also reports skills already present in the project. The scheduled run no longer writes a project-update report.
- **Pre-existing defect fixed.** Since hosted reference maintenance ([PR 46](https://github.com/JFusco/brain/pull/46)), `scheduled-run` threw `Cannot read properties of undefined (reading 'length')` on the skipped official result. The LaunchAgent run therefore failed before recording success.
- **Knowledge cleanup.**
  - `find-guidance-and-skills.md` and `curation-standard.md` are retired.
  - The Contentful Preview guidance moved from `cms-guidance.md` into `cms/contentful/preview-api-surface.md`, with its evidence and provenance.
  - The page template and the index's freshness text no longer mention proposals.
- **Docs.**
  - `AGENTS.md` "Curation and publication" describes the new flow and keeps the privacy, stale-first, 12-per-night, rejection, keep-pending and no-invented-lesson rules, plus the auto-merge authorization.
  - The README collapses the curation section, and STATUS, [automatic knowledge maintenance](../topics/automatic-knowledge-maintenance.md), [incremental collection](../topics/incremental-collection.md) and [link warning investigation](../topics/link-warning-investigation.md) follow.

## Verification (cloud session, 2026-10-18)

Node 24.14.0 and the pinned Gitleaks 8.30.1 came from `scripts/hosted/setup.mjs`. That profile has no client terms, so real client-term redaction was not exercised; secret scanning and a temporary scratch term were.

- **Baseline on merged `main`:** full `check` passed (1,558 files), after `official restore` of the two git-ignored active files. Its one warning: 230 historical cached files are unavailable.
- **Guard:** the pre-commit `check --staged` passed on every commit (1,693–1,696 files).
- **Hand-edit regression:** with the body of `react/hydration-browser-storage.md` edited, these all exited 0, and the note was the top `lookup` result with its new hash:
  - `lookup --domain react --query hydration`
  - `maintenance status`
  - `curation stale`
  - `links status`
  - `curation hubs`
  - `official check`
  - full `check`
- **Hubs:**
  - Every `current` note is listed, and the two retired notes are not.
  - Changing a note title without regenerating made both `check` and `check --staged` report "curated links are out of date; run curation hubs".
  - The first regeneration changed only the empty-hub placeholder text.
- **Capture:**
  - A harmless lesson returned `pending` and appeared in `inbox list`. A fake `ghp_` token returned `quarantined`.
  - After adding a scratch client term, `inbox show` refused the record and told me to run `inbox rescan`. Rescan returned it to `pending`, and a term present in the text quarantined it.
  - `resolve --as accepted` without `--pr` is refused, and `--pr` with `--as rejected` is refused.
  - `--as accepted --pr 53` reached the GitHub API but got HTTP 401, because the cloud `gh` token is not authenticated. On the Mac it uses `gh auth token`.
  - Only records I created were removed.
- **Registry path:** a script mirroring `scripts/hosted/maintenance.mjs:133` ran `inbox.propose` + `inbox.apply`, both changes then reverted.
  - A pointer edit changed only `official/sources.json` and its hub, with no lock change.
  - A source-field edit also changed exactly one `policySha256` in the lock.
  - Neither created `approvals.json`, `.state/harvest.json` or `inbox/`, and the knowledge-path and cited-candidate proposals are refused.
  - `scripts/hosted/maintenance.mjs` and `.github/` are unchanged. Re-running `scripts/hosted/setup.mjs` produced a profile without `harvest`, and `check` passed.
- **Other runs:**
  - `scheduled-run` completed after the fix.
  - `skills suggest` on a scratch project reported a recommended skill and one already present.
  - The removed commands are refused, and `--help` no longer lists them.

## Limits and follow-up

On Joe's Mac after merge:

- Run `node scripts/brain.mjs inbox rescan` once, because the policy hash changed.
- Add the two `brain-capture` links, and check that `/brain-capture` and `$brain-capture` each appear once and don't auto-trigger.
- Paste the repointed curator prompt from the PR into the Codex app.
- Run a staged check, which exercises the real client terms.
- Confirm the next 03:15 ET hosted run.

Phase 3 remains open:

- official references as a link registry;
- snapshot pruning;
- replacing the link investigator, which also retires the registry-only `propose`/`apply`;
- making `check` pass in a fresh clone;
- revisiting the LaunchAgent.

Rollback: revert the individual commits.
