---
title: "Dependabot commitlint exemption"
topics: [code-quality]
---

# Dependabot commitlint exemption

[Issue 302](https://github.com/JFusco/brain/issues/302) applies Joe's 2026-11-02 rule that no Office project refuses a Dependabot pull request. Dependabot writes its own PR title, body and commit messages, which cannot follow Brain's conventional commit rules or PR template, so **Commit message lint** could never pass for it.

The `commitlint` job now skips "Lint PR title", "Validate PR body" and "Lint PR commit range" when `github.event.pull_request.head.ref` starts with `dependabot/`. The job itself still runs, so its check reports success and the PR merges on its other hosted checks. Every other branch, including Office and human PRs, is linted exactly as before; the commitlint configuration, PR template and other workflows are unchanged. A tooling test pins the condition to those three steps and rejects a job-level skip.

The same exemption is live in cms-field-vocabulary. Brain has no `.github/dependabot.yml`, so this prepares the workflow for future Dependabot PRs rather than fixing a current one. GitHub's `startsWith` expression is case-insensitive ([expressions reference](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions)).
