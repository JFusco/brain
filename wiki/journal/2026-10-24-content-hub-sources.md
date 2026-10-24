---
title: "Register Sitecore Content Hub documentation"
date: "2026-10-24"
topics: [official-reference-expansion]
---

# Register Sitecore Content Hub documentation

[Issue 161](https://github.com/JFusco/brain/issues/161) registers two official Content Hub link catalogs under `cms/sitecore-ai`: the cloud developer manual (387 links) and the user documentation (731 links). Both are reference-only sitemap collections on `doc.sitecore.com` with a 5,000-page bound.

The upstream sitemaps delete the text `/en` wherever a page name starts with `en`, producing malformed URLs such as `cloud-devcryption-and-cryptography.html` that fall outside the include prefix. They are restored explicitly through `additionalPages`. The separate API-reference class pages are excluded.

A local `official sync` of both sources reproduced identical catalogs, and spot-checked restored URLs resolve. `brain check`, `official check` and wiki integrity passed. Registry delivery stops at the verified PR unless merging is authorized.
