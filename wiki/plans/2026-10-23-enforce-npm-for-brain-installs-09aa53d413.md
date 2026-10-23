---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/brain/issues/135; package.json; web/brain/package.json"]
source_tool: "repository"
source: "Private executed package-manager plan retained locally"
topics: ["automatic-knowledge-maintenance"]
digest: "09aa53d413b9accbac287e2f87ae96fef00255f05841fc3950a3089a629a2c15"
---

# Enforce npm for Brain installs

Declare npm in root and viewer package manifests. Add matching npm-only installation instructions to README and AGENTS. Verify ordinary installed pnpm refuses both package directories even with scripts disabled and generates no competing lockfile. Verify npm installs and existing runtime/wiki checks without weakening clean-head or managed-path guards. No dependency pins, schedules, workflows, installed skills or other repositories change.
