---
title: "Await dynamic parameters in Next.js route handlers"
domain: "nextjs"
aliases: ["async params", "route context", "dynamic route handlers"]
evidence_date: "2026-10-17"
reviewed_at: "2026-10-17"
status: "current"
versions: ["next@16"]
applicability: "Next.js 16 App Router dynamic route handlers; confirmed against the 16.0.0 reference and current official docs, with installed-release verification still required"
provenance: "Fully reviewed candidate 77ecee6e04f5e18fb6f30050; vercel/next.js v16.0.0@950609f96f694c5475d18cd2d72a0052ca04d4b9; docs route.mdx SHA256 c4c6dd9f59a4c6fb8dad79514a4b6b55ac54e2ad08f5a931a86585c527a2da01; Git blob verified 2026-10-17; nextjs-index@4ba86c99073ca6b65f04f5a283dcebb76deffd8a3e2fefe031ba5dd1ad8e6556"
---

# Await dynamic parameters in Next.js route handlers

## When to use this

Use this when implementing or migrating a dynamic App Router handler in Next.js 16. Start with [the installed release's documentation](version-matched-docs.md).

## What to do

Type the handler context's params member as a Promise of the route's parameter object. Make the handler async, await that member, then read or destructure its resolved properties. Awaiting is needed before spreading, enumerating or forwarding those parameter values too.

Keep URL query parameters separate: request.nextUrl.searchParams is a different API from dynamic segment context. Correct parameter access does not establish authorization or resource existence.

## Evidence and limits

A fully reviewed historical record reports fixing synchronous parameter access in six Next.js 16 handlers. Its application walkthrough was not repeated. The [official route reference](https://nextjs.org/docs/app/api-reference/file-conventions/route#context-optional) and [async API migration guide](https://nextjs.org/docs/messages/sync-dynamic-apis) confirm the Promise contract. The exact [16.0.0 source](https://github.com/vercel/next.js/blob/950609f96f694c5475d18cd2d72a0052ca04d4b9/docs/01-app/03-api-reference/03-file-conventions/route.mdx) was independently Git-blob verified. This note covers App Router route handlers, not Pages Router API routes or every asynchronous request API. It is not a compatibility certification for every Next.js 16 patch.
