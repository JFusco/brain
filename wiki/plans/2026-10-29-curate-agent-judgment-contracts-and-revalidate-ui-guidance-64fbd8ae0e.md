---
status: "implemented"
executed: true
evidence: ["JFusco/brain#278; knowledge/tooling/agent-cli-invocation-contract.md; knowledge/tooling/vision-input-contract.md; knowledge/tooling/opus-structured-judgment.md; four source-revalidated React/frontend notes"]
source_tool: "repository"
source: "https://github.com/JFusco/brain/issues/278"
topics: ["automatic-knowledge-maintenance"]
digest: "64fbd8ae0ee06b8442ea844763047b6f29cd2ed58c09f0cb7a78bb1a27996551"
---

# Curate agent judgment contracts and revalidate UI guidance

Scope: Brain issue JFusco/brain#278. Extend the knowledge collection only; do not implement an agent harness or change runtime, registry, dependencies or schedules.

1. Compare the three Tooling lessons with existing model/skill and visual-evidence notes. Read the current official CLI, vision, effort and structured-output pages; keep incompatible or unverified details out of general advice.
2. Write separate invocation, image-input and direct Opus API notes because their contracts and applicability differ. Label proposed procedures and preserve unexercised paths.
3. Revalidate two React lifecycle/hydration notes and two frontend browser/language playbooks through their current official pages. Keep the other stale signals intact.
4. Save private body-hash and claim accounting for each reviewed capture; regenerate curated hubs and record the authored scope and limits in the wiki.

Publication is a separate gated step: commit the scoped diff, obtain a fresh independent content review, prepare/push/verify hosted checks and use the nightly merge. Accept captures only after final verification and successful run completion. This plan does not claim those future steps already succeeded.
