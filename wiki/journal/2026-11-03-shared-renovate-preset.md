---
title: "Shared Renovate preset"
topics: [cms-field-vocabulary, ui-pattern-vocabulary]
issue: 'https://github.com/jfusco/brain/issues/308'
issues: ['https://github.com/jfusco/brain/issues/308']
---

# Shared Renovate preset

[Issue 308](https://github.com/JFusco/brain/issues/308) puts Brain on the shared Renovate preset `github>JFusco/renovate-config`. Brain pins `cms-field-vocabulary` and `@verndale/ui-design-brain` exactly and was updated by hand. The preset enables Renovate only for those two packages and runs centrally as the Pin Courier GitHub App on every installed repository that has a `renovate.json`. Publishing repositories notify the runner once npm serves each release, so an update pull request opens within minutes.

Renovate titles and commits use the form `chore(deps): bump cms-field-vocabulary to v1.3.10`, which passes the 50-character subject rule, so "Lint PR title" and "Lint PR commit range" still run on `renovate/` branches. Only "Validate PR body" skips them, because a bot pull request has no issue to close. The tooling test now pins both rules: Dependabot branches skip all three lint steps, Renovate branches skip only the PR-body check. No other dependency is managed, and the commitlint configuration and PR template are unchanged.
