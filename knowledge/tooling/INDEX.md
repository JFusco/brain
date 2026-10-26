---
title: "Tooling"
aliases: ["tooling", "agents", "agent tooling", "MCP", "Node.js"]
---

# Tooling

Route build configuration, test runners, component workshops, linting, package management, monorepo orchestration, Node.js 24 runtime APIs, Agent Skills format and authoring, MCP protocol, and reference-only browser-agent and DevTools skills here. Official catalogs are listed below; repository references pin the commit observed at sync, while documentation follows each source's rolling or fixed major/protocol boundary. Confirm the project's installed tool versions and negotiated protocol before applying guidance. Apply framework specifics through the related domains.

## Related domains

- [Frontend](../frontend/INDEX.md)
- [TypeScript](../typescript/INDEX.md)
- [React](../react/INDEX.md)
- [Next.js](../nextjs/INDEX.md)

## Curated learnings

<!-- brain:curated:start -->
No curated notes yet.
<!-- brain:curated:end -->

<!-- brain:official:start -->
## Official sources

- **vite-docs** — link catalog of 38 pages; rolling-url; revision `3775d0f7cb461ad88a27fa13ae51dbc82d130d09febbe7e9796894b5ce1152ef`; fetched 2026-10-24.
  - [Catalog source](https://vite.dev/sitemap.xml); search it with `lookup --domain tooling`.
- **vitest-docs** — link catalog of 213 pages; rolling-url; revision `9fc16ed9694188c784244565756b0eb6ecb3f6bbd111f2cb97479f821cc88adb`; fetched 2026-10-24.
  - [Catalog source](https://vitest.dev/llms.txt); search it with `lookup --domain tooling`.
- **storybook-docs** — link catalog of 160 pages; rolling-url; revision `1edcef5c976598a8ddfd5f008a2781b02ceaf2299922ccc1d6a9347db5e5644a`; fetched 2026-10-24.
  - [Catalog source](https://storybook.js.org/docs/sitemap.xml); search it with `lookup --domain tooling`.
- **testing-library-docs** — link catalog of 113 pages; rolling-url; revision `c447b8fd1df3b40e4eba2467acdea19beffb53e9a3f9d00a1345e327f21887f4`; fetched 2026-10-24.
  - [Catalog source](https://testing-library.com/sitemap.xml); search it with `lookup --domain tooling`.
- **eslint-docs** — link catalog of 370 pages; rolling-url; revision `ed4ed0f3ae1741336db5ac60879be2a97407a7a907e2e2d14d4b2f7e2fffbcec`; fetched 2026-10-24.
  - [Catalog source](https://eslint.org/docs/latest/sitemap.xml); search it with `lookup --domain tooling`.
- **pnpm-docs** — link catalog of 170 pages; rolling-url; revision `f4fc405ab67f5c31b395a2793bf6cb0dec2a0fb5e8a4191b8a15c41ad321e3a7`; fetched 2026-10-24.
  - [Catalog source](https://pnpm.io/sitemap.xml); search it with `lookup --domain tooling`.
- **turborepo-docs** — link catalog of 110 pages; rolling-url; revision `7bf7094d300f5316f20b4933c65f3ee4bcab5c90cfd2e5e396456995d7d36930`; fetched 2026-10-24.
  - [Catalog source](https://turborepo.dev/llms.txt); search it with `lookup --domain tooling`.
- **chrome-devtools-skills** — 7 skills and 8 docs at a pinned commit; default-branch; revision `172656ab38a4ff666f88dc9032fa841834a69495`; fetched 2026-10-26.
  - [a11y-debugging](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/172656ab38a4ff666f88dc9032fa841834a69495/skills/a11y-debugging/SKILL.md) — reference only.
  - [chrome-devtools](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/172656ab38a4ff666f88dc9032fa841834a69495/skills/chrome-devtools/SKILL.md) — reference only.
  - [chrome-devtools-cli](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/172656ab38a4ff666f88dc9032fa841834a69495/skills/chrome-devtools-cli/SKILL.md) — reference only.
  - [cookie-debugging](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/172656ab38a4ff666f88dc9032fa841834a69495/skills/cookie-debugging/SKILL.md) — reference only.
  - [debug-optimize-lcp](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/172656ab38a4ff666f88dc9032fa841834a69495/skills/debug-optimize-lcp/SKILL.md) — reference only.
  - [memory-leak-debugging](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/172656ab38a4ff666f88dc9032fa841834a69495/skills/memory-leak-debugging/SKILL.md) — reference only.
  - [troubleshooting](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/172656ab38a4ff666f88dc9032fa841834a69495/skills/troubleshooting/SKILL.md) — reference only.
- **agent-browser-skills** — 10 skills and 15 docs at a pinned commit; default-branch; revision `edb40f1878864f90e14f6c11e26fdafd3fecc8dc`; fetched 2026-10-26.
  - [agent-browser](https://github.com/vercel-labs/agent-browser/blob/edb40f1878864f90e14f6c11e26fdafd3fecc8dc/skills/agent-browser/SKILL.md) — reference only.
  - [agentcore](https://github.com/vercel-labs/agent-browser/blob/edb40f1878864f90e14f6c11e26fdafd3fecc8dc/skill-data/agentcore/SKILL.md) — reference only.
  - [core](https://github.com/vercel-labs/agent-browser/blob/edb40f1878864f90e14f6c11e26fdafd3fecc8dc/skill-data/core/SKILL.md) — reference only.
  - [derive-client](https://github.com/vercel-labs/agent-browser/blob/edb40f1878864f90e14f6c11e26fdafd3fecc8dc/skill-data/derive-client/SKILL.md) — reference only.
  - [dogfood](https://github.com/vercel-labs/agent-browser/blob/edb40f1878864f90e14f6c11e26fdafd3fecc8dc/skill-data/dogfood/SKILL.md) — reference only.
  - [electron](https://github.com/vercel-labs/agent-browser/blob/edb40f1878864f90e14f6c11e26fdafd3fecc8dc/skill-data/electron/SKILL.md) — reference only.
  - [protected-vercel-deployments](https://github.com/vercel-labs/agent-browser/blob/edb40f1878864f90e14f6c11e26fdafd3fecc8dc/skill-data/protected-vercel-deployments/SKILL.md) — reference only.
  - [slack](https://github.com/vercel-labs/agent-browser/blob/edb40f1878864f90e14f6c11e26fdafd3fecc8dc/skill-data/slack/SKILL.md) — reference only.
  - [vercel-sandbox](https://github.com/vercel-labs/agent-browser/blob/edb40f1878864f90e14f6c11e26fdafd3fecc8dc/skill-data/vercel-sandbox/SKILL.md) — reference only.
  - [webmcp-gen](https://github.com/vercel-labs/agent-browser/blob/edb40f1878864f90e14f6c11e26fdafd3fecc8dc/skill-data/webmcp-gen/SKILL.md) — reference only.
- **agent-skills-docs** — link catalog of 8 pages; rolling-url; revision `c559c83aa7aab907d45f60db66e0656c40ad908ea412d9bb9647b2bda197e798`; fetched 2026-10-25.
  - [Catalog source](https://agentskills.io/llms.txt); search it with `lookup --domain tooling`.
- **mcp-docs** — link catalog of 57 pages; rolling-url; revision `612e3521a849a0831241be1bf6c5dc11d115c20f31add88337b469a8205746cd`; fetched 2026-10-26.
  - [Catalog source](https://modelcontextprotocol.io/llms.txt); search it with `lookup --domain tooling`.
- **nodejs-24-docs** — link catalog of 66 pages; rolling-url; revision `ff36dfdb2741f2c837d57f053c8439266912fb7e2bf91afc9b4a36d23352ec42`; fetched 2026-10-26.
  - [Catalog source](https://nodejs.org/docs/latest-v24.x/api/index.html); search it with `lookup --domain tooling`.
<!-- brain:official:end -->
