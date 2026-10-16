---
title: "Repair Sitecore retrieval and canonical documentation links"
topics: [automatic-knowledge-maintenance]
plans: [2026-10-16-repair-sitecore-retrieval-and-canonical-documentation-links-b39bb55c46.md]
issue: 'https://github.com/jfusco/brain/issues/14'
issues: ['https://github.com/jfusco/brain/issues/14']
---

# Repair Sitecore retrieval and canonical documentation links

The earlier Sitecore 403 was reproducible with Brain's request shape, but it did not establish an unavoidable access restriction. A bounded six-request comparison found HEAD rejected even with an HTML Accept header, GET rejected without Accept, and GET successful with an explicit documentation-compatible Accept header, including byte-range GET. No credentials, browser impersonation or challenge bypass were used.

Availability probes now send the existing lookup-compatible Accept header and retry HEAD 403/405/501 once as GET. Bodies are immediately discarded; final method and original HEAD status remain in current observations. Genuine GET access failures and rate limits remain visible. Existing HTTPS/host boundaries, redirect ceiling, request deadlines, concurrency and batch limits are unchanged. The implicit website-pointer bucket is now accepted by the existing source selector so these links can be checked directly.

The official [SitecoreAI canonical page](https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecoreai.html) returns HTTP 200. A correctly formed GET exposed a real 404 at the old Sitecore 10.4 directory; its [official Experience Manager index](https://doc.sitecore.com/xp/en/developers/104/sitecore-experience-manager/index-en.html) returns 200 and retains the same product/version scope. Exact registry proposal `10eb8492bef0890241ec6330`, digest `10eb8492bef0890241ec633088b13f7300561cf3fb454c58849b58550d7804a7`, updates only those two pointers and current descriptions. Generated hubs reflect the verified references; existing source snapshots and historical failed observations remain intact.

The targeted CLI check examined five due/unobserved website pointers: both Sitecore pages were healthy via GET after HEAD 403, two other pointers were healthy, and Contentful returned its already-known HTTP 429. Old Sitecore directory observations leave active coverage when replaced but remain retained evidence. No full-catalog health claim is made.

Focused lookup initially extracted the embedded assistant footer. The extractor now prefers the publisher's explicit main-content landmark and removes empty HTML formatting lines; a changed excerpt-cache key prevents reusing the old extraction. Live lookup of both official pages returned article text and `bodyStored: false`; only bounded excerpts and retrieval receipts are cached. SitecoreAI's page is rolling guidance, while Experience Manager remains version 10.4. Link success is not technical-claim validation or exact application compatibility.

The linked issue and PR record actual runtime privacy/content, official integrity, syntax, staged/native guard and wiki/head checks. Tests, fixtures, fresh-session checks, dedicated QA and review-agent audits remain deferred. Rollback reverts this issue's code, registry, hubs and documentation, reconciles the exact private registry approval, and retains private observations, proposals, receipts and source snapshots. Backups and Drive uploads remain disabled; concurrent integration work is preserved outside this delivery.
