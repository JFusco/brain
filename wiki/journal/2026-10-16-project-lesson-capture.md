---
title: "Project-scoped lesson capture"
date: "2026-10-16"
topics: ["automatic-knowledge-maintenance"]
plans: ["2026-10-16-capture-reusable-lessons-from-working-chats-eeac8dc827.md"]
---

# Project-scoped lesson capture

Useful recommendations left in working chats were not reaching Brain unless an agent explicitly captured them or saved them in an eligible harvested artifact. The approved integration closes that submission gap for explicitly enrolled Git projects, without reading conversation stores or installing global instructions.

## Resulting behavior

`integration install` previews managed project adapters for Codex, Claude, and Cursor. Applying with `--yes` installs shared instructions and a standalone Node helper. Repeating installation updates unchanged owned content; status exposes ownership conflicts and unfinished transactions. Removal preserves unrelated instruction text, private queued lessons and receipts, machine configuration, ownership records, and the ignore rule. Recovery uses a private Brain transaction journal and refuses later local edits or removal of an ignore rule protecting newly collected evidence.

Agents are instructed to capture up to three useful lessons at substantive planning, investigation, and implementation checkpoints, including documentation-based proposals with clear evidence limits. The helper queues exact bytes privately, submits through the existing scanned capture command with an explicit configured domain, and retains uncertain deliveries. Flush processes at most three entries and stops on unavailable Brain. Quarantined receipts prevent automatic retries. Pending capture and curated publication remain distinct; the daily curator and its scope are unchanged.

Root instruction adapters follow the official Codex project discovery, Claude imports, and Cursor always-applied rule formats linked in [the README](../../README.md#capture-lessons-from-working-chats). Nested overrides, context limits, interruption, permissions, and agent compliance remain practical limits. No live agent acceptance is claimed.

## Evidence and validation

Implementation is in [integration management](../../scripts/lib/integration.mjs), [the project helper](../../scripts/integration/submit.mjs), [shared instructions](../../scripts/integration/instructions.md), and the existing CLI/capture modules. Syntax checks and official integrity passed. Runtime privacy/content checks passed with no issues or warnings. Scoped wiki discovery passed and found zero candidate plans. Graph generation and wiki integrity passed. Adapter generation was inspected in source; installation previews against another project and live submit/retry/recovery scenarios were not exercised. These checks establish structure and privacy, not live enrollment, agent compliance, or semantic quality.

No other project was enrolled or modified. No global skill, memory, schedule, backup setting, or published knowledge page was changed. Tests, fixtures, fresh-session checks, dedicated QA, and review-agent audits remain deferred under the v1 procedures. The user subsequently requested the AGENTS Git delivery flow. [Issue 16](https://github.com/JFusco/brain/issues/16) tracks this implementation on its own branch from updated main. Delivery validation and the existing pre-commit privacy guard must pass before commit/push; no project enrollment or deployment is included.

## Rollback

For a future enrolled project, preview `integration remove --project <path>` and apply with `--yes` only in the explicitly authorized project scope. Preserve private pending evidence and its ignore rule. For this local Brain delivery, revert only the intended integration/runtime/documentation/wiki changes; preserve inbox candidates and unrelated work.

See [the executed plan](../plans/2026-10-16-capture-reusable-lessons-from-working-chats-eeac8dc827.md) and [the durable maintenance topic](../topics/automatic-knowledge-maintenance.md).

## Delivery checkpoint

The capture-only changes were transferred into an isolated Brain worktree, preserving unrelated maintenance edits in the primary checkout. Automatic approval review initially rejected the private-runtime transfer. Joe then explicitly authorized copying only scanner pins and client-redaction rules into ignored private files so the unchanged guard could run. Only those fields were prepared, with restrictive permissions; auth/environment/session/raw-memory files, project-root settings, and historical approval-state files were not copied. The identical already-approved public registry was verified independently. A newer maintenance merge was incorporated before delivery, preserving both plan-ledger rows and regenerating wiki artifacts. Missing public snapshot files were restored only after their committed manifest hashes matched. The original rejection and failed integrity observations remain historical evidence, not successful checks.
