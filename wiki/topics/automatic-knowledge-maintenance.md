---
title: "Automatic knowledge maintenance"
aliases: ["curation", "reference refresh", "Brain audit"]
---

# Automatic knowledge maintenance

Brain captures private lesson evidence, keeps immutable official references, and publishes useful guidance through documented, issue-linked PRs. Joe authorized automatic maintenance merges without a human review or separate digest approval. The daily local agent is restricted to documentation and reference artifacts; code, policies, new source/host registrations, other repositories, installed project skills, and memories are outside that recurring scope. The bounded existing-reference routing exception is defined in the [daily link warning investigation procedure](link-warning-investigation.md).

## Current flow: notes publish on merge

[Simplification phase 2](../journal/2026-10-18-simplification-phase-2.md) ([issue 54](https://github.com/JFusco/brain/issues/54)) replaced the pipeline described in the historical sections below.

- **Capture.** Lessons are captured deliberately with the manual `brain-capture` skill (`capture --stdin --domain <d>`) into the private, scanned inbox. Nightly project harvesting and the project `integration` blocks are gone.
- **Publication.** Publishing is an ordinary Git change: edit a note on an issue branch, run `curation hubs` and `check`, then merge the PR. A merged note with `status: current` is published. `knowledge/approvals.json`, proposal digests, `curation export`/`record-merge` and duplicate-review records are gone. After merge, `inbox resolve --as accepted --pr <n>` records the outcome against the verified merged PR.
- **Why.** Over 3,075 harvested candidates, the old path accepted one and published about ten notes. Its exact-byte ledger made one hand edit break `lookup`, maintenance, `official sync` and the hosted run.
- **Kept.** Stale-first revalidation, the 12-per-night limit, the conservative rejection rules and the automatic merge authorization for routine knowledge PRs all remain.
- **Backlog.** The 2,726 pending harvested records stay untouched and are reviewed only on request (`inbox list --backlog`). The privacy policy now covers only client terms and the scanner version, and `inbox rescan` re-checks older records without rewriting bodies.
- **Nightly curator.** The local Codex curator is repointed to stale notes and new captures.

## Capture from working projects

Historical: phase 2 removed this integration.


The explicitly authorized project integration adds automatic lesson-submission instructions at substantive planning, investigation, and implementation checkpoints. It supports Codex, Claude, and Cursor through project-local adapters; installation is previewed and requires a scoped `--yes` operation for the selected Git repository. Shared instructions ask agents to distinguish documented facts, observed results, and proposed practices. This is agent-directed capture, not transcript ingestion or a guaranteed completion hook.

The standalone helper keeps an ignored, private retry queue before calling Brain's existing scanned inbox capture with a validated domain. Exact duplicate receipts suppress retries, uncertain delivery retains bytes, and quarantined material is retained without automatic retry. Private queued text is agent-sanitized and remains unverified until Brain's scanner runs. The daily curator still determines whether material becomes published guidance.

Integration ownership is separate from vendor-skill management. Changed managed content and unmanaged conflicts block replacement; private transaction journals support cautious recovery. Removal preserves unrelated text and pending private evidence plus its ignore rule. Brain itself is not enrolled. No other project enrollment, global installation, or background project mutation is implied by implementing this capability. See [the local implementation journal](../journal/2026-10-16-project-lesson-capture.md).

## Curation and publication

Historical: phase 2 replaced this with ordinary note PRs; `inbox propose`/`apply` remain only for registry changes.

A private proposal binds exact replacement text, destination hashes, candidate hashes, privacy policy, and the explicit subset of candidates ready for acceptance. `curation export` writes the proposal, exact-content records, and curated links into a clean issue-linked worktree of this same repository. Partial source candidates remain pending. The CLI performs no Git commits, pushes, PR creation, or merges.

The authorized agent documents practical effect, applicability, sanitized evidence, source revisions, limitations, actual verification, digest, and rollback in the issue and PR. After passing runtime and wiki checks and verifying the saved PR/head, it merges the scoped maintenance PR. `curation record-merge` verifies repository/base/digest, fetched main ancestry, and immutable exported file hashes before accepting the selected candidates.

## Candidate rejection policy

[Issue 24](https://github.com/JFusco/brain/issues/24) makes nightly disposition explicit within the existing 12-candidate budget. The curator rejects only fully reviewed material with no reusable guidance or evidence, saving candidate ID, current content hash, review coverage, decision, batch time, and a concrete reason privately before resolution and the actual command outcome afterward. Failure to save the audit record or a changed hash leaves the item pending. Status-only updates, one-off task lists, or repository instructions can qualify; their format, length, age, or tags alone cannot establish low value.

Mixed, partly useful, uncertain, inaccessible, unsupported, and partly reviewed candidates remain pending with useful portions and remaining review needs recorded. Rejection preserves bodies and provenance; quarantined bodies are excluded. This refines the existing publisher prompt without adding another schedule or changing exact-content proposals, issue-linked PRs, automatic merge, or immutable merge verification. See [the rejection-policy journal](../journal/2026-10-17-curator-rejections.md).

## Freshness and source coverage

The existing 02:30 local LaunchAgent performs collection and due official refresh. Official references are due after 20 hours. Changed license material is recorded automatically rather than awaiting manual approval. Content, origin, hashes, size limits, privacy screening, and last-good preservation still apply. A separate 03:15 local agent can publish at most one documentation PR and review at most 12 candidates per run.

Joe subsequently chose catalog-first discovery rather than full-page mirroring. Vercel and Contentstack catalogs use official sitemap metadata, React and Tailwind use pinned repository trees, and Optimizely CMS SaaS and Graph catalogs select links from the official index. Tailwind's rights are recorded accurately rather than labeled open source. Existing snapshots remain historical references. Contentful API/JavaScript SDK lookup uses the supported Markdown references described below; earlier landing/index rate-limit observations remain historical evidence. Sitecore pages are retrieved through the verified GET fallback described below; their earlier HEAD failures remain historical evidence.

The initial six catalogs contain 4,790 distinct links. Superseded full exports and oversized catalog files retain exact hashes and local bytes through the existing private object cache; they are restored explicitly when absent. Normal current catalogs remain tracked metadata, and their refresh never downloads every linked page.

`lookup` ranks official links and curated notes without downloading page bodies. Optional `--fetch` retrieves only selected pages and returns focused excerpts with content hashes and timestamps; its 24-hour private cache retains excerpts and receipts, not full bodies. Pinned repository fetches verify Git blob identities. A catalog revision records discovery metadata, not a product version or a claim that the current remote page has been checked.

## On-demand reliability and private recovery

The [issue 5 follow-up](https://github.com/JFusco/brain/issues/5) adds explicit package/version context to on-demand lookup, without adopting Brain instructions into consuming projects. Installed Next.js documentation is preferred when available in the selected application. Notes declare narrow package-prefix or minimum-version constraints; incompatible notes leave results and uncertain compatibility stays labeled. Sibling workspace dependency sets are never combined.

`curation stale` queues exact published pages affected by source revision drift or review age (30 days by default). Revalidation requires checking the relevant claims, not replacing a revision or date alone. Retirement and supersession metadata preserve history while removing recommendations. The Next.js bundled-doc note was checked against the actual official agent guide and scoped to Next.js 16.2 onward.

`links check` samples 24 approved-host destinations by default, maximum 100, favoring used references and rotating across sources. It retains HTTP/redirect/access/network classifications without page bodies or automatic registry rewrites. Two daily 404 observations confirm dead; HTTP 410 is immediate. Sample size and total coverage remain visible. The network-enabled implementation batch observed 23 healthy destinations and one Sitecore HTTP 403; earlier sandbox-network failures remain evidence, not dead-link proof.

`maintenance status` separates collection/publication attempt and success, source failures, unfinished runs, stale notes, link coverage, and backup availability. A configured schedule or a manual run is not proof of unattended execution. The existing local 03:15 publisher records its actual trigger and outcome, prioritizes stale notes, and retains the one-PR/12-candidate limits. A sleeping/offline Mac can report a missed run only after it resumes and checks status.

Encrypted backups cover eligible private configuration, inbox, proposals, receipts, failure evidence, and cached objects, while excluding auth/environment/session/raw-memory files, worktrees, tools, recovery copies, excerpt caches, and the separate key. Creation authenticates and checks every file before recording success; recovery stages into an empty directory and never overwrites active state or executes restored code. Local retention keeps seven owned archives, preserving unknown or modified files. Managed excerpt cleanup uses ownership/hash checks, a 24-hour lifetime, and 1,000-file/8-MiB bounds; historical source objects and publication receipts are unaffected.

The actual encrypted archive and recovery verified 6,625 files. Off-device protection requires an explicitly authorized encrypted upload and readback; a configured Drive folder alone is not proof. Keep the recovery key securely off the Mac and separate from archives. The connector records cloud presence through metadata readback, distinctly from downloaded-byte verification. Cloud sharing and deletion are outside maintenance operations.

## Audit findings and practical limits

- Whole-candidate acceptance was replaced by an explicit acceptance subset; citation alone no longer implies the rest was curated.
- Nested upstream skill copies produced repeated identities. Cataloging now limits entry points to the source's mapped skill root and retains nested material as references.
- Three authority links pointed outside the Git repository, and a Next.js link pointed to an ignored large snapshot. Authority URLs now identify their repositories; cached references use clearly labeled upstream links and local restoration instructions.
- The prior privacy hook used `exec`, preventing appended wiki lifecycle work. The blocking guard now returns before the advisory wiki block.
- A canonical wiki audit heuristic contained a project identifier covered by Brain privacy rules. That single heuristic was generalized locally; this is an intentional privacy adaptation, not an unmodified canonical asset. Future kit reconciliation must preserve that adaptation.
- Wiki discovery is scoped through `WIKI_HOME` to avoid excluded home session stores.
- The follow-up matcher uses one explicitly selected application workspace, including its required scripts and paths. Installed versions and declared-only ranges remain distinct; suggestions are not a complete API compatibility proof.
- Keyword tagging can classify incidental mentions as domain evidence. Curation must assess the actual subject rather than accepting tags as relevance proof.
- Runtime checks establish structure, privacy, integrity, and exact publication bytes. They do not prove every technical claim or the usefulness of every harvested excerpt.

The audit covered maintained core runtime modules, CLI/setup, public configuration, source registry/catalog logic, schedule, hook integration, and wiki navigation code. Snapshot hashes and runtime content were checked separately. Inbox inspection was a bounded cross-domain sample, not a semantic audit of every candidate or all upstream documentation. Tests, fixtures, fresh-session tests, dedicated QA, and review-agent audits remain deferred; the explicitly requested wiki workflows are installed.

See [the delivery journal](../journal/2026-10-15-automatic-knowledge-maintenance.md) and [JFusco/brain issue 1](https://github.com/JFusco/brain/issues/1).

See [the on-demand reliability journal](../journal/2026-10-15-on-demand-reliability.md) for this follow-up.

## Backup requirement withdrawn

After the initial upload, Joe explicitly said no backup was needed. [Issue 8](https://github.com/JFusco/brain/issues/8) disables automatic backup creation, inventory previews, pruning and Drive uploads. Status exposes `automaticEnabled: false` and does not raise backup-requirement alerts while disabled. Existing archives, keys, Drive files and receipts are preserved; explicit manual recovery remains available. Daily learning/reference maintenance and the one-time 4 a.m. verification stay enabled, with disabled backups treated as the expected outcome. Re-enabling backup work requires Joe’s instruction.

The [October 16 scheduled curation journal](../journal/2026-10-16-first-scheduled-curation.md) records the first publisher heartbeat after setup: a bounded 12-candidate review, one source-checked React 19.3 note and knowledge-index wording correction. Partial source use keeps its candidate pending. Collection and publication timestamps/triggers distinguish scheduled activity from prior manual setup. Backups remain disabled; healthy link sampling is partial coverage and does not erase earlier failures.

## Warning retries and initial Tailwind guidance

The [issue 12 repair](https://github.com/JFusco/brain/issues/12) separates failed-link backoff from daily healthy sampling. Due failures take priority within their source bucket, and `--retry-failures` limits a run to due warnings. The checker archives selected prior observations privately before replacement. Healthy links and 404/410 observations remain daily, preserving the separate-day evidence required to confirm a 404.

A bounded recheck of all 25 outstanding warnings recovered 24 destinations; Sitecore remained HTTP 403 for automated requests while the official page was accessible through a separate documentation retrieval path. No dead-link rewrite was warranted. Current sampled coverage is 72 of 5,753 links; the retained restriction is not proof of a dead destination.

Tailwind's catalog contains 197 links. Reviewing six of 34 pending tagged candidates produced one scoped Tailwind 4 token note. Official theme mechanics are grounded in a pinned Git-blob-verified page; responsibility-based folder names remain an optional observed convention. Its partially used candidate remains pending. The completed one-time overnight verification was paused, with daily maintenance active and backups disabled. See [the warning and Tailwind journal](../journal/2026-10-16-link-warning-tailwind.md).

## Sitecore retrieval correction

The [issue 14 follow-up](https://github.com/JFusco/brain/issues/14) identified the earlier Sitecore access classification as a request-format failure. HEAD receives 403, while GET with an explicit documentation-compatible Accept header receives 200. The probe now sends that header and permits one GET fallback after HEAD 403/405/501; its final method and original HEAD status remain recorded. Genuine GET failures stay visible, and host/redirect, timeout, concurrency and sampling boundaries remain unchanged. The existing `website-pointers` bucket can be selected for bounded checks.

The verified SitecoreAI canonical page and Sitecore Experience Manager 10.4 `index-en.html` replace directory URLs and obsolete restriction text. A correctly formed request exposed a real 404 at the old 10.4 directory. Exact registry proposal digest: `10eb8492bef0890241ec633088b13f7300561cf3fb454c58849b58550d7804a7`; source identities and version scope are unchanged. Earlier observations remain historical evidence rather than current link guidance.

Focused HTML lookup prefers an explicit `main-content` landmark, excludes empty formatting lines and uses a new excerpt-cache key to avoid reusing assistant-footer extracts. Successful live retrieval of both official pages returned article text and stored no full bodies. The five-pointer check also retained the known Contentful rate limit as distinct evidence. See [the Sitecore retrieval journal](../journal/2026-10-16-sitecore-retrieval.md).

## Tailwind application review follow-up

[Issue 19](https://github.com/JFusco/brain/issues/19) complements the token-organization note with five proposed review practices for Tailwind 4 application/Storybook parity. A bounded one-candidate review verified the supporting source-detection, theme-variable, upgrade, responsive and interaction mechanisms against official pages. Review suggestions are not framework acceptance requirements or evidence that any consuming project passed. Fully reviewed evidence is accepted only after the exact exported bytes are verified in merged main.

The maintenance follow-up treats PRs 13 and 15 as completed deliveries and preserves the dirty checkout. No integration implementation, adapters or enrollment are part of this work; further integration design and project adoption are deferred. See [the follow-up journal](../journal/2026-10-16-tailwind-application-review.md).

## October 17 source-claim revalidation

The [October 17 journal](../journal/2026-10-17-source-refresh-guidance.md) records the five-source collector refresh and two stale-note corrections. Revalidation checks the actual claim text and current matcher before changing provenance or review dates. In this pass, it corrected an obsolete combined-workspace statement and narrowed Sitecore template and vendor-preference applicability. Four pinned entry points supplied bounded evidence; Sitecore raw/archived representations agree only after newline normalization, which is not exact-byte parity. Six new candidates were deferred rather than promoted on incidental tags or historical reports.

Refreshed Contentful license observations remain in manifest/change evidence without a manual gate. Backups remain disabled. The publisher's twelve-link sample had no new failures while the known Contentful rate-limit record remained explicit; neither establishes whole-catalog health. [Issue 22](https://github.com/JFusco/brain/issues/22) and its PR contain exact digest, actual checks and rollback.

## Project cleanup and selective collection

The [October 17 project cleanup](../journal/2026-10-17-project-cleanup.md) narrows automatic collection to topic notes and authored skill sources, excludes raw memory roots and implementation journals, and versions collection separately from candidate privacy approvals. Explicit capture and project integrations remain available. The Vercel plugin catalog has one complete hub; React and Next.js use focused links. Current implementation status is separate from preserved incident history.

Local source inspection removed four unused core exports, eight unused imports and redundant directory placeholders. Snapshot copies remain immutable evidence. The initial pass resolved eighteen irrelevant inbox records; a further twelve-candidate review resolved five more and retained seven mixed records. Cumulative rejections are 23, with 3,052 candidates still pending. All candidates were structurally screened, but the remaining inbox is not fully semantically curated. Git delivery is tracked in issue 27 on a branch from refreshed remote main; merge and publication are not implied.

The [cleanup reconciliation](../journal/2026-10-17-cleanup-reconciliation.md) records merged PR 28 and safe primary-checkout reconciliation with the original local state retained in a recovery stash. Final cleanup accounting is 38 rejected, 28 superseded and 3,009 pending from the original 3,075. Supersession requires full duplicate review and a retained replacement; all original bodies and provenance remain. The complete structural screen is separate from full semantic curation, which remains outstanding for retained evidence. Issue 30 updates the delivery record without changing collection policy or publishing new guidance.

## Retained inbox semantic curation

The [manual continuation](../journal/2026-10-17-retained-inbox-curation.md) fully reviews 117 additional candidates in ten bounded batches, rejecting 52 records with no reusable guidance/evidence, superseding one verified duplicate and retaining 64 useful or mixed records at the pre-publication checkpoint. Two officially verified lessons about React hydration and Next.js route parameters use one exact proposal; acceptance follows merged-byte verification. This begins semantic curation rather than completing the retained backlog. The ongoing plan and private coverage/disposition records remain explicit.

## Completed retained semantic audit

The [completion journal](../journal/2026-10-17-semantic-audit-complete.md) closes the manual review of all 2,955 post-publication retained baseline candidates. Final original-cohort accounting is 283 rejected, 65 superseded, one accepted and 2,726 useful or uncertain candidates pending. All 3,075 original bodies are unchanged; all duplicate replacement bodies and subsequent dispositions remain preserved. Earlier partial archives/counts are dated checkpoints, not the current outstanding-review state.

Completed semantic review does not imply publication or verification of every claim. Mixed evidence keeps specific useful portions and unresolved needs privately. Whole-candidate supersession preserves unique failure/version evidence; overlapping fragments remain separate when no complete replacement exists. The two verified React/Next.js lessons were accepted only after PR 34's exact merged bytes were checked.

Prevention combines selective automatic collection, exact capture deduplication, overlap checks and stale-first daily curation within the existing twelve-candidate budget. It reduces recurring noise; it does not promise zero future overlap, universal package compatibility or unattended operation while the local host is unavailable. Project queries use the selected application's dependencies and reviewed knowledge/official references without automatic project enrollment or instruction injection.

## October 18 claim conflict and bounded triage

The [October 18 journal](../journal/2026-10-18-cms-preview-guidance.md) records the two-source collector refresh and CMS-note revalidation. The copied Contentful skill's Preview/Sync claim conflicts with the official API contract. Curated guidance now states the API limitation and correct host/token selection, while preserving the vendor snapshot and distinguishing valid hashes from valid claims. No installed application or SDK was exercised.

Six individually reviewed candidates remain pending with exact-hash private triage records, concrete usefulness/uncertainty reasons and further evidence needed. None was rejected merely because it was historical, formatted as instructions or tagged incidentally. The heartbeat arrived about two minutes early; actual scheduled-agent timing and outcomes remain explicit. Backups remain disabled. [Issue 39](https://github.com/JFusco/brain/issues/39) holds exact digest, bounded link coverage, verification and rollback.

## Contentful documentation access repair

[Issue 41](https://github.com/JFusco/brain/issues/41) replaces a persistently throttled HTML landing-page pointer with two supported official Markdown references: API basics and JavaScript client libraries. Ordinary GET and the unchanged HEAD checker both return 200 for these pages. HTML landing/index routes still return real 429 responses to this client; no provider-wide cause or API-quota diagnosis is inferred. The official docs advertise Markdown as a page representation.

The exact registry proposal digest is `406d2573c1ed028a4db28ccced3494764ce680538c14446e5853e22bf6ebf366`. Existing source registrations, snapshots, license observations and reference-only skill status remain unchanged. The new links are scoped entry points, not a full catalog or installed-SDK compatibility guarantee. Prior failures stay retained; the retired unused URL leaves active coverage through normal registry reconciliation. No checker special case, retry exception, identity change or alert suppression is introduced. See [the access-repair journal](../journal/2026-10-18-contentful-documentation-access.md).

## Investigate recurring official-link warnings

[Issue 43](https://github.com/JFusco/brain/issues/43) extends the existing publisher with a documented investigation step, separate from the CLI checker: at most 12 new/due warning URLs, a private durable disposition/evidence ledger, semantic notification fingerprints, and narrow verified routing fixes in the existing single checked PR. Real access limits remain visible, but unchanged observations do not generate duplicate issues or alerts. No new source/host registration or code change is authorized. See the [runbook](link-warning-investigation.md) and [delivery journal](../journal/2026-10-18-daily-link-investigation.md). Configuration/readback and manual checks do not establish future unattended repair.

## Hosted official maintenance

[Issue 45](https://github.com/JFusco/brain/issues/45) moves official-reference refresh, bounded link investigation/publication and completion-linked verification to trusted GitHub-hosted runners. Private project collection and unpublished curation remain local; no private-state export or backup is part of the migration. See [hosted maintenance](hosted-maintenance.md) for the three-job boundary, optional historical-cache coverage, operational checkpoint retention, local handoff and separate manual/scheduled proof.

## Phase 1 simplification

[Issue 52](https://github.com/JFusco/brain/issues/52) removes upkeep that no longer earned its keep. The private `.state/registry-approval.json` receipt is gone: it made `lookup` fail on fresh clones and after merged registry PRs, while hosted setup rewrote it for whatever was checked out. Git history, PR review and the lock's per-source `policySha256` check now guard the registry. The disabled backup subsystem (module, CLI commands, maintenance hooks and config keys) is removed; existing private archives and keys were not touched, and the earlier backup sections above are historical. The wiki merge and issue reconciliation workflows are removed; the same-delivery rule records history. Other projects now use the [opt-in Brain skill](brain-skill.md). See the [phase 1 journal](../journal/2026-10-18-simplification-phase-1.md).
