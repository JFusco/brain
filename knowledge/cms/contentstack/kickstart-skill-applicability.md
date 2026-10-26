---
title: "Check Contentstack kickstart assumptions before reuse"
domain: "cms/contentstack"
aliases: ["Contentstack kickstart skill", "Next.js SSR starter", "Live Preview skill scope"]
evidence_date: "2026-10-20"
reviewed_at: "2026-10-26"
status: "current"
versions: []
applicability: "Assessing the kickstart-next-ssr skill before use in a Contentstack project; no installed SDK or cross-project compatibility is established"
provenance: "contentstack-kickstart@0c9aca728b7113a6a64a2ccea2b3b448c45529fa; contentstack-docs@4d7e54b65fe30d5c61704a2a22f9b19b91d49c345276593c93c1866ac9d12eb0; official Live Preview guidance read 2026-10-20"
---

# Check Contentstack kickstart assumptions before reuse

## When to use this

Use this before applying the [`contentstack-kickstart` skill](https://github.com/contentstack/kickstart-next-ssr/blob/0c9aca728b7113a6a64a2ccea2b3b448c45529fa/skills/contentstack-kickstart/SKILL.md) to an existing Contentstack application. Its declared scope is **`kickstart-next-ssr`**, not every Contentstack project. It is most directly useful for that starter or a close derivative whose actual structure still matches. Even another Next.js application needs an applicability check.

## What to do

| Decision | What the checked source establishes | How to use it |
| --- | --- | --- |
| Project structure and content model | The skill names `lib/contentstack.ts`, `app/page.tsx`, a React Live Preview component and `lib/types.ts`. The implementation queries content type `page` by `url` and renders its seeded block shapes. | Map these to the target application's real files and schema; do not create the starter's model merely to follow its instructions. |
| Server request isolation | The starter creates a fresh stack, applies `livePreviewQuery`, then passes that same stack to its fetch helper. Official JavaScript Live Preview guidance also warns that mutable preview configuration shared across concurrent server requests can affect other requests. | Reuse the isolation principle where that mutable server-side preview state exists. It is not a requirement to recreate every client or non-preview SDK instance everywhere. |
| Rendering mode | The starter uses App Router request parameters, a client React effect and `ssr: true` with builder mode. Official guidance distinguishes SSR, CSR, static and hybrid routes. | Select preview behavior for the target route's rendering model and actual SDK; copying the starter's settings into a client-rendered or static route is not justified. |
| API and SDK surface | The checked implementation uses `@contentstack/delivery-sdk` and `@contentstack/live-preview-utils`. Contentstack separately documents delivery, management and other SDK families. | Use the relevant official SDK documentation for other frameworks, languages, GraphQL or management work; this starter does not establish those integrations. |
| Configuration | The skill describes the template's `NEXT_PUBLIC_*` names as browser-visible and its optional host overrides. | Treat those names and exposure choices as template conventions. Confirm the target application's public/server configuration boundary and region rather than copying the list as a universal requirement. |

**Observed source mismatch:** at the same pinned commit, the skill lists `@timbenniks/contentstack-endpoints`, while [`lib/contentstack.ts`](https://github.com/contentstack/kickstart-next-ssr/blob/0c9aca728b7113a6a64a2ccea2b3b448c45529fa/lib/contentstack.ts) imports endpoint resolution from `@contentstack/utils` and [`package.json`](https://github.com/contentstack/kickstart-next-ssr/blob/0c9aca728b7113a6a64a2ccea2b3b448c45529fa/package.json) declares that package. Check the actual implementation and dependency manifest before following the skill's dependency list. This is a bounded documentation/code mismatch, not evidence that either package should be installed in another project.

**Documented selection rule:** [Contentstack's Live Preview guide](https://www.contentstack.com/docs/headless-cms/how-live-preview-works-with-sdk) bases `ssr` on how the route renders: server re-rendering uses the SSR path; browser-rendered and static preview paths use the client path. Its integration shape also differs between the TypeScript Delivery SDK (`stack.config`) and JavaScript Delivery SDK (`Stack`). Consult the guide for the target SDK and version rather than substituting one object's shape for the other.

## Evidence and limits

**Source inspection:** the pinned skill, README, stack helper, page, client preview component, content types and package manifest were read without running their instructions. Upstream main matched the pinned revision when checked on October 20, 2026; that is a dated observation, not a future-current guarantee. Request-isolation reasoning was cross-checked against [official JavaScript SDK/Live Preview guidance](https://www.contentstack.com/docs/developers/sdks/content-delivery-sdk/javascript-browser/get-started-with-javascript-delivery-sdk-and-live-preview). Other SDK families are listed in the [official SDK directory](https://www.contentstack.com/docs/developers/sdks).

**Declared ranges only:** the starter manifest declares Next.js `^16.4.1`, React `^19.2.8`, Delivery SDK `^5.6.1`, Live Preview Utils `^4.5.0` and Contentstack Utils `^1.9.1`. No dependency installation or consuming application was inspected. These are not exact installed versions, a compatibility range validated by Brain or a reason to upgrade another project. The live documentation is rolling; the catalog revision records a source observation, not an immutable page revision.

**Proposed practice:** extract a relevant principle, map it to the consuming application's framework/model/SDK, and verify it there before adoption. No connected preview, concurrency behavior or application rendering was exercised in this review. Brain keeps this vendor bundle as a reference and does not install it automatically. For product/source routing, see [Choose CMS guidance by product and integration](../../_unsorted/cms-guidance.md).

**Revalidated October 26, 2026:** The pinned starter helper and manifest were read again alongside the current SDK directory and Live Preview/JavaScript guides. Request-local mutable preview configuration and per-route SSR/CSR/SSG selection remain supported; TypeScript stack.config and JavaScript Stack remain distinct. The older pinned dependency-list mismatch stays explicit. No installed dependency or connected preview was tested.
