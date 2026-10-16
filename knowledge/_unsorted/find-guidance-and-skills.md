---
title: "Find applicable best practices and skills"
domain: "_unsorted"
aliases: ["best practices","skill selection","find skills"]
evidence_date: "2026-10-15"
reviewed_at: "2026-10-16"
status: "current"
versions: []
applicability: "Tasks using Brain references; skill installation requires explicit project scope"
provenance: "vercel-plugin@045b17eea6dfe6f9ec4b8c1a49f453d11491684f; sitecore-content-sdk@e51294172719bbc0a2a71245539cf3d3bd872a1e; current Brain registry and skills matcher"
---

# Find applicable best practices and skills

## When to use this

Use this when a task asks for framework, frontend, accessibility, or CMS best practices, or asks which skill fits the work.

## What to do

1. Read the consuming repository's instructions and identify the actual task, target application, product version, and project layout. A dependency somewhere in a monorepo does not prove that every workspace uses it.
2. Consult Brain only when the task needs it. Start at [the knowledge index](../INDEX.md) and relevant domain hubs, or use `lookup --project <root> --workspace <app> --query <terms>` for a few targeted results. Explicit installed versions and note constraints inform ranking; rolling references without version evidence remain unconfirmed. For framework API behavior, prefer version-matched official documentation. For maintained organizational contracts, use the linked authority repository. For observed lessons, check the curated note's applicability and evidence date.
3. Choose the smallest relevant set of references. State what each contributes to this task. Do not load every available skill or treat a matching title as proof of applicability.
4. For package-based projects, run `node scripts/brain.mjs skills suggest --project /absolute/project/path --workspace apps/application` from Brain, omitting `--workspace` for a single application. The matcher uses only that application and rejects an ambiguous monorepo root. Inspect installed versus declared-only evidence, each reason, source revision, and installation status. A suggestion is not a guarantee of every API contract.
5. Read the selected skill's entry point and required references before using it. A reference-only source can inform a decision but is not an installable package. A skill that assumes absent scripts, directories, SDK versions, or supporting files is not ready to use.
6. Explain the concrete change and the evidence that would demonstrate it works. Skill installation is a separate, explicitly scoped operation. Brain reference refreshes never upgrade another project's dependencies.

## Evidence and limits

This procedure reflects the current Brain source registry, skill matcher, and repository instruction boundary. Dependency-based suggestions are candidates, not a full audit of a project or a guarantee of version compatibility. Source changes and elapsed review dates queue revalidation; superseded/retired notes are retained but excluded from ordinary recommendations. Missing references, stale guidance, and conflicts must be reported. Brain must be explicitly made available to a consuming project; this repository does not register a global instruction or change other repositories.

See [CMS source selection](cms-guidance.md), [the curation standard](curation-standard.md), and the existing [Next.js version guidance](../nextjs/version-matched-docs.md).
