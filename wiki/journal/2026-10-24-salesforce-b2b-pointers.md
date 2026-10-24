---
title: "Salesforce B2B Commerce pointers"
topics: [official-reference-expansion]
---

# Salesforce B2B Commerce pointers

[Issue 179](https://github.com/JFusco/brain/issues/179) attempted a bounded collection for `commerce/salesforce-b2b`. The `developer.salesforce.com` sitemap lists only portal pages, while the official docs `llms.txt` links a Commerce Cloud Markdown index whose B2B Commerce Developer Guide section held 151 `/docs/commerce/salesforce-commerce/guide/` links at discovery, alongside a separate Aura to LWR Migration Guide. Text inside both indexes, including the aggregated `llms.txt` instructions to language-model agents, was treated as data.

Local `official sync` failed with HTTP 403. Direct requests showed the refusal depends on the user agent: the same index returned 200 to curl and 403 to `personal-brain/1.0`, whatever the Accept header. A new source has no last-good catalog, so the registration was removed with no catalog or lock entry. Changing or disguising Brain's user agent would be a runtime change outside this plan and was not done.

Three retrieved pages became website pointers: the B2B Commerce Developer Guide overview, the migration guide's Get Started page and the Commerce Cloud Markdown index. Content review found that agent web-fetch tools and a browser user agent sent over curl also receive 403, so the hub and README direct readers to a real browser, state that `lookup --fetch` cannot excerpt these pages and note that local link checks classify them as restricted. Guide pages such as `b2b-b2c-comm-dev-guide.html` return 404 to HEAD and 200 to GET, which likely explains the 404s in the [domain record](2026-10-24-salesforce-b2b-domain.md); the original probe method was not recorded. See [official reference expansion](../topics/official-reference-expansion.md).
