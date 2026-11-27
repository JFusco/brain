---
title: "Decide capture resolution from the separate disposition"
date: "2026-11-23"
topics: [office-interfaces]
---

# Decide capture resolution from the separate disposition

A maintenance check first asserted a capture's resolution from the status embedded in its preserved body, then corrected itself by reading the current disposition without resolving again. AGENTS.md and README already state the rule, and `inbox resolve` already refuses a candidate that has a disposition, but no test pinned that guard. The capture receipt also reports `currentStatus`, which is the privacy-scan status and stays `pending` after acceptance.

`tests/capture-receipts.test.mjs` now covers an accepted capture whose body still says `status: pending`. The receipt shows `pending` next to the accepted disposition, `inbox list` omits it, both accepted and rejected resolution attempts are refused, and the disposition and body stay unchanged. `docs/office-interfaces.md` names `disposition`, not `currentStatus` or the body, as the field that decides whether resolution remains. AGENTS.md is unchanged.

Issue: [JFusco/brain#407](https://github.com/JFusco/brain/issues/407).
