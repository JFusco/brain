---
name: testing
description: Use when verifying changes without an automated test suite, or planning how to test this kickstart app.
---

# Testing – kickstart-next-ssr

## When to use

- You need a minimal quality gate before a PR
- You are validating Live Preview or Contentstack connectivity manually
- You want to add automated tests later (planning only—this skill does not add dependencies)

## Instructions

### Current state

- [package.json](../../package.json) has **no** `test` script and no Jest, Vitest, or Playwright dependency.
- There is no `__tests__` directory or `*.test.ts(x)` convention in the repo today.

### Recommended local checks before merge

1. `npm run lint` — catches ESLint issues (`next lint`).
2. `npm run build` — ensures the Next.js production build succeeds (catches many TypeScript and bundling errors).

### Manual / functional checks

- With a seeded stack and valid `.env`, run `npm run dev` and load the home route.
- For Live Preview: enable preview in Contentstack, use the preview URL with query parameters, and confirm content updates and editable regions behave as expected (see [README.md](../../README.md) and [skills/contentstack-kickstart/SKILL.md](../contentstack-kickstart/SKILL.md)).

### Future automation (optional)

If the team adds a runner (e.g. Vitest for units, Playwright for e2e), update this skill with commands, file layout, and CI steps. Do not document tools until they exist in [package.json](../../package.json).
