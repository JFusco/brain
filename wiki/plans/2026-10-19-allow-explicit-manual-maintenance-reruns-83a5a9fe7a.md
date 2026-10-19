---
status: "implemented"
executed: true
evidence: ["scripts/nightly.mjs; https://github.com/JFusco/brain/issues/81"]
source_tool: "repository"
source: "Private executed plan; source retained locally"
topics: ["automatic-knowledge-maintenance"]
digest: "83a5a9fe7aec2730a84e91578e15654e346b08f8f99110e4e3be206c85b8e981"
---

# Allow explicit manual maintenance reruns

1. Add a manual-only reason flag with separate bounded bookkeeping, preserving scheduled completion and receipts.
2. Keep active-run reconciliation and exact-head publication guards.
3. Document the one daily 5 p.m. schedule and manual command; archive the implementation and run existing checks.
4. Deliver the issue-linked code PR, then execute the explicitly requested real rerun with the pending capture.
