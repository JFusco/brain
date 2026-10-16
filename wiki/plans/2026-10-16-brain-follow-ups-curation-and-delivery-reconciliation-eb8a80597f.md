---
status: "implemented"
executed: true
evidence: ["knowledge/tailwind/application-storybook-review.md; https://github.com/JFusco/brain/issues/19"]
source_tool: "codex"
source: "User-approved maintenance-only follow-up plan"
topics: ["automatic-knowledge-maintenance"]
digest: "eb8a80597fb382aefa4f009baab6c4d77219aaf0f3f9fa6af1f4f21700ae9859"
---

# Brain follow-ups: curation and delivery reconciliation

## Summary

Finish the remaining Tailwind curation and reconcile Brain's maintenance records with completed deliveries. Project integration, enrollment, automatic project consultation, and capture adapters are deferred. Preserve their existing code, commits, files, and review artifacts without further development or installation.

This replaces the earlier follow-up plan. It incorporates Claude's applicable findings; the formal review cycle remains incomplete because the configured coordinator failed to initialize. No implementation is authorized by this plan update.

## 1. Establish the current maintenance baseline

- Fetch origin without switching or altering the dirty primary checkout. Read saved PR13 (link retries/Tailwind tokens) and PR15 (Sitecore), their merge commits, and the relevant current files on origin/main.
- Treat both deliveries as completed checkpoints. Do not recreate their issues, branches, registry proposals, or PRs. If retrieval fails, report the state as unknown and retain the evidence rather than assuming absence.
- Compare relevant dirty maintenance files with merged main and classify already-delivered bytes versus residual maintenance changes. Leave integration-related files untouched and outside every new diff. Do not reset, stash, discard, automatically transfer residual changes, or clean up worktrees.
- Establish the actual published Tailwind note and hub from merged main. The primary checkout's 'No approved learnings yet' text may be stale and is not evidence that publication failed.

## 2. Resolve the five Tailwind recommendations

- Run the bounded stale-guidance workflow first from the primary Brain checkout, which owns the private inbox/proposal state. Resolve relevant stale claims before relying on affected notes.
- List Tailwind candidates, then read the previously captured five-recommendation candidate in a bounded review. Keep raw bodies and provenance private.
- Compare each recommendation with existing published guidance, especially the token-organization note from PR13. Verify remaining technical claims through focused relevant official Tailwind pages with explicit version context.
- Publish only useful, supported additions. Amend an existing note when the subject overlaps; create a separate note only for a distinct reusable decision. Distinguish documented mechanics, proposed practices, observed outcomes, applicability, and limitations. Do not claim application, build, browser, Storybook, or Figma acceptance.
- If nothing warrants publication, record an unchanged outcome. Unsupported or inaccessible material stays pending; do not invent guidance or accept a partially reviewed candidate.

## 3. Publish and reconcile only necessary maintenance

- Record publication start with the actual trigger and retain its run ID. Use one actionable issue for the resulting Tailwind note and directly related wiki reconciliation; reuse an exact existing issue if discovered.
- Export the exact-content proposal from the primary checkout into a clean isolated issue-linked Brain worktree branched from updated main. Keep acceptCandidates empty unless every part of a selected candidate is fully resolved.
- Run syntax checks only for changed runtime code, existing privacy/content and official-integrity checks, export's staged privacy check using its returned GIT_INDEX_FILE, and whitespace checks. Keep the native privacy hook enabled.
- Add the executed-plan archive and substantive journal/topic updates in the same delivery. Scope discovery with WIKI_HOME="$PWD/.state/wiki-plan-scope"; run plan discovery, graph generation, and wiki integrity.
- Commit intended files with Brain's conventional subject standard, push the issue branch, open the issue-linked PR, and read back its body, file list, and exact head. Automatically merge only the authorized maintenance change after applicable checks pass.
- Fetch origin in the primary checkout and run curation record-merge to verify immutable merged bytes before candidate acceptance. Record completion with the same run ID and merged PR, or an honest failed/unchanged outcome.
- If only a substantive history correction remains, deliver one narrowly scoped wiki maintenance PR without a curation proposal. If neither guidance nor records need changes, create no issue or PR.

## Acceptance and boundaries

- Every remaining Tailwind recommendation has a supported disposition: already covered, published, or still pending with a reason. Partial candidates remain pending.
- Published changes are reachable from the merged Tailwind hub and version-scoped lookup, and immutable exported bytes are verified after merge.
- Final reporting separates existing deliveries, new publication, private candidate disposition, and unchanged/deferred work. Do not equate a stale primary hub with remote state.
- Tests, fixtures, fresh-session checks, CI additions, dedicated QA, implementation review-agent audits, and integration exercises remain deferred. Report only checks actually run.
- No project integration/enrollment, other-repository writes, global skills, memory changes, backup re-enablement, or schedule changes. Preserve private evidence and historical failures.
- Roll back a delivered maintenance change with a scoped revert PR; preserve candidates, proposals, receipts, snapshots, and unrelated edits. Leave the dirty checkout intact.
