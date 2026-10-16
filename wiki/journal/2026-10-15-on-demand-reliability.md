---
title: "Keep Brain guidance useful on demand"
topics: [automatic-knowledge-maintenance]
plans: [2026-10-16-on-demand-knowledge-maintenance-reliability-a09b1f9f08.md]
---

# Keep Brain guidance useful on demand

Joe approved version-aware lookup, stale-guidance maintenance, bounded link health, operational visibility, private recovery and cache retention in [JFusco/brain issue 5](https://github.com/JFusco/brain/issues/5). Automatic project adoption was explicitly excluded to avoid unnecessary agent context.

Lookup and skills now use one selected application workspace rather than combining a monorepo. Explicit versions and narrow note constraints exclude incompatible guidance, while rolling references and unresolved dependency ranges retain unknown compatibility. When present, installed Next.js documentation is preferred. No consuming project or global skill was modified.

Published guidance enters a bounded revalidation queue after source revision drift or review age. Retirement/supersession metadata retains history without recommending obsolete notes. The actual official Next.js agent guide was fetched and the existing note narrowed to bundled docs from 16.2 onward. Its exact-content proposal has digest `de8ea5bb9a4b68ee0ca57896a33f8b9627552021fb4f1c572c3486b7163a514d`; original accepted candidates are not reaccepted. Publication state remains in the linked issue/PR and immutable merge receipt.

Link checks use approved-host headers, bounded redirects, a small rotating batch, and distinct dead/restricted/transient classifications. Maintenance status separates attempted and successful work, publication outcomes, source health, stale notes, sampled coverage, and backup availability. The existing 03:15 local publisher now prioritizes revalidation and records actual outcomes within its existing documentation-only scope. Manual evidence and configuration do not establish unattended execution; an unavailable Mac cannot alert immediately.

Private backup creation compresses/encrypts eligible state with authenticated AES-256-GCM, verifies every file, and supports empty-directory recovery. It excludes the separate key and auth/environment/session/raw-memory files. Local retention and excerpt cleanup remove only unchanged owned files. Drive bookkeeping distinguishes a configured destination, successful upload/metadata readback, and downloaded-byte proof; no off-device availability is claimed until the corresponding operation succeeds. The exact cloud upload remains subject to destination/payload authorization. Keep the recovery key securely off-device, separate from archives.

Actual runtime evidence: content/privacy scanned 1,226 files with no issues/warnings; official integrity and syntax checks passed. Next.js 16.1 excluded the 16.2+ note and 16.2 matched it. Pinned React fetch and cache hit succeeded. A network-enabled batch returned 23 healthy links and one Sitecore HTTP 403 from a 5,753-link pool; an earlier sandbox-blocked batch remains recorded as transient failures. Local encryption and empty-directory restoration verified 6,625 files and 100,433,115 input bytes. Maintenance completed with no operation failures and still reported access/network and pending cloud warnings. Application package resolution was not exercised against another repository. Tests, fixtures, fresh-session checks, dedicated QA and review-agent audits remain deferred.

Rollback: revert the issue-linked implementation and restore the previous automation prompt. Preserve private state, encrypted archives, the separate recovery key, failure records, exact publication receipts, and immutable snapshots. Never restore over an active working directory. See [the maintenance topic](../topics/automatic-knowledge-maintenance.md).
