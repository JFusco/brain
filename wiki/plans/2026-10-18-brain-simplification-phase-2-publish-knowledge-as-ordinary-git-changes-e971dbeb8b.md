---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/brain/issues/54", "Branch codex/54-simplify-phase-2 commits 8380c0c, d9353a8, 218e97b, ee42fc2, 2c8a687, b300719, a27dd3b, f7b0610", "skills/brain-capture/SKILL.md"]
source_tool: "repository"
source: "/root/.claude/plans/root-claude-uploads-381a6b16-7778-5c5b-joyful-peach.md"
topics: ["automatic-knowledge-maintenance", "incremental-collection", "brain-skill"]
digest: "e971dbeb8b3a705611800a4514bcb14c99acdcc8ff15eccbcf9961b64b0e9419"
---

# Brain simplification — phase 2: publish knowledge as ordinary Git changes

## Context

Publishing a lesson today takes nine steps: harvest → private inbox → proposal digest → isolated-worktree export → PR → merge → `record-merge` → `approvals.json` hash record. Out of 3,075 harvested candidates, 1 was accepted and 2,726 are still pending.

`publishedGuidance()` throws when any published note's bytes differ from `approvals.json`. `generateHubs()` → `staleGuidance()` calls it, so one hand edit breaks `lookup`, `maintenance status`/`run`, `links check`, `official sync` and the hosted 03:15 run.

Phase 2 makes publishing an ordinary Git change: edit a note on a branch → `check` → PR → merge. Lessons arrive deliberately through a manual `/brain-capture` skill.

**Joe's decisions (2026-10-18):**
1. Leave the backlog untouched in the private inbox, mine it only on request, and add `inbox rescan`.
2. `/brain-capture` saves to the private inbox.
3. Keep only `skills suggest`.
4. Remove `integration`; no project is enrolled.
5. Repoint the nightly curator to captures and stale notes.
6. Joe merges #53 first, then I branch `codex/<issue>-simplify-phase-2` from main.

Optional item 7c, the Contentful split, is included; strike it at approval if you don't want it.

## Preconditions (execution start)

- Confirm PR #53 is merged. If it isn't, stop and tell Joe.
- `git switch main && git pull --ff-only`.
- Create the issue (labels `documentation`, `enhancement`) and read it back.
- Branch `codex/<n>-simplify-phase-2`.
- Environment:
  - Node 24.14.0 via nvm.
  - `node scripts/hosted/setup.mjs` for the pinned scanner and hosted profile.
  - `git config core.hooksPath .githooks`.
  - `official restore contentful-skills` and `official restore optimizely-sdk`.
  - Record a baseline `check`.

## Commits, in order

The order is chosen so the pre-commit `check --staged` passes on every commit. Nothing writes `approvals.json` before its readers are removed, and no knowledge page changes while the approval-record rule still exists. Every subject is ≤50 characters.

### 1. `refactor(curation)!: retire knowledge proposals` (work item 2)

- **Delete:**
  - `scripts/lib/curation.mjs` (export, record-merge)
  - `scripts/lib/deduplication.mjs`
  - `inbox.compare`
- **`scripts/lib/inbox.mjs`:** `propose`/`apply` become **registry-only**.
  - `propose` accepts exactly one change to `official/sources.json`. It refuses cited or accepted candidates and drops the knowledge validation and dedup.
  - `apply` drops candidate checks, the `approvals.json` backup/write and the `harvest.json` dispositions.
  - It keeps:
    - the transaction journal
    - `recoverProposal`
    - the lock `policySha256` update via `fingerprint`
    - `generateHubs()` + `check()`
  - The proposal payload stays digest-bound.
  - Effect on hosted: `scripts/hosted/maintenance.mjs:133` keeps calling the same `inbox.propose({changes:[registry],candidates:[],acceptCandidates:[]})` / `inbox.apply(id,digest)`, with no hosted code change. This matters because once `approvals.json` is gone, an apply that rewrote it would create a file outside the hosted writer's allowlist.
- **`inbox resolve`:** add `--as accepted --pr <n>`, which verifies the PR is merged to Brain main.
  - Reuse the repository-identity + `api()` check from `recordPublication`, extracted into an exported helper in `scripts/lib/maintenance.mjs`.
  - `resolve` becomes async.
