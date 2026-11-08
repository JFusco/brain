---
title: "Tooling"
aliases: ["tooling", "agents", "agent tooling", "MCP", "Node.js"]
---

# Tooling

Route build configuration, test runners, component workshops, linting, package management, monorepo orchestration, Node.js 24 runtime APIs, Anthropic Claude and OpenAI model selection, skills, references and project rules, Agent Skills format and authoring, MCP protocol, and reference-only browser-agent and DevTools skills here. Official catalogs are listed below; repository references pin the commit observed at sync, while documentation follows each source's rolling or fixed major/protocol boundary. Confirm the project's installed tool versions and negotiated protocol before applying guidance. Apply framework specifics through the related domains.

## Related domains

- [Frontend](../frontend/INDEX.md)
- [TypeScript](../typescript/INDEX.md)
- [React](../react/INDEX.md)
- [Next.js](../nextjs/INDEX.md)

## Curated learnings

<!-- brain:curated:start -->
- [Activate Husky before composing native Git hooks](husky-hook-setup.md)
- [Adapt shared agent guidance to the receiving repository](share-agent-guidance.md)
- [Author Claude skills, references and project rules](claude-skills-and-rules.md)
- [Author OpenAI skills, references and Codex rules](openai-skills-and-rules.md)
- [Check dependency bot PRs against repository gates](bot-pr-contracts.md)
- [Check screenshot resolution before a vision judgment](vision-input-contract.md)
- [Choose Claude models and effort by task](claude-model-selection.md)
- [Choose OpenAI models and reasoning by task](openai-model-selection.md)
- [Choose first-party dependency update automation](first-party-dependency-updates.md)
- [Coordinate agent concurrency with durable ownership](agent-workflow-concurrency.md)
- [Define a structured Opus 5.5 judgment contract](opus-structured-judgment.md)
- [Discover and capture hidden UI states with guards](guarded-ui-state-capture.md)
- [Keep CMS rendering contracts and generator choices distinct](cms-rendering-contract-provenance.md)
- [Keep a Graphify code map scoped and reproducible](graphify-code-map.md)
- [Keep workflow accounting separate from sampled traces](workflow-accounting-evidence.md)
- [Measure prompt-cache reuse across headless stages](claude-prompt-cache-lineage.md)
- [Pin an agent CLI judgment call's settings](agent-cli-invocation-contract.md)
- [Preserve granularity when observing vendor operations](vendor-operation-observability.md)
- [Profile Node test files and replace avoidable waits](node-test-performance.md)
- [Prune tests by the behavior they protect](behavior-focused-test-pruning.md)
- [Separate file moves from refactors and check merges](rename-preserving-file-moves.md)
- [Separate review transport and context capacity failures](review-capacity-recovery.md)
- [Tune CI caches without weakening required gates](ci-cache-and-gate-contracts.md)
- [Verify Storybook browser gates and capture evidence](storybook-browser-gates.md)
<!-- brain:curated:end -->

<!-- brain:official:start -->
## Official sources

- **vite-docs** — link catalog of 38 pages; rolling-url; revision `3775d0f7cb461ad88a27fa13ae51dbc82d130d09febbe7e9796894b5ce1152ef`; fetched 2026-10-24.
  - [Catalog source](https://vite.dev/sitemap.xml); search it with `lookup --domain tooling`.
- **vitest-docs** — link catalog of 215 pages; rolling-url; revision `f5554913ca300523eac30b71ecb8f99bcdf27a6508abf8ca212be9026711ae90`; fetched 2026-11-02.
  - [Catalog source](https://vitest.dev/llms.txt); search it with `lookup --domain tooling`.
- **jest-docs** — link catalog of 37 pages; rolling-url; revision `f7e2a3b22bb68bbb916fb92536740cebe82d9f18759acbe9bfc7a36196ed76cc`; fetched 2026-11-04.
  - [Catalog source](https://jestjs.io/sitemap.xml); search it with `lookup --domain tooling`.
- **storybook-docs** — link catalog of 161 pages; rolling-url; revision `c735625fe57a09cd61ddc13f2b80d4d8f548b9e8bacd52ca415aed3e1fd2ee42`; fetched 2026-10-30.
  - [Catalog source](https://storybook.js.org/docs/sitemap.xml); search it with `lookup --domain tooling`.
- **testing-library-docs** — link catalog of 113 pages; rolling-url; revision `c447b8fd1df3b40e4eba2467acdea19beffb53e9a3f9d00a1345e327f21887f4`; fetched 2026-10-24.
  - [Catalog source](https://testing-library.com/sitemap.xml); search it with `lookup --domain tooling`.
- **eslint-docs** — link catalog of 370 pages; rolling-url; revision `ed4ed0f3ae1741336db5ac60879be2a97407a7a907e2e2d14d4b2f7e2fffbcec`; fetched 2026-10-24.
  - [Catalog source](https://eslint.org/docs/latest/sitemap.xml); search it with `lookup --domain tooling`.
- **pnpm-docs** — link catalog of 175 pages; rolling-url; revision `bdd0d01f5c33a13d315525927fb29cf22e3d50654e21151c059cf942068e38e1`; fetched 2026-11-05.
  - [Catalog source](https://pnpm.io/sitemap.xml); search it with `lookup --domain tooling`.
- **turborepo-docs** — link catalog of 110 pages; rolling-url; revision `7bf7094d300f5316f20b4933c65f3ee4bcab5c90cfd2e5e396456995d7d36930`; fetched 2026-10-24.
  - [Catalog source](https://turborepo.dev/llms.txt); search it with `lookup --domain tooling`.
- **chrome-devtools-skills** — 7 skills and 8 docs at a pinned commit; default-branch; revision `0b37364dc0a88a804c6d73d3335e776adc7f33c4`; fetched 2026-11-06.
  - [a11y-debugging](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/0b37364dc0a88a804c6d73d3335e776adc7f33c4/skills/a11y-debugging/SKILL.md) — reference only.
  - [chrome-devtools](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/0b37364dc0a88a804c6d73d3335e776adc7f33c4/skills/chrome-devtools/SKILL.md) — reference only.
  - [chrome-devtools-cli](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/0b37364dc0a88a804c6d73d3335e776adc7f33c4/skills/chrome-devtools-cli/SKILL.md) — reference only.
  - [cookie-debugging](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/0b37364dc0a88a804c6d73d3335e776adc7f33c4/skills/cookie-debugging/SKILL.md) — reference only.
  - [debug-optimize-lcp](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/0b37364dc0a88a804c6d73d3335e776adc7f33c4/skills/debug-optimize-lcp/SKILL.md) — reference only.
  - [memory-leak-debugging](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/0b37364dc0a88a804c6d73d3335e776adc7f33c4/skills/memory-leak-debugging/SKILL.md) — reference only.
  - [troubleshooting](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/0b37364dc0a88a804c6d73d3335e776adc7f33c4/skills/troubleshooting/SKILL.md) — reference only.
- **agent-browser-skills** — 10 skills and 15 docs at a pinned commit; default-branch; revision `4b0e9f01fa8d214d39bbfe5391257640634fb9a0`; fetched 2026-11-08.
  - [agent-browser](https://github.com/vercel-labs/agent-browser/blob/4b0e9f01fa8d214d39bbfe5391257640634fb9a0/skills/agent-browser/SKILL.md) — reference only.
  - [agentcore](https://github.com/vercel-labs/agent-browser/blob/4b0e9f01fa8d214d39bbfe5391257640634fb9a0/skill-data/agentcore/SKILL.md) — reference only.
  - [core](https://github.com/vercel-labs/agent-browser/blob/4b0e9f01fa8d214d39bbfe5391257640634fb9a0/skill-data/core/SKILL.md) — reference only.
  - [derive-client](https://github.com/vercel-labs/agent-browser/blob/4b0e9f01fa8d214d39bbfe5391257640634fb9a0/skill-data/derive-client/SKILL.md) — reference only.
  - [dogfood](https://github.com/vercel-labs/agent-browser/blob/4b0e9f01fa8d214d39bbfe5391257640634fb9a0/skill-data/dogfood/SKILL.md) — reference only.
  - [electron](https://github.com/vercel-labs/agent-browser/blob/4b0e9f01fa8d214d39bbfe5391257640634fb9a0/skill-data/electron/SKILL.md) — reference only.
  - [protected-vercel-deployments](https://github.com/vercel-labs/agent-browser/blob/4b0e9f01fa8d214d39bbfe5391257640634fb9a0/skill-data/protected-vercel-deployments/SKILL.md) — reference only.
  - [slack](https://github.com/vercel-labs/agent-browser/blob/4b0e9f01fa8d214d39bbfe5391257640634fb9a0/skill-data/slack/SKILL.md) — reference only.
  - [vercel-sandbox](https://github.com/vercel-labs/agent-browser/blob/4b0e9f01fa8d214d39bbfe5391257640634fb9a0/skill-data/vercel-sandbox/SKILL.md) — reference only.
  - [webmcp-gen](https://github.com/vercel-labs/agent-browser/blob/4b0e9f01fa8d214d39bbfe5391257640634fb9a0/skill-data/webmcp-gen/SKILL.md) — reference only.
- **agent-skills-docs** — link catalog of 8 pages; rolling-url; revision `c559c83aa7aab907d45f60db66e0656c40ad908ea412d9bb9647b2bda197e798`; fetched 2026-10-25.
  - [Catalog source](https://agentskills.io/llms.txt); search it with `lookup --domain tooling`.
- **mcp-docs** — link catalog of 57 pages; rolling-url; revision `612e3521a849a0831241be1bf6c5dc11d115c20f31add88337b469a8205746cd`; fetched 2026-10-26.
  - [Catalog source](https://modelcontextprotocol.io/llms.txt); search it with `lookup --domain tooling`.
- **nodejs-24-docs** — link catalog of 66 pages; rolling-url; revision `ff36dfdb2741f2c837d57f053c8439266912fb7e2bf91afc9b4a36d23352ec42`; fetched 2026-10-26.
  - [Catalog source](https://nodejs.org/docs/latest-v24.x/api/index.html); search it with `lookup --domain tooling`.
- **anthropic-agent-docs** — link catalog of 133 pages; rolling-url; revision `d5a6f4f8ba427b778bfb000c15d3f2fc17c46c2aef3ec33f455c36cffac532cd`; fetched 2026-11-06.
  - [Catalog source](https://platform.claude.com/llms.txt); search it with `lookup --domain tooling`.
- **openai-agent-docs** — link catalog of 238 pages; rolling-url; revision `6d99c65124d7390e288d593c53e4348256f5692a2dbb076a8cb6dce7070a8256`; fetched 2026-11-07.
  - [Catalog source](https://developers.openai.com/api/docs/llms.txt); search it with `lookup --domain tooling`.
- [Official website](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) — pointer only: Anthropic skill-building guide: planning, progressive disclosure, references, testing and troubleshooting. PDF is a reference pointer, not a text-fetch catalog entry; current product documentation governs loader and permission details. No PDF body is stored.
<!-- brain:official:end -->
