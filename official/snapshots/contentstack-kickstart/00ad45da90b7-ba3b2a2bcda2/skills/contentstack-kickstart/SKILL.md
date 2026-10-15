---
name: contentstack-kickstart
description: Use when changing Contentstack SDK usage, Live Preview, env configuration, or content queries in kickstart-next-ssr.
---

# Contentstack kickstart – kickstart-next-ssr

## When to use

- Editing how the stack is created or how Live Preview is wired
- Adding or changing content types, queries, or types for entries
- Updating environment variable names or documentation

## Instructions

### Entry points in this repo

| File | Role |
| --- | --- |
| [lib/contentstack.ts](../../lib/contentstack.ts) | `getStack()`, `initLivePreview()`, `getPage()` — core SDK and preview behavior |
| [app/page.tsx](../../app/page.tsx) | Server page: reads Live Preview `searchParams`, applies `livePreviewQuery`, fetches page |
| [components/ContentstackLivePreview.tsx](../../components/ContentstackLivePreview.tsx) | Client component: calls `initLivePreview()` when preview is enabled |
| [lib/types.ts](../../lib/types.ts) | TypeScript shapes for `Page` and nested modular blocks (matches seeded content) |
| [app/layout.tsx](../../app/layout.tsx) | Imports [app/globals.css](../../app/globals.css) and mounts `<ContentstackLivePreview />` after `{children}` |

### Request isolation (`getStack`)

- **Always** create a fresh stack per server request when handling delivery or preview on the server. See the comments in [lib/contentstack.ts](../../lib/contentstack.ts): a shared instance can leak Live Preview configuration across concurrent requests.
- `getPage(url, stackInstance?)` accepts an optional stack so the caller can configure Live Preview on the **same** instance before fetching.

### Live Preview (SSR)

1. **URL/query:** Contentstack adds query parameters (e.g. `live_preview`, `content_type_uid`, `entry_uid`, `preview_timestamp`). [app/page.tsx](../../app/page.tsx) reads them from `searchParams`.
2. **Server:** If `live_preview` is present, call `stack.livePreviewQuery({ ... })` on the stack from `getStack()`, then pass that stack into `getPage("/", stack)`.
3. **Client:** [components/ContentstackLivePreview.tsx](../../components/ContentstackLivePreview.tsx) runs `initLivePreview()` inside `useEffect` when `NEXT_PUBLIC_CONTENTSTACK_PREVIEW === "true"`. That uses `ssr: true` and `mode: "builder"` in [lib/contentstack.ts](../../lib/contentstack.ts).

### Content query

- Default page fetch uses content type `page`, field `url` with `QueryOperation.EQUALS`, wired in [lib/contentstack.ts](../../lib/contentstack.ts).
- When preview is enabled, `contentstack.Utils.addEditableTags` is applied to the entry for visual building.

### Environment variables

Documented in [README.md](../../README.md). All are `NEXT_PUBLIC_*` in this template (browser-visible). Typical set:

- `NEXT_PUBLIC_CONTENTSTACK_API_KEY`
- `NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN`
- `NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN`
- `NEXT_PUBLIC_CONTENTSTACK_REGION`
- `NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT`
- `NEXT_PUBLIC_CONTENTSTACK_PREVIEW`

Optional overrides for hosts (used internally at Contentstack) appear in [lib/contentstack.ts](../../lib/contentstack.ts): `NEXT_PUBLIC_CONTENTSTACK_CONTENT_DELIVERY`, `NEXT_PUBLIC_CONTENTSTACK_PREVIEW_HOST`, `NEXT_PUBLIC_CONTENTSTACK_CONTENT_APPLICATION`, `NEXT_PUBLIC_CONTENTSTACK_IMAGE_HOSTNAME` (see [next.config.mjs](../../next.config.mjs) for image host allowlist).

### Dependencies

- `@contentstack/delivery-sdk` — stack and queries
- `@contentstack/live-preview-utils` — `ContentstackLivePreview.init`, types like `IStackSdk`
- `@timbenniks/contentstack-endpoints` — region and endpoint resolution
- `isomorphic-dompurify` — sanitization where used in UI
