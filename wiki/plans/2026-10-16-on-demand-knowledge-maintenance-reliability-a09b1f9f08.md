---
status: "implemented"
executed: true
evidence: ["JFusco/brain#5; scripts/lib/maintenance.mjs; scripts/lib/backup.mjs; runtime outcomes documented in STATUS.md"]
source_tool: "repository"
source: "/Users/joe.fusco/Projects/brain/.state/on-demand-reliability-plan.md"
topics: ["automatic-knowledge-maintenance"]
digest: "a09b1f9f08f7d89fe817b1a1f6b66c08fa84da78abbd71a0f354b5c720cf8713"
---

# On-demand knowledge maintenance reliability

Scope: implement the five approved Brain maintenance improvements in JFusco/brain issue 5. Leave automatic consuming-project adoption/context injection out.

1. Resolve explicit versions or one selected application workspace for lookup and skill suggestions. Prefer installed Next.js docs when present, reject incompatible notes, and label unknown compatibility.
2. Queue published guidance for claim revalidation after source drift or review age. Retain retired/superseded notes without recommending them. Recheck the existing Next.js advice against its actual official source through exact-content proposal publication.
3. Sample official links under HTTPS/host, redirect, request, and batch bounds. Separate dead, restricted, rate-limited, and transient outcomes; preserve evidence.
4. Expose maintenance attempts/success and publication outcomes, update the existing daily documentation job within its current scope, and document local-host/offline limits.
5. Encrypt eligible private state, verify every archived file, support recovery into an empty directory, retain owned good backups, and bound owned excerpt-cache cleanup. Keep the recovery key separate. Provide explicit cloud upload/readback bookkeeping; an off-device upload requires destination/payload authorization and is tracked separately from code completion.
6. Document actual outcomes and limits in README, STATUS, the durable topic and delivery journal. Run existing runtime/privacy, official-integrity and wiki checks; keep tests, fixtures and review-agent audits deferred.

Implementation evidence: scripts/lib/project-context.mjs, guidance.mjs, link-health.mjs, maintenance.mjs, backup.mjs, cache.mjs and CLI integration. The local encrypted backup recovered 6,625 files with authenticated checksums. Explicit Next.js 16.1 excluded the 16.2+ note, while 16.2 matched. Pinned React excerpt fetch and cache hit succeeded. A 24-link network-enabled sample returned 23 healthy and one restricted response; earlier sandbox failures are retained. Runtime content/privacy and official integrity passed. Delivery and cloud availability are tracked separately in the linked issue and PR; no unattended execution or completed cloud upload is asserted by this implementation plan.
