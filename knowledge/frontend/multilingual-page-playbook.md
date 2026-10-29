---
title: "Prepare a multilingual CMS page"
domain: "frontend"
format: "playbook"
aliases: ["language declaration", "locale", "multilingual playbook"]
evidence_date: "2026-10-21"
applicability: "HTML pages backed by a CMS; confirm the selected locale, content language and product-specific routing separately"
provenance: "w3c-internationalization@425522bbf10fc262bbd5382aa0cad63f55c5ad56aecf2c92034bc618b5329f65; mdn-web-docs@7fe88bb4d579b6c9d95b3e3fd270b355ffed1e3fde631f4d63f2050c334283b7; official pages read for this proposed workflow; no target application run"
status: "current"
versions: []
reviewed_at: "2026-10-29"
---

# Prepare a multilingual CMS page

## When to use this

Use this when preparing a localized page or reviewing a shared layout for multiple languages. Identify the CMS surface and requested locale before applying framework-specific routing advice.

## What to do

**Proposed practice:**

1. Identify the actual language of the page content. Set the document's `lang` from that content, and mark meaningful passages in another language on the enclosing element.
2. Keep content language, locale-specific date/number formatting and text direction as separate decisions. Confirm each against the content and the application's requirements.
3. Check language-switching destinations, translated labels and text wrapping in the consuming application. Ask about missing translations rather than filling them with guessed content.
4. Read the [component-context guidance](design-component-context.md) when translated content changes a reused component; preserve its behavior and identity.

## Where guidance differs

**Documented distinction:** for `text/html`, W3C uses `lang`; XML-served content has separate `xml:lang` rules. An HTTP `Content-Language` audience declaration does not replace the HTML text-language declaration. A regional locale used for formatting also does not determine the language of every passage. Choose the rule for the actual document surface.

## Evidence and limits

The [W3C language-declaration guide](https://www.w3.org/International/questions/qa-html-language-declarations) and [MDN lang reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/lang) support the declaration rules. [W3C Quick Tips](https://www.w3.org/International/quicktips/index) distinguishes encoding, local forms, navigation and text direction. The sequence above is proposed practice, not a reproduced localization workflow. It does not establish CMS locale configuration, translation completeness, accessibility conformance or search-engine behavior.

**Revalidated October 29, 2026:** The current MDN lang reference and W3C declaration/Quick Tips pages still support document and passage language, distinguish HTML/XML attributes and audience headers, and separate local formatting, navigation and text direction. The proposed CMS preparation sequence is retained. No translations, CMS locale configuration or consuming page were tested.
