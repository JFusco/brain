---
name: framework
description: Use when changing Next.js App Router structure, next.config.mjs, images, PostCSS, or Tailwind in kickstart-next-ssr.
---

# Framework (Next.js) – kickstart-next-ssr

## When to use

- Editing routing, layout, or global styles
- Configuring image optimization or remote image hosts
- Changing Tailwind or PostCSS setup

## Instructions

### App Router

- Application lives under [app/](../../app/).
- [app/layout.tsx](../../app/layout.tsx) is the root layout: sets metadata, imports [app/globals.css](../../app/globals.css), renders `children`, and mounts [components/ContentstackLivePreview.tsx](../../components/ContentstackLivePreview.tsx) so Live Preview initializes on the client after page content.
- [app/page.tsx](../../app/page.tsx) is the default home route (async server component with Live Preview query handling).

### Next configuration

- [next.config.mjs](../../next.config.mjs) exports `images.remotePatterns`:
  - If `NEXT_PUBLIC_CONTENTSTACK_IMAGE_HOSTNAME` is set, that hostname is allowed.
  - Otherwise defaults allow `images.contentstack.io` and `*-images.contentstack.com`.
- Prefer env-driven hostnames when stacks use custom image delivery domains.

### Tailwind CSS v4

- [postcss.config.mjs](../../postcss.config.mjs) registers `@tailwindcss/postcss`.
- [app/globals.css](../../app/globals.css) uses `@import "tailwindcss"` and a `@layer base` block for border and body defaults compatible with v4.
- [package.json](../../package.json) includes `tailwindcss` and `@tailwindcss/postcss`.

### Linting

- `npm run lint` runs `next lint`, aligned with [.eslintrc.json](../../.eslintrc.json) (Next core-web-vitals + TypeScript).
