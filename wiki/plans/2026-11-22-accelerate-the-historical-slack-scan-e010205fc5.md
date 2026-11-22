---
status: "partial"
executed: true
evidence: ["tests/slack-intake.test.mjs"]
source_tool: "codex"
source: "Brain Slack intake acceleration"
topics: ["incremental-collection"]
digest: "e010205fc59a412ffd64a7f349529102fd11b06a3c7454571cbdfcc1402d7c1f"
---

# Accelerate the historical Slack scan

Increase the existing seed rotation from two channels to four and widen new
historical windows from seven to 28 days. Keep live checks first, keep the
original lookback cutoff and resume interrupted windows at their saved bounds.
Split dense provider queries and preserve incomplete coverage for retry.

Keep primary-source evidence, validation, capture admission, and independent
review requirements in the existing flow. Verify the bounded rotation and
both old and new page cursor formats before enabling the change on main.