- **`scripts/brain.mjs`:**
  - Remove `inbox compare` and `curation export`/`record-merge`.
  - Add `pr` to the inbox flags.
  - Update the help text and the `mutating` expression.

### 2. `feat(knowledge)!: publish notes without approvals` (work item 1)

- **`scripts/lib/guidance.mjs`:**
  - Move `validateKnowledge` here from `check.mjs`; `check.mjs` imports it. This avoids a guidance↔check↔official import cycle.
  - `publishedGuidance()` walks `knowledge/**/*.md`, skipping every `INDEX.md` and `_templates/`. It keeps symlink safety, skips pages that fail validation instead of throwing, and keeps the returned shape: `path`, `title`, `domain`, `versions`, `freshness`, `raw`, `body`, and `sha256` computed from the bytes.
  - Add a pure `curatedLinks(domain, pages)`. It lists notes under `knowledge/<domain>/` whose `status` is `current` or missing, sorted with titles sanitized as today. With none, the placeholder reads "No curated notes yet."
- **`scripts/lib/official.mjs` `generateHubs()`:** build the curated block from `publishedGuidance()` + `curatedLinks`, with no `approvals.json` read.
- **`scripts/lib/check.mjs`:**
  - Drop the "no matching approval record" rule.
  - The `superseded_by` check only requires that the target page exists among the entries.
  - New in both full and staged modes: each domain hub's curated block must equal `curatedLinks` computed from the entries. Otherwise report "curated links are out of date; run curation hubs". This lets the pre-commit guard catch a forgotten hub update.
- **New `curation hubs`** (mutating) runs `generateHubs()`. The `curation` command becomes `stale` + `hubs`.
- **Delete `knowledge/approvals.json`** and regenerate the hubs (placeholder wording only).

### 3. `refactor(capture)!: stop automatic harvest` (work item 3 + rescan)

- **Rename** `scripts/lib/harvest.mjs` → `capture.mjs`. It keeps only `capture`, `domainFor`, `summary`/`refreshSummary`; collection, classification, `projectRoots` and `COLLECTION_VERSION` go. The scanner and quarantine stay on capture.
- **`brain.mjs`:** remove the `harvest` command; drop `rehash` and add `backlog` in `args()`.
- **`schedule.mjs`:** remove the harvest step and its state fields.
- **`brain.config.json`:** replace the `harvest` block with `"capture": {"candidateBytes": 16384}`. `keywords` stays for domain inference.
  - Update the readers: `inbox.show`, `capture`.
  - In `scripts/hosted/setup.mjs`, drop the dead `harvest:` profile override. Nothing hosted reads it.
- **`privacy.mjs` `policyHash()`:** becomes `{version:2, terms, scanner}`, since collection config no longer affects privacy.
- **New `inbox rescan [<id...>]`** (mutating, locked). For each unresolved, non-quarantined record whose stored policy differs from the current one:
  - It verifies `fileSha256`; changed files stay untouched and are reported.
  - It runs `scan()` in batches of 300 plus `clientHits`.
  - A finding sets the record to `quarantined`; otherwise it gets `pending` with the current policy.
  - It never rewrites bodies and never prints content.
  - `candidate()`'s error message points to `inbox rescan`.
- **`inbox list`** defaults to `class: capture` records. `--backlog` includes the 2,726 harvested records, which keeps agent output small.

### 4. `feat(skill): add manual brain-capture skill` (work item 4)

- **`skills/brain-capture/SKILL.md`**, with `disable-model-invocation: true`, and `agents/openai.yaml` with `allow_implicit_invocation: false`. Same pattern as `skills/brain/`. The body tells the agent to:
  - draft up to three distinct lessons in the `knowledge/_templates/page.md` shape, staying under 16 KB;
  - name the application workspace and its installed versions, writing "unknown" when they aren't established, and never merge sibling workspaces' versions;
  - label documented facts (cited), observed results and proposed practices;
  - strip client names, private paths, credentials, personal data, proprietary code and transcripts;
  - pick a domain from `brain.config.json` `domains`, or `_unsorted`;
  - submit via a quoted heredoc with `node ~/Projects/brain/scripts/brain.mjs capture --stdin --domain <d>`;
  - report `pending` as "saved to Brain's inbox", never "published". On `duplicate`, say it's already saved. On `quarantined`, report only the status, without retrying or echoing content;
  - never print, log or commit raw context;
  - never read auth/env files, session stores or transcripts.
