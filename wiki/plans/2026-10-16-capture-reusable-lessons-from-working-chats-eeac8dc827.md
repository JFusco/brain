---
status: "implemented"
executed: true
evidence: ["scripts/lib/integration.mjs; scripts/integration/submit.mjs; scripts/integration/instructions.md; README.md"]
source_tool: "codex"
source: "user-approved Brain lesson-capture plan"
topics: ["automatic-knowledge-maintenance"]
digest: "eeac8dc827345213691a382d4dd57a5f8900af3e4294d4a6fb10d407056a13b9"
---

# Capture reusable lessons from working chats

## Summary

Build a project-scoped integration that instructs Codex, Claude, and Cursor to capture useful lessons automatically at meaningful task checkpoints. Lessons enter Brain's private inbox; the existing daily curator checks and publishes them.

This delivery builds the integration in Brain. It does not enroll other projects, install global instructions, or read chat histories.

## Agent behavior

- At the end of substantive planning, investigation, or implementation, identify reusable findings worth capturing. Skip routine progress reports, incidental observations, and repeated advice.
- Capture concise summaries containing applicability, relevant versions, supporting references, and evidence limits.
- Clearly distinguish documented facts, observed project results, and proposed practices. Documentation-based advice such as the five Tailwind checks is eligible.
- Submit at most three focused lessons per checkpoint. Capture nothing when there is no useful new material.
- Retry queued submissions at subsequent checkpoints. Report meaningful capture failures without preventing completion of the project task.
- Say saved to Brain's inbox only after receiving a successful capture receipt. Publication remains a separate outcome.
- Treat this as agent-directed behavior, not guaranteed execution after every message or interrupted session. Do not introduce transcript readers, shutdown hooks, or background agents.

## Integration and capture interfaces

Add integration status, install, remove, and recover to Brain's CLI, selecting a project with --project. Installation and removal preview their exact changes by default; --yes applies the requested operation.

Support Git repositories without requiring package.json. Enrollment covers the selected repository; application workspace/version context belongs to individual lessons. Install shared instructions and a submission helper under .agents/brain-capture/. Add small managed references for Codex and Claude in project instruction files, plus a project-local Cursor rule. Verify supported adapter syntax during implementation. Keep installation separate from the existing vendor-skill installer. Preserve unrelated content; refuse conflicting paths, symlinks, or modified managed content. Repeated installation is idempotent. Track ownership and use a private transaction journal for interrupted installation/removal recovery. Removal preserves queued lessons and deletes only unchanged owned integration content.

Extend capture --stdin with optional --domain, validated against configured domains. Preserve existing behavior when omitted. The installed helper provides submit --domain and flush, taking lesson text through stdin rather than shell interpolation.

Keep machine-specific Brain location, queued lessons, and receipts under ignored .brain-capture/ storage. Installation previews and manages the necessary ignore entry. Reuse the existing candidate size bound. Store private files with restrictive permissions; never log lesson bodies. Persist each submitted lesson before attempting delivery. Forward its exact bytes through Brain's existing scanner, lock, and capture workflow.

Retry at most three queued items per checkpoint. Preserve unsuccessful submissions; remove an item only after a verified successful or duplicate receipt. Treat quarantined submissions as retained for restricted handling, never as published guidance or a reason to retry automatically. Offline queue contents are agent-sanitized but not yet verified by Brain's scanner; mark that distinction explicitly and apply full privacy checks before inbox acceptance. Preserve exact-content duplicate detection; semantic overlap remains the curator's responsibility.

## Curation and documentation

Feed successful submissions into the existing inbox and publication process; add no separate approval queue or publication job. Document enrollment, triggers, evidence labels, pending versus published status, retries, removal, and the interruption limitation. Add wiki decision/journal updates and archive the executed plan. Leave existing pending candidates, published notes, backup settings, and schedules unchanged.

## Verification and rollout

Honor Brain's v1 deferral: add no tests, fixtures, fresh-session checks, dedicated QA, or review-agent audits.

Run syntax checks, existing runtime privacy/content checks, official integrity checks, and required scoped wiki discovery, graph build, and integrity commands. Inspect adapter generation and confirm implementation enrolls no external project. Runtime protections must suppress exact duplicates, preserve unavailable deliveries, restrict quarantine, preserve conflicting local edits, and retain queued lessons on removal.

Report actual checks separately from unperformed live agent acceptance. Deliver local implementation only; Git delivery and named pilot enrollment require a subsequent explicit request.
