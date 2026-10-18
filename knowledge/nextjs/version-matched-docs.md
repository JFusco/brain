---
title: "Read bundled Next.js docs for the installed release"
domain: "nextjs"
aliases: ["installed nextjs docs", "framework documentation"]
evidence_date: "2026-10-15"
reviewed_at: "2026-10-16"
status: "current"
versions: ["next@>=16.2"]
applicability: "Next.js 16.2 and later; resolve documentation from the application workspace"
provenance: "Previously accepted candidates 69e67b6c9fcf7409631e2488 and ab5ee1b1919ac148038acd67; nextjs-index@4ba86c99073ca6b65f04f5a283dcebb76deffd8a3e2fefe031ba5dd1ad8e6556; official agent guide fetched 2026-10-16, response SHA256 b0586577009083e7ad24bdbb9e6c7570c6a05b9af92be43dd220ac315bda7b22"
---

# Read bundled Next.js docs for the installed release

## When to use this

For applications on Next.js 16.2 or later, read the documentation included with the installed package before changing caching, routing, or server APIs. It lives under `node_modules/next/dist/docs/`.

## What to do

Resolve Next.js from the application workspace, which can differ from the repository root. Use Brain on demand with `lookup --project <root> --workspace <app> --domain nextjs --query <terms>`. Installed documentation is preferred when present; rolling website results remain explicitly unconfirmed for the target version.

Preserve existing framework-managed instruction blocks. This guidance does not install Brain instructions, run a development server, or upgrade dependencies. If the package or its documentation is absent, establish the intended release before using official website guidance.

## Evidence and limits

The [official agent guide](https://nextjs.org/docs/app/guides/ai-agents) was rechecked on 2026-10-16; the [llms.txt index](https://nextjs.org/docs/llms.txt) supplies discovery metadata. The guide confirms bundled docs from 16.2; automatic framework-managed instructions are a separate feature available from 16.3. This note's constraint covers bundled documentation, not compatibility of every framework API. A changed catalog hash alone was not treated as revalidation.
