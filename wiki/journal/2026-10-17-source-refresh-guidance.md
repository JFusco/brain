---
title: "Refresh registered sources and revalidate CMS guidance"
topics: [automatic-knowledge-maintenance]
plans: [2026-10-17-publish-october-17-references-and-revalidate-guidance-8942e2cf45.md]
issue: 'https://github.com/jfusco/brain/issues/22'
issues: ['https://github.com/jfusco/brain/issues/22']
---

# Refresh registered sources and revalidate CMS guidance

The October 17 collector recorded a scheduled 06:30 UTC attempt and 06:34:48 UTC completion without failures. The publisher heartbeat arrived at 07:15:09 UTC and recorded a separate scheduled-agent run. Bounded due maintenance reported no operation failures, retained current owned excerpts and explicitly skipped automatic backups. All fourteen active refresh sources were already current after collection; the publisher's source command reported no new changes or failures. These records are agent/CLI reports, not independent scheduler attestation.

The collector refreshed five existing references: Sitecore Content SDK, Vercel plugin, Contentful skills, Optimizely SDK and the Vercel documentation catalog. This delivery publishes their snapshots/manifests, source lock/change notes, generated hubs and two cache-path-only ignore additions. Existing snapshots remain historical. Contentful's changed license material is recorded automatically in manifest/change evidence; the other selected license records are unchanged. No registry or policy is modified, no downloaded source is executed, and catalog refresh does not mirror linked pages.

Two published notes became stale after source revision changes. Claim review found a substantive outdated CMS statement about combining sibling dependencies. The current matcher uses one selected application and rejects ambiguous monorepo roots; the note now states that behavior and distinguishes installed versions from declared-only ranges. The Sitecore skill bundle is explicitly scoped to its App Router + Cache Components scaffold. Skill-selection guidance also clarifies that vendor preferences are not permission to replace a project's UI stack or install reference-only/unconfirmed skills.

Pinned claim evidence checked live on October 17:

- sitecore-content-sdk@6ec243fc709bfb917e7ce9be6151e63d0f33c5b6; selected `docs/AGENTS-overview.md`; raw SHA256 `6c22882ff728051d773ca26a73b7ce06ff8360e89f5d132c3ff41b5dbf326198`, archived SHA256 `cdc22544e40fbb977d5820e4f542079818ff4d03d86c724ef27d38e5089770b4`; claim text agrees after CRLF/LF normalization only.
- contentful-skills@27a5172887a9d32c1753e28369c8bd4e3c140d19; selected `skills/contentful-api/SKILL.md`; raw SHA256 `5d2fa635861c1977d3a990fb0d45dae5be46b57b67cb831ed2978cc422ac215c` matches snapshot.
- optimizely-sdk@5ef6268e688b35959d84b901c0bd6e81cb3669ef; selected `docs/README.md`; raw SHA256 `efc422965a79a432736631dc67f6872210f13fa7a47b104217433037f638127b` matches snapshot.
- vercel-plugin@137e9f44a243a939c5eaea30e4dff96aee744f64; selected `skills/react-best-practices/SKILL.md`; raw SHA256 `5c1b1512e76413a9706309569c4c88827ed86b00dff9338849bf64caae7d3921` matches snapshot.

These checks establish entry-point content for source selection, not every upstream rule, SDK API compatibility or a consuming application's behavior. The local matcher source was inspected directly; no other application was adopted, modified or exercised. Generic cross-product source-selection notes intentionally make no whole-page package-version guarantee; consumers must provide exact versions or one application workspace.

Six pending non-quarantined candidates were inspected across Contentstack, Optimizely and Vercel after stale guidance. Incidental tags, historical status and unsupported project-specific observations were deferred; no new lesson was invented and no candidate is accepted. Exact proposal `fe8fe6973049436931133aab`, digest `fe8fe6973049436931133aab846c00423455e7f8000369b49ea20ae8dd477821`, replaces two existing notes with an empty acceptance subset. Exported content must match immutable merged bytes before recording publication.

The publication's bounded live sample checked twelve of 5,782 eligible links with no problems. Earlier collector sampling retained Contentful's known 429 separately; sampled successes do not erase that evidence or establish full coverage. Focused CMS retrieval stores excerpts/receipts only. Automatic backups and Drive uploads remain disabled, and no backup/key operation occurs.

Runtime privacy/content, official integrity, scoped wiki discovery, graph/integrity and exact-index/native guard results plus hosted head verification are recorded in the linked issue/PR. Tests, fixtures, fresh-session checks, dedicated QA and review-agent audits remain deferred. The primary collector changes are preserved through an isolated worktree. Rollback reverts this delivery's documentation/reference artifacts while retaining private proposals, publication receipts, pending candidates, source objects/snapshots and failure evidence. See [the maintenance topic](../topics/automatic-knowledge-maintenance.md).
