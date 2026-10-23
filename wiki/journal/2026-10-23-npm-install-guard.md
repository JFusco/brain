---
title: "Declare npm for Brain installation"
date: "2026-10-23"
topics: [automatic-knowledge-maintenance]
plans: [2026-10-23-enforce-npm-for-brain-installs-09aa53d413.md]
---

# Declare npm for Brain installation

[Issue 135](https://github.com/JFusco/brain/issues/135) adds `packageManager: npm@11.9.0` to both package manifests and matching npm-only installation instructions in README and AGENTS. Brain already tracks npm lockfiles. A prior accidental pnpm install generated competing lockfiles and symlinked root dependencies, blocking maintenance's existing protections.

The installed pnpm 11.22.0 refused offline installs with scripts disabled in both real package directories, reporting that the project is configured to use npm. No pnpm lockfiles were generated. Root and viewer `npm ci --ignore-scripts` completed successfully without changing either tracked npm lockfile. This checks the installed manager's ordinary behavior; explicit overrides or other manager versions are not proven. The declaration is not a security boundary.

No automatic file deletion, new ignore rule or relaxed nightly guard is introduced. Dependency pins, schedules, workflows and installed skills are unchanged. The [executed plan](../plans/2026-10-23-enforce-npm-for-brain-installs-09aa53d413.md) records the scope; [maintenance decisions](../topics/automatic-knowledge-maintenance.md) records the prevention boundary. Delivery stops at the verified PR because package metadata changes require merge authorization.
