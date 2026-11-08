---
title: "Check dependency bot PRs against repository gates"
format: "playbook"
domain: "tooling"
aliases: ["bot commitlint", "Dependabot title length", "Renovate message template", "PR body validation"]
evidence_date: "2026-11-03"
reviewed_at: "2026-11-03"
applicability: "Proposed compatibility review for dependency bots in repositories enforcing commitlint and PR-body contracts; any policy exception requires explicit repository authority"
provenance: "Official commitlint rules, GitHub Dependabot commit-message options and Renovate message/body configuration read 2026-11-03; no workflow policy changed or connected bot PR exercised"
status: "current"
versions: []
---

# Check dependency bot PRs against repository gates

## When to use this

Use before enabling a dependency updater in a repository with title, commit-range and PR-template checks. Start with [update mechanism selection](first-party-dependency-updates.md). A bot's generated text must satisfy the receiving repository's actual contract.

## What to do

1. **Documented:** commitlint distinguishes [`subject-max-length` and `header-max-length`](https://commitlint.js.org/reference/rules.html): the subject follows the type/scope prefix, while the header includes it. **Proposed:** inspect the repository's configured rules and lint representative generated titles and commits, including long scoped package names and growing version numbers. A short unscoped example does not establish that every update fits. Check the PR body independently.
2. **Documented:** Dependabot's [message options](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#commit-message) expose prefixes and `include: scope`; the prefix limit is not a limit on the whole generated title. **Proposed:** do not assume changing a prefix can shorten an arbitrary package/version subject or satisfy an exact PR-body template. Verify an actual generated proposal before claiming compatibility.
3. **Documented:** Renovate's [configuration](https://docs.renovatebot.com/configuration-options/#commitmessage) assembles commit messages and PR titles using components including `commitMessagePrefix`, `commitMessageAction`, `commitMessageTopic` and `commitMessageExtra`. Direct `commitMessage` editing is deprecated. `prBodyTemplate`, `prHeader` and `prFooter` control body content. **Proposed:** adjust the component fields, validate representative titles and commit ranges, and test the rendered body against the exact repository validator. Template support alone does not prove that required headings, issue links or checked boxes are appropriate or truthful.
4. **Proposed exception boundary:** if the repository owner explicitly authorizes an exemption, name which checks it affects: body, title and commit-range checks are separate decisions. A condition such as `!startsWith(github.event.pull_request.head.ref, 'dependabot/')` also matches human-created branches with that prefix; it is not verified bot identity. Assess stronger identity criteria for the intended event and preserve the full test/build and other required checks. An exception approved elsewhere grants no authority here. In a workflow triggered only by `pull_request`, an event-name guard can be redundant, but preserve its meaning if additional triggers are introduced.
5. **Proposed acceptance:** inspect the first real bot PR's rendered body, exact commit range and check conclusions. Configuration linting, a hand-written title and a branch name are weaker evidence. Do not merge on checks that were inadvertently skipped.

## Keep companion issue identity outside generated bodies

**Source observation, November 8, 2026:** Renovate's [PR update path](https://github.com/renovatebot/renovate/blob/77a892bccd12b7d1f880d55033754e176d0fc48c/lib/workers/repository/update/pr/index.ts) compares existing and generated body hashes and can replace the body when processing an update. Its [hash helper](https://github.com/renovatebot/renovate/blob/77a892bccd12b7d1f880d55033754e176d0fc48c/lib/modules/platform/pr-body.ts) normalizes debug content, emojis, whitespace and headings, and excludes a Reviewable tail. This is not proof that every runner invocation updates every PR. A manually appended closing reference is therefore an unreliable durable relationship.

**Proposed:** put a stable repository/PR marker in the companion issue and reference the PR there. Reconcile that exact issue against the PR's actual state. A merged PR can satisfy delivery acceptance; a PR closed without merge needs a distinct cancellation or deferral decision. Read back saved links, comments and disposition before treating the relationship as complete; do not duplicate an issue after uncertain creation.

[`prBodyNotes` and `prBodyTemplate`](https://docs.renovatebot.com/configuration-options/#prbodynotes) can generate configured content, but do not discover an unknown companion issue number. The Dependency Dashboard is a repository-level tracking issue, not a guaranteed issue per PR. **Proposed topology:** an authorized central runner may reconcile companion issues after its run using appropriately scoped app access. Closure may lag until the next execution; retries must preserve identity. This is an unimplemented option, not a requirement to add per-repository workflows or a second merge owner. Existing repository holds and merge policy win.

## Evidence and limits

The procedure is proposed; no bot-specific exemption, workflow edit or validator change was made. Historical title-length failures are private, unverified reports; no exact length or package-version compatibility is asserted here. The commitlint distinction and documented customization surfaces support a preflight, not a universal claim that Dependabot always fails or Renovate always passes. Repository policy and authorization determine which adaptation is allowed.
