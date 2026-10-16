---
title: "Automatic curation, official references, and wiki setup"
date: "2026-10-15"
topics: ["automatic-knowledge-maintenance"]
---

# Automatic curation, official references, and wiki setup

Joe requested useful cross-domain learnings, official frontend and CMS documentation coverage, automatic issue-linked PR publication without a manual review gate, broken-link repair, a source audit, and full wiki hooks/workflows. The implementation preserves private collection storage while moving the maintenance record to issues and PRs.

Four initial guidance pages cover finding applicable best practices and skills, CMS source selection, matching UI evidence to claims, and the curation standard. Their two cited authored candidates remain pending because this batch used only part of their material. Exact merge recording is required before candidate acceptance.

Initial runtime content checks passed with 620 scanned files and no issues/warnings. During installation, expanded privacy scanning blocked a canonical wiki heuristic containing a private project identifier; it was generalized before delivery. The initial official refresh changed Vercel plugin, Next.js index, and Next.js full documentation. Contentful encountered a socket error, retained its last-good snapshot, then succeeded on retry without a source change. These outcomes are separate from the additional documentation-source ingestion and hosted workflow results.

The Next.js ignored full-documentation target returned an authenticated GitHub 404. The live Next.js guide was accessible. Sitecore XP returned HTTP 403, and Optimizely's index returned HTTP 200. Access restrictions were not reported as broken-link fixes.

After exploring bulk ingestion, Joe explicitly chose official link catalogs with selective lookup and excerpt caching. A full React snapshot had already been captured and is preserved; other attempted full exports encountered privacy-example findings, rate limits, transient failures, or archive deadlines. Those failed attempts were retained as evidence. The final design catalogs metadata from official indexes/sitemaps/repository trees and does not mirror page bodies by default. Lookup can return links only or fetch focused excerpts on demand.

The six new catalogs contain 4,790 distinct links: Vercel 1,656; Contentstack 2,241; React 225; Tailwind 197; Optimizely CMS SaaS 278; and Graph 193. HTML/Markdown duplicates were normalized for Contentstack. The existing Sitecore migration guide now ranks first for that query. Selective live fetch succeeded for that guide, Vercel deployment protection, and pinned React `useEffect`; the React excerpt cache also returned a hit. Receipts store excerpts and response hashes, not full fetched pages. The superseded React full export and oversized historical metadata are preserved through the established private object-cache/restore path rather than added wholesale to Git.

The canonical wiki toolkit, viewer, advisory hook block, and three workflows were installed. The existing privacy guard remains blocking and now permits the wiki block to execute. Joe added `BOT_TOKEN`; its name was verified without reading or transferring its value. Hosted execution must still be checked on the delivery PR/merge.

A daily 03:15 America/New_York local automation was created after Joe explicitly approved its narrower scope: Brain documentation only, at most 12 candidates and one issue-linked PR per run, automatic merge only after runtime/wiki checks and exact-head verification, no code/policy/registry/other-repository/memory changes. The broader recurring scope was rejected by automatic approval review and was not installed.

Current behavior, findings, and limitations are maintained in [the topic](../topics/automatic-knowledge-maintenance.md). Delivery is tracked by [JFusco/brain issue 1](https://github.com/JFusco/brain/issues/1). No deferred tests or dedicated QA were added or run.
