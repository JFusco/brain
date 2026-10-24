---
title: "Salesforce B2B Commerce pointers"
topics: [official-reference-expansion]
---

# Salesforce B2B Commerce pointers

[Issue 179](https://github.com/JFusco/brain/issues/179) attempted a bounded collection for `commerce/salesforce-b2b`. The `developer.salesforce.com` sitemap lists only portal pages, while the official docs `llms.txt` links a Commerce Cloud Markdown index whose B2B Commerce Developer Guide section held 151 `/docs/commerce/salesforce-commerce/guide/` links at discovery, alongside a separate Aura to LWR Migration Guide. Text inside that index, including its instructions to language-model agents, was treated as data.

Local `official sync` failed with HTTP 403. Direct requests showed the refusal depends on the user agent: the same index returned 200 to curl and 403 to `personal-brain/1.0`, whatever the Accept header. A new source has no last-good catalog, so the registration was removed with no catalog or lock entry. Changing or disguising Brain's user agent would be a runtime change outside this plan and was not done.

Three retrieved pages became website pointers: the B2B Commerce Developer Guide overview, the migration guide's Get Started page and the Commerce Cloud Markdown index. The hub and README state that they are pointers for agent browsing tools, and that focused `lookup --fetch` excerpts are unavailable for them. This corrects the [domain record](2026-10-24-salesforce-b2b-domain.md): its guide-URL 404s came from HEAD probes, and GET requests serve those pages. See [official reference expansion](../topics/official-reference-expansion.md).
