---
title: "Verify artwork meaning across responsive frames"
format: "playbook"
domain: "frontend"
aliases: ["embedded image text", "carousel cropping", "image delivery versus readability"]
evidence_date: "2026-11-17"
reviewed_at: "2026-11-17"
applicability: "Responsive CMS artwork containing text, diagrams or important edge detail; Next.js App Router Image documentation observed at 16.4.6, destination framework versions unknown"
provenance: "nextjs-index@6e7e5716b1934edeea31315970a35c88860f39523906f480eecc0ec4f0709976; mdn-web-docs@d961169aa00b5aaf0b620b99e814eac6b1c707bb2956919c4d17cec2094a3be3; official Image and object-fit pages read 2026-11-17; sanitized unexercised review procedure"
status: "current"
versions: []
---

# Verify artwork meaning across responsive frames

## When to use this

Use for heroes, cards and galleries with lettering, labels, diagrams or important edge details inside the image. A correctly delivered asset may still be unreadable after cropping. Apply the broader [evidence-to-claim boundaries](match-evidence-to-claim.md) without treating this procedure as a complete visual or accessibility audit.

## What to do

1. **Proposed:** classify decorative images separately from images carrying essential information. Seek an existing supported variant or permitted composition that preserves meaning. Moving verified source words into native title/description fields is a new mapping to evaluate, not automatically equivalent output.
2. **Documented:** Next.js [Image](https://nextjs.org/docs/app/api-reference/components/image) uses `width` and `height` for intrinsic dimensions and aspect ratio; CSS determines rendered size. `fill` expands into the parent, which must be positioned as documented. Current documentation does not establish the installed destination release.
3. **Documented:** MDN's [object-fit reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit) describes `cover` as filling the box with possible clipping when ratios differ. `contain` preserves the full object's ratio within the box and can leave unused space. Neither mode alone proves that embedded text is readable at the resulting scale.
4. **Proposed:** record the browser's actual viewport, natural image dimensions, rendered frame, fit behavior, loaded state and visible meaningful content at desktop and phone widths. A cropped screenshot does not establish the effective viewport. Asset identity and successful loading are separate from readability acceptance.
5. **Proposed:** preserve a failed observation and use only an approved safe restoration. Investigate supported configuration, variants or another native mapping before declaring a CMS-wide limitation. If the project prohibits authored CSS, do not conceal a failed mapping with styles in rich text. Semantic text remapping or an authorized frontend change each requires its own contextual verification.

## Evidence and limits

The documentation establishes sizing behavior; no CMS or browser pilot was rerun. The historical capture's carousel trial and restoration are not published as reproduced outcomes or a universal carousel defect. No missing-media conclusion or successful alternative is inferred. The proposed checks retain the useful distinction between delivery, fit and readable meaning without asserting a specific remedy. Destination SDK/framework compatibility remains unknown; an incidental CLI runtime is not a frontend version.
