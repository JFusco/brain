---
title: "Make TypeScript feature ownership visible in paths"
format: "playbook"
domain: "typescript"
aliases: ["feature folders", "ranked imports", "barrel ownership", "unique basenames"]
evidence_date: "2026-11-02"
reviewed_at: "2026-11-02"
applicability: "Proposed organization for growing TypeScript repositories; preserve the actual Node, bundler and framework resolution contracts"
provenance: "nextjs-index@f1ebcab4745ae07094caa1e621fb88a272b900a93b2907626fb1c0e74c0ce32e; vercel-agent-skills@1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62; Angular style guide, Next.js structure, Claude instructions and pinned Vercel import rule read 2026-11-02; cross-framework policies proposed"
status: "current"
versions: []
---

# Make TypeScript feature ownership visible in paths

## When to use this

Use when prefix-heavy flat directories or large mixed-concept modules make a change hard to locate. This is a proposed navigation policy, not a measured improvement in coding-agent accuracy.

## What to do

1. **Documented scope:** Angular's [style guide](https://angular.dev/style-guide) groups by feature and discourages catch-all names such as `utils.ts`. **Proposed transfer:** group related TypeScript work by domain and name each file for its concept. Split crowded folders deliberately; this is not a universal TypeScript requirement.
2. **Proposed:** define dependency ranks from independent mechanics through contracts/state, domain services and entry points. Permit imports only within the chosen rank policy or toward a dependency; keep vendor areas independent. Record a short reason for every exception. Rank names and enforcement belong to the receiving project, not a standard implied by this note.
3. **Proposed:** import local symbols from their owning file when it clarifies dependency boundaries. A blanket claim that every re-export loads everything is wrong: type-only imports, bundling and package exports matter. The [pinned Vercel rule](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/react-best-practices/rules/bundle-barrel-imports.md) addresses React package-barrel costs, recommends supported Next.js import optimization, and warns that deep paths may lack types. Do not bypass package exports or lose type safety merely to avoid a barrel.
4. **Proposed:** use descriptive, distinguishable basenames where people or a selected code-map tool show only basenames. Exempt framework convention files such as `page.tsx` and `route.ts`; full paths remain authoritative. Check the actual mapper before imposing repository-wide uniqueness. No general Graphify behavior is established here.
5. **Documented scope:** Next.js [project organization](https://nextjs.org/docs/app/getting-started/project-structure) permits both colocation and keeping shared code outside `app`. **Proposed:** choose and document one layout, such as routing in `app` with feature components elsewhere, without presenting it as Next.js's only valid layout.
6. **Proposed:** keep agent instructions focused on decisions code cannot reveal: dependency policy, exceptions, path traps and verification commands. [Claude's instructions guidance](https://code.claude.com/docs/en/memory) recommends concise files; loaders and precedence vary by product. Reuse [the existing portability guidance](../tooling/share-agent-guidance.md) instead of copying a sibling repository's instructions automatically.

## Evidence and limits

No refactor, mapper trial or agent-speed evaluation ran during curation. Incidental Node, TypeScript, Next.js and Graphify versions from the capture do not define this generic policy's compatibility. Monorepo boundaries, path aliases, native type stripping and build/test resolution need separate decisions. For moves, use the [rename review procedure](../tooling/rename-preserving-file-moves.md); do not change resolution and organization invisibly in one step.
