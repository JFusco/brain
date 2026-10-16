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

## Audit findings and practical limits

- Whole-candidate acceptance was replaced by an explicit acceptance subset; citation alone no longer implies the rest was curated.
- Nested upstream skill copies produced repeated identities. Cataloging now limits entry points to the source's mapped skill root and retains nested material as references.
- Three authority links pointed outside the Git repository, and a Next.js link pointed to an ignored large snapshot. Authority URLs now identify their repositories; cached references use clearly labeled upstream links and local restoration instructions.
- The prior privacy hook used `exec`, preventing appended wiki lifecycle work. The blocking guard now returns before the advisory wiki block.
- A canonical wiki audit heuristic contained a project identifier covered by Brain privacy rules. That single heuristic was generalized locally; this is an intentional privacy adaptation, not an unmodified canonical asset. Future kit reconciliation must preserve that adaptation.
- Wiki discovery is scoped through `WIKI_HOME` to avoid excluded home session stores.
- The skill matcher still combines workspace dependencies and checks some required paths at the project root. Its suggestions require target-workspace confirmation; they are not a complete compatibility proof.
- Keyword tagging can classify incidental mentions as domain evidence. Curation must assess the actual subject rather than accepting tags as relevance proof.
- Runtime checks establish structure, privacy, integrity, and exact publication bytes. They do not prove every technical claim or the usefulness of every harvested excerpt.

The audit covered maintained core runtime modules, CLI/setup, public configuration, source registry/catalog logic, schedule, hook integration, and wiki navigation code. Snapshot hashes and runtime content were checked separately. Inbox inspection was a bounded cross-domain sample, not a semantic audit of every candidate or all upstream documentation. Tests, fixtures, fresh-session tests, dedicated QA, and review-agent audits remain deferred; the explicitly requested wiki workflows are installed.

See [the delivery journal](../journal/2026-10-15-automatic-knowledge-maintenance.md) and [JFusco/brain issue 1](https://github.com/JFusco/brain/issues/1).
