---
name: typescript-style
description: Use when editing TypeScript or React files and matching this repo’s compiler and ESLint conventions.
---

# TypeScript style – kickstart-next-ssr

## When to use

- Adding or changing `.ts` / `.tsx` files
- Deciding server vs client components or public env usage
- Aligning with ESLint rules for this project

## Instructions

### Compiler

- [tsconfig.json](../../tsconfig.json) enables `strict`, `noEmit`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`, and the Next.js TypeScript plugin.
- Path alias: `@/*` maps to the repository root (e.g. `@/lib/contentstack`, `@/components/ContentstackLivePreview`).

### React / Next.js boundaries

- Server Components are the default. Use the `"use client"` directive only when you need hooks, browser APIs, or client-only SDK init—see [components/ContentstackLivePreview.tsx](../../components/ContentstackLivePreview.tsx).
- Async server components are used in [app/page.tsx](../../app/page.tsx) (`searchParams` as a Promise per Next.js 16 patterns).

### ESLint

- [.eslintrc.json](../../.eslintrc.json) extends `next/core-web-vitals` and `next/typescript`.
- `@typescript-eslint/no-explicit-any` is **off**; prefer proper types from the SDK or [lib/types.ts](../../lib/types.ts) when practical.

### Env types

- Browser-exposed configuration uses `NEXT_PUBLIC_*` only. Do not assume secret server-only env vars exist unless you add them explicitly and document them.