- **README:** document both links for the new skill (`~/.claude/skills`, `~/.agents/skills`) next to the existing `brain` links.
- **AGENTS.md:** the opt-in exception names both skills.

### 5. `refactor(integration)!: remove capture integration` (work item 5)

- Delete `scripts/lib/integration.mjs` and `scripts/integration/`.
- Remove the CLI command and the README section "Capture lessons from working chats". It is replaced by a short `/brain-capture` section.

### 6. `refactor(skills)!: keep only skills suggest` (work item 6)

- **`scripts/lib/skills.mjs`:** keep `project()`, `compatibility()` and `suggest()`.
  - The status is `recommended`, `present in project` (an existing `.agents/skills/<name>` or `.claude/skills/<name>`), or the compatibility reason.
  - Delete the manifest handling, `mutate`, `recover`, `desiredFiles`, `removeEmptyCreated` and the `.state/enrolled-projects.json` writes.
- **`schedule.mjs`:** drop project-update reporting and `.state/project-updates.json`. The notification reports source changes, failures and maintenance changes.
- **`brain.mjs`:** `skills` accepts only `suggest` with `--project`/`--workspace`.
- **README "Project skills":** `suggest` only; install recommended skills with the vendor's own documented method.

### 7. `docs(knowledge): retire maintainer notes` (work item 7)

These are ordinary edits now.

- **a.** `_unsorted/find-guidance-and-skills.md`: set `status: "retired"` and add a line that the `brain` skill replaces it.
- **b.** `_unsorted/curation-standard.md`: move its transferable rules into AGENTS.md (commit 8) and the README, then retire it. The rules are:
  - rotate domains;
  - review at most 12 per night;
  - rejection criteria;
  - uncertain material stays pending;
  - check overlap;
  - separate facts, observations and proposals;
  - narrow claims that can't be checked.
- **c.** Split the Contentful Preview guidance out of `_unsorted/cms-guidance.md` into `knowledge/cms/contentful/preview-api-surface.md`.
  - The note keeps its evidence, limits, the Oct 18 revalidation, and `provenance: contentful-skills@1e40a4c0e841…` so stale detection still works.
  - `cms-guidance.md` keeps its routing table and links to the new note.
- **d.** `_templates/page.md`:
  - The provenance placeholder becomes "official `source-id@revision` plus sanitized evidence; no inbox IDs".
  - "same proposal/PR process" becomes "an ordinary knowledge PR".
- **e.** `knowledge/INDEX.md`:
  - Intro: notes publish when their PR merges.
  - The "How to apply sources" link to the retired note is replaced by a pointer to the `brain` skill.
  - Rewrite the "Freshness" text.
- Run `curation hubs`. The `_unsorted` hub then lists only cms-guidance, and the Contentful hub lists the new note.

### 8. `docs(agents): rewrite curation and publication` (work item 8)

- **AGENTS.md "Curation and publication"** describes the new flow:
  - capture → private inbox;
  - an issue branch note edit → `curation hubs` + `check` → PR → merge;
  - after merge, `inbox resolve --as accepted --pr <n>`.
- **Kept verbatim in substance:**
  - every privacy and untrusted-content rule;
  - stale-first (`curation stale --limit 12`, never clear a stale signal by changing only a hash or date);
  - the 12-per-night limit;
  - reject only fully reviewed material with no reusable guidance;
  - uncertain material stays pending;
  - length, age, format or tags never justify rejection;
  - never invent a lesson;
  - preserve bodies and history;
  - the backlog is reviewed only on request (`--backlog`);
  - the auto-merge authorization for routine knowledge PRs.
- **Dropped:** compare/propose/export/record-merge, digests, `acceptCandidates` and the `.state/curation-triage/` requirement.
- **"Projects and skills":** suggest only; background jobs never write project repositories.
- **README:**
  - Collapse "Automatic curation and publication" into a short "Curation and publication" section.
  - Remove the harvest and collection paragraphs, and `harvest`/`inbox compare` from "Everyday commands".
  - Fix the privacy, setup and schedule wording that mentions harvest and promotion, and the rescan note.
