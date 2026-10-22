---
title: "Official reference expansion"
aliases: ["browser references", "official source additions"]
---

# Official reference expansion

Each source is delivered in its own issue-linked registration PR. Catalogs contain links and metadata; upstream page bodies are retrieved selectively, never mirrored or executed. Google Search Central is excluded by Joe's request.

## MDN browser platform

[Issue 119](https://github.com/JFusco/brain/issues/119) registers a bounded English sitemap subset under Frontend: HTML, CSS guides, JavaScript guides, HTTP, Fetch, Intersection Observer and Baseline. The 1,500-page and four-index limits refuse partial catalogs. MDN is publisher-maintained documentation; technical standards and project browser requirements retain their own authority. Baseline availability does not establish accessibility, usability or project acceptance.

Prose license metadata preserves CC-BY-SA-2.5 and identifies separate code-example terms. This does not register the full MDN Web API or CSS reference libraries.

## W3C internationalization

[Issue 120](https://github.com/JFusco/brain/issues/120) adds the official HTML authoring index to Frontend and Semantics. Only approved article, question and tutorial links enter the 250-page catalog. The source uses a single explicitly registered static HTML index; scripts, styles and embedded resources are never executed or fetched. Existing Markdown and sitemap indexes retain their formats. Unsupported formats fail registry validation.

Language declarations, locale-specific formatting and text direction remain separate decisions. W3C articles are guidance with their own historical context, not proof of the target CMS implementation. The unverified International sitemap returned 404 during discovery; the retrieved authoring index supplies the catalog instead.

## Playwright

[Issue 121](https://github.com/JFusco/brain/issues/121) registers official JavaScript/TypeScript documentation under Frontend. The sitemap selection includes only `/docs/`, excluding next-version, other-language and community pages. It is reference-only and does not install Playwright or enable Brain tests, fixtures or QA agents. Rolling docs do not establish compatibility with a consuming project's installed runner or browsers.

The first Playwright sync correctly refused 296 links because `/docs/` also contains `/docs/next/`. The registration now explicitly excludes that subtree using validated optional collection path exclusions; the 250-page bound stays in place. This corrects the selected scope rather than treating next-version guidance as stable documentation. The initial failed attempt remains in private operational logs.
