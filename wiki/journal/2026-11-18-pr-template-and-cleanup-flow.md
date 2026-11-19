---
title: "Require the PR template and align cleanup"
date: "2026-11-18"
topics: [automatic-knowledge-maintenance]
plans: []
---

# Require the PR template and align cleanup

Issue [409](https://github.com/JFusco/brain/issues/409) tightens two steps of the Git delivery flow in `AGENTS.md`.

Step 6 used to describe the pull request body in prose and said to use the template and lint "if they exist". The canonical `.github/pull_request_template.md`, the `lint:pr` script and the hosted check were already present, so the step now names them as requirements, with the same wording as the CMS field vocabulary and Office repositories.

Step 8 now uses one cleanup wording shared by the three repositories: after a merge by the Office, an agent or Joe, the delivery removes its remote branch, local branch, worktree and any scratch or temporary files it left outside the repository. Joe asked for the shared wording on 2026-11-18.

The Office's merge authority in step 7 and the automatic merge authorization for routine knowledge pull requests are unchanged. Documentation only.