- **STATUS.md:** record what phase 2 delivered.
- **`wiki/topics/link-warning-investigation.md`** (lines ~29/31/47): knowledge repairs go through an ordinary knowledge PR; registry repairs keep the registry-only `inbox propose`/`apply`.
- **`wiki/topics/hosted-maintenance.md`** line 10: "harvesting" becomes "capture".

### 9. `docs(wiki): record simplification phase 2` (work item 9)

- `node scripts/wiki/archive-plan.cjs <this plan> --status implemented --evidence <issue URL> --topic automatic-knowledge-maintenance`.
- Add `wiki/journal/<date>-simplification-phase-2.md`, with topics, plans and the issue in frontmatter.
- Update the topics:
  - `automatic-knowledge-maintenance.md`
  - `incremental-collection.md` (harvest removed; page becomes historical)
  - `brain-skill.md` (adds `brain-capture`)
- Run `build-graph.cjs`, `check.cjs` and scoped `discover-plans.cjs`.

## Verification

- `node --check` on every changed script, and `git diff --check`.
- `node scripts/brain.mjs check` passes, and the pre-commit `check --staged` passes on every commit. Report the actual outcomes, including the historical-cache warning.
- **CLI surface:** `--help` lists none of these, and each is refused: `harvest`, `integration`, `inbox compare`, `curation export`/`record-merge`, `skills install|update|remove|recover`.
- **Hand-edit regression:** edit the body of `knowledge/react/hydration-browser-storage.md`, then run:
  - `lookup --domain react --query hydration`
  - `maintenance status`
  - `curation stale`
  - `check`

  None may throw, and the note still appears. `maintenance status` may exit 1 only with the known "Collection has no recent successful run". Revert the edit afterwards.
- **Hubs:**
  - `curation hubs` leaves no diff.
  - Every `current` note is listed, and the two retired notes are not.
  - Negative test: change a note title without running `hubs`. `check` and `check --staged` must report the stale hub. Revert.
- **Capture:**
  - A harmless lesson with `capture --stdin --domain react` gives `pending`, and `inbox list` shows it.
  - A fake `ghp_…` token gives `quarantined`.
  - Add a temporary client term to the local profile, then run `inbox rescan`. The record must be re-scanned (pending, or quarantined if the term appears). Restore the profile.
  - `resolve --as accepted` without `--pr` is refused.
  - Remove only the records I created. In the cloud clone the inbox has nothing else.
- **Hosted registry path**, in the primary clone, then reverted:
  - A node script runs `inbox.propose` + `inbox.apply` exactly as `maintenance.mjs:133` does, with a pointer `reason` edit. Only `official/sources.json` may change; no `approvals.json` or `harvest.json` is created; `check` passes.
  - Repeat with a source-field edit. Only that source's lock `policySha256` may update.
  - Restore with `git checkout -- official/` and delete the created `.state/proposals` files.
  - Code trace: the hosted imports and call shapes are unchanged.
- **Wiki:** graph build, integrity check and no missed plans.
- **Delivery:**
  - Push the branch.
  - Open the PR with problem, behavior, verification outcomes, risk and rollback, `Closes #<n>`, and the **new nightly-curator prompt** for the Codex app.
  - Read the PR back.
  - **Stop at the verified PR; Joe merges.**
- **For Joe on the Mac after merge:**
  - Run `node scripts/brain.mjs inbox rescan` once.
  - Add the two `brain-capture` symlinks.
  - Check that `/brain-capture` (Claude Code, Cursor) and `$brain-capture` (Codex) appear once and don't auto-trigger.
  - Paste the repointed curator prompt into the Codex app.
  - Run a staged check to exercise client-term redaction, which the hosted profile lacks.
  - Confirm the next 03:15 ET hosted run succeeds.

## Risk and rollback

- Each work item is its own commit, so each can be reverted with `git revert`.
- Private inbox bodies, dispositions and `.state/` are never rewritten. `rescan` only updates status and policy in the index.
- `scripts/hosted/maintenance.mjs` is unchanged; `scripts/hosted/setup.mjs` only loses a dead `harvest` profile key. The registry-only apply keeps the same function names, arguments and lock-hash behavior.
