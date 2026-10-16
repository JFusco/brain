---
title: "Automatic knowledge maintenance"
aliases: ["curation", "reference refresh", "Brain audit"]
---

# Automatic knowledge maintenance

Brain collects private candidate evidence, keeps immutable official references, and publishes useful guidance through documented, issue-linked PRs. Joe authorized automatic maintenance merges without a human review or separate digest approval. The daily local agent is restricted to documentation and reference artifacts; code, policies, source registrations, other repositories, installed project skills, and memories are outside that recurring scope.

## Curation and publication

A private proposal binds exact replacement text, destination hashes, candidate hashes, privacy policy, and the explicit subset of candidates ready for acceptance. `curation export` writes the proposal, exact-content records, and curated links into a clean issue-linked worktree of this same repository. Partial source candidates remain pending. The CLI performs no Git commits, pushes, PR creation, or merges.

The authorized agent documents practical effect, applicability, sanitized evidence, source revisions, limitations, actual verification, digest, and rollback in the issue and PR. After passing runtime and wiki checks and verifying the saved PR/head, it merges the scoped maintenance PR. `curation record-merge` verifies repository/base/digest, fetched main ancestry, and immutable exported file hashes before accepting the selected candidates.

## Freshness and source coverage

The existing 02:30 local LaunchAgent performs collection and due official refresh. Official references are due after 20 hours. Changed license material is recorded automatically rather than awaiting manual approval. Content, origin, hashes, size limits, privacy screening, and last-good preservation still apply. A separate 03:15 local agent can publish at most one documentation PR and review at most 12 candidates per run.

Joe subsequently chose catalog-first discovery rather than full-page mirroring. Vercel and Contentstack catalogs use official sitemap metadata, React and Tailwind use pinned repository trees, and Optimizely CMS SaaS and Graph catalogs select links from the official index. Tailwind's rights are recorded accurately rather than labeled open source. Existing snapshots remain historical references. Contentful rate limiting and Sitecore website access restrictions are explicit coverage limitations.

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
