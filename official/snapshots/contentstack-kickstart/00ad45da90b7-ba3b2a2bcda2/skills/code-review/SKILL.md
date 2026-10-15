---
name: code-review
description: Use when preparing or reviewing a pull request for kickstart-next-ssr.
---

# Code review – kickstart-next-ssr

## When to use

- Authoring a PR that touches this kickstart
- Reviewing someone else’s changes for correctness and sample-app quality

## Instructions

### Scope

- This is a small reference codebase ([app/](../../app/), [lib/](../../lib/), [components/](../../components/)). Prefer focused PRs over broad refactors unless modernization is the goal.

### Checklist

- **Secrets:** No API keys, tokens, or `.env` files committed; README/env names stay accurate if variables change.
- **Contentstack / SSR:** Server paths that use Live Preview call `getStack()` per request and pass the configured stack into `getPage` when using `livePreviewQuery`—see [lib/contentstack.ts](../../lib/contentstack.ts).
- **Types:** New content fields reflected in [lib/types.ts](../../lib/types.ts) or justified as unknown until the seed is updated.
- **Next / images:** If adding image domains or hostname envs, update [next.config.mjs](../../next.config.mjs) `images.remotePatterns` appropriately.
- **UX / a11y:** Heading hierarchy, alt text for images, and meaningful labels if UI changes.
- **Docs:** User-facing setup steps in [README.md](../../README.md) updated when behavior or env vars change.

### Severity hints (optional)

- **Blocker:** Broken build, security leak, broken Live Preview for the documented flow.
- **Major:** Incorrect stack sharing on server routes, wrong env contract, missing README updates for new requirements.
- **Minor:** Style nits, copy tweaks, non-critical type looseness.
