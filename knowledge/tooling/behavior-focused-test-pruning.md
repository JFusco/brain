---
title: "Prune tests by the behavior they protect"
format: "playbook"
domain: "tooling"
aliases: ["test redundancy", "change detector tests", "DAMP tests"]
evidence_date: "2026-11-02"
reviewed_at: "2026-11-02"
applicability: "Proposed test-suite audit; applies only within authorized changes and preserves required project gates"
provenance: "Official Google Software Engineering unit-testing chapter and Testing Blog read 2026-11-02; audit and cost-selection rules proposed, no suite changed"
status: "current"
versions: []
---

# Prune tests by the behavior they protect

## When to use this

Use when tests fail on harmless refactors or repeat coverage without a clear regression contract. A test's age, length or implementation detail alone does not justify deletion.

## What to do

**Documented:** Google's [unit-testing chapter](https://abseil.io/resources/swe-book/html/ch12.html) favors tests that survive internal refactors, public behavior/state assertions, and readable examples whose important values remain visible. Its [change-detector article](https://testing.googleblog.com/2015/01/testing-on-toilet-change-detector-tests.html) explains how assertions that merely repeat implementation can obstruct change.

**Proposed audit:**

1. Name the concrete behavior or contract a test protects, the realistic break that should fail it, and the surviving test before removing or merging anything. Keep it when coverage cannot be demonstrated.
2. Prefer a cheaper test only when it exercises the same failure behavior. Unit and integration cases can protect different boundaries despite similar assertions. Keep distinct fault cases even when they reach one throw site; table-drive only genuinely equivalent inputs.
3. Review literal echoes, internal call-order assertions, unstable exact counts and wording/source regex checks for independent value. Derive counts from the tested artifact where appropriate. Preserve source-shape tests when that shape is an intentional integration, privacy or workflow contract; do not delete them by category.
4. Share lifecycle setup and cleanup while keeping behavior-specific inputs and expectations readable. Remove orphaned helpers/fixtures only after confirming no remaining consumer. Retain required quality gates and record what still catches each removed regression.

## Evidence and limits

The audit and cheapest-equivalent-test rules have not been measured for defect escape. No tests were deleted or altered here, and the note authorizes no change to a consuming project's test policy. Coverage percentages or a passing suite alone do not prove redundancy; mutation testing and coverage-tool configuration remain separate scope.
