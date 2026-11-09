---
title: "Scope an application security review"
domain: "security"
format: "playbook"
aliases: ["ASVS", "security requirements", "security review playbook"]
evidence_date: "2026-10-21"
applicability: "Application review using ASVS 5.0.0 and applicable implementation guidance; agree the assessed surface and requirements before claiming coverage"
provenance: "owasp-asvs@5cf9b032440be53ce345ab3c130fda46ba1ce7a2; owasp-cheat-sheets@6d07d8e422d2f2e96d3b1304a9d16b7f54e1b4ccd472bc6745fee122153d3775; official pages read for this proposed workflow; CSP section checked against the official cheat sheet 2026-11-09; no target application run"
status: "current"
versions: []
reviewed_at: "2026-10-21"
---

# Scope an application security review

## When to use this

Use this when translating an application's security questions into a bounded review. Identify the application surface, authentication/session design and the requirements the project has agreed to assess.

## What to do

**Proposed practice:**

1. Start from the pinned [ASVS 5.0.0 overview](https://github.com/OWASP/ASVS/blob/5cf9b032440be53ce345ab3c130fda46ba1ce7a2/5.0/en/0x03-What-is-the-ASVS.md). Select relevant versioned requirements instead of treating every security topic as already assessed.
2. Read the exact requirement text and record the evidence needed to assess it. For authentication questions, follow the pinned [authentication chapter](https://github.com/OWASP/ASVS/blob/5cf9b032440be53ce345ab3c130fda46ba1ce7a2/5.0/en/0x15-V6-Authentication.md).
3. Consult the relevant implementation guidance, such as the [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), then confirm the actual framework and CMS behavior.
4. Report assessed, failed and unassessed items separately. Preserve missing evidence and unresolved applicability; obtain the project's required security review before broader acceptance claims.

## Separate CSP behavior from reporting

**Documented November 9, 2026:** the [CSP cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html) distinguishes an enforced policy from `Content-Security-Policy-Report-Only`, which does not block violations. Reporting configuration and supported browser behavior must be checked separately from whether a policy is enforced.

**Proposed:** agree on allowed-source and bypass acceptance criteria, enforcement mode and violation collection as separate checks. Record the deployed header, tested URL, tool/version, browser and date. Reconcile scanner disagreements against those criteria and browser evidence. Investigate a reported JSONP or other bypass independently from a missing-reporting warning; neither the report nor a scanner score proves exploitability or overall security.

Confirm reporting requirements, endpoint ownership and actual receipt directly. Uncertainty about a paid reporting service does not decide whether reporting is required. Historical tool comparisons are not an approved scanner standard, a reproduced vulnerability or compliance certification. This addition retains the earlier assessment guidance's evidence date rather than treating a CSP-only review as a complete revalidation.

## Where guidance differs

**Authority distinction:** ASVS supplies versioned assessment requirements, while cheat sheets explain implementation practices and can change independently. A broadly relevant cheat sheet is not evidence that a particular ASVS requirement passed. When recommendations differ, preserve both source contexts and seek a documented project decision or further evidence; do not silently substitute one for the other.

## Evidence and limits

The pinned ASVS overview and chapter are documented references. The review sequence is proposed practice, not a security assessment, certification or reproduction of an application's controls. No requirement has been marked passed by this note, and no compliance level is inferred.
