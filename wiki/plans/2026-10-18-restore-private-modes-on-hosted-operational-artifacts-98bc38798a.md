---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/brain/issues/45; https://github.com/JFusco/brain/actions/runs/39136696915; scripts/hosted/setup.mjs"]
source_tool: "repository"
source: "/Users/joe.fusco/Projects/brain/.state/hosted-maintenance/.state/hosted-artifact-modes-plan.md"
topics: ["hosted-maintenance"]
digest: "98bc38798aa9bb77cac2cdec6ba634fb6c4920e71166d821f9e2c5025c726948"
---

# Restore private modes on hosted operational artifacts

1. Preserve the real failed checkpoint-restoration run and its privacy-guard error.
2. Re-establish owner-only modes on owned fresh-runner state directories/files, rejecting symlinks and keeping the guard enabled.
3. Deliver with runtime/privacy/wiki checks and verify actual hosted restoration twice before local cutover.
