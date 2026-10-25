---
title: "Register agent-browser skills"
topics: [official-reference-expansion]
---

# Register agent-browser skills

[Issue 239](https://github.com/JFusco/brain/issues/239) adds `agent-browser-skills` to Tooling. Catalog the official agent-browser entry skill, bundled skill-data and README as reference-only guidance. Preserve CLI-version requirements and upstream reference warnings.

The successful local sync produced 10 skills, 15 docs, 0 pages and 12 relative-reference warnings. Catalogs retain links and metadata only; upstream files were validated in memory, never executed. The registration uses the existing fetcher and reference-only policy.

Applicability: Official agent-browser entry skill and bundled skill-data, including core browser automation, exploratory QA and specialized integrations. Match the installed agent-browser CLI version; bundled instructions can change with the CLI. Reference-only: listing does not install skills, execute commands, authorize account access or send messages.

Validation: local source sync, Brain content/official checks, wiki integrity, representative lookup and `pnpm run verify:ci`. The delivery PR records actual command outcomes and hosted checks. No consuming project, browser or server behavior is certified.

Warning scope: eight README links point outside the selected skill bundle (repository configuration, examples, agent instructions and supporting application docs); four dogfood template links are illustrative screenshot placeholders. These warnings remain visible and are not evidence that the upstream targets are broken. All ten skill entry points resolve within the selected bundle.
