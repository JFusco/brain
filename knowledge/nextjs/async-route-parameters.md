---
title: "Await dynamic parameters in Next.js route handlers"
domain: "nextjs"
aliases: ["async params", "route context", "dynamic route handlers"]
evidence_date: "2026-10-17"
reviewed_at: "2026-11-06"
status: "current"
versions: ["next@16"]
applicability: "Next.js 16 App Router dynamic route handlers; confirmed against the 16.0.0 reference and current official docs, with installed-release verification still required"
provenance: "vercel/next.js v16.0.0@950609f96f694c5475d18cd2d72a0052ca04d4b9; docs route.mdx SHA256 c4c6dd9f59a4c6fb8dad79514a4b6b55ac54e2ad08f5a931a86585c527a2da01; Git blob verified 2026-10-17; nextjs-index@41ead42cac3a04c79525ecdf1b47217d208f1f75f99d2caad02f331a3b7ca45f; official route and async migration references re-read 2026-11-06"
---

# Await dynamic parameters in Next.js route handlers

## When to use this

Use this when implementing or migrating a dynamic App Router handler in Next.js 16. Start with [the installed release's documentation](version-matched-docs.md).

## What to do

Type the handler context's params member as a Promise of the route's parameter object. Make the handler async, await that member, then read or destructure its resolved properties. Awaiting is needed before spreading, enumerating or forwarding those parameter values too.

Keep URL query parameters separate: request.nextUrl.searchParams is a different API from dynamic segment context. Correct parameter access does not establish authorization or resource existence.

## Evidence and limits

A historical record reports migrating synchronous parameter access; that outcome and application walkthrough were not independently reproduced during this review. The [official route reference](https://nextjs.org/docs/app/api-reference/file-conventions/route#context-optional) and [async API migration guide](https://nextjs.org/docs/messages/sync-dynamic-apis) confirm the Promise contract. The exact [16.0.0 source](https://github.com/vercel/next.js/blob/950609f96f694c5475d18cd2d72a0052ca04d4b9/docs/01-app/03-api-reference/03-file-conventions/route.mdx) was independently Git-blob verified in the earlier review. This note covers App Router route handlers, not Pages Router API routes or every asynchronous request API. It is not a compatibility certification for every Next.js 16 patch.

**Revalidated October 23, 2026:** The current route reference and asynchronous API migration guide were read again. Dynamic route-context params remain a Promise and must be awaited before property access/enumeration; URL search parameters remain a separate API. The historical 16.0.0 source evidence is retained, not newly described as runtime acceptance.

**Revalidated November 6, 2026:** The route reference still awaits context params and separately demonstrates synchronous `request.nextUrl.searchParams.get(...)`. The migration guide includes spreading and enumeration among accesses that need unwrapping. A `RouteContext<'/users/[id]'>` helper is also documented after type generation; use it only where the installed release supports it. Neither correct typing nor awaiting a route value proves authorization or application behavior.
