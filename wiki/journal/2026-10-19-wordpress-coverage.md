---
title: "Register WordPress developer references"
date: "2026-10-19"
topics: [wordpress-coverage]
plans: [2026-10-19-add-official-wordpress-documentation-coverage-3c144c2580.md]
---

# Register WordPress developer references

[Issue 69](https://github.com/JFusco/brain/issues/69) adds the `cms/wordpress` domain on an isolated branch from remote main `7353f09f5560408f8630a7f66948c4575f88fa8a`. The primary checkout's unrelated edits and the deferred Contentful worktree are preserved.

## Verified scope and origin

The official [developer landing page](https://developer.wordpress.org/) links its handbooks. Its [robots file](https://developer.wordpress.org/robots.txt) advertises `sitemap.xml`, which links the content and image sitemap indexes. Brain's existing sitemap traversal retrieves the nested indexes and filters to seven handbook prefixes, producing 1,013 unique pages. Two direct in-memory discovery passes and the registration sync succeeded. No custom browser transport or new runtime code was needed. Cataloguing the sitemap does not verify every article or exhaust the WordPress ecosystem.

`wordpress-docs` revision: `205de4d1aa4015040106650fa334bce2b89f9f8ef4d2f5b8324c9972da1b8072`. Catalog SHA-256: `8b34f51db476a489b6239c1f485d0a87e74fdbd91b0477379bdbfb4d26ca9297`.

The [WordPress AI handbook](https://make.wordpress.org/ai/handbook/projects/agent-skills/) links the official agent-skills repository. Its API tree was untruncated. The selected paths produce 19 reference-only skills and 96 supporting documents, with zero unresolved selected-file references. README's CONTRIBUTING link is included in selection; the vendor files themselves are not repaired or executed.

`wordpress-agent-skills` revision: `55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15`. Catalog SHA-256: `3ad43b4cea3f918033ad794b208719846cc89a90fddc6248e7c9d82d5ca6ea17`.

## License observations

The [documentation licensing statement](https://make.wordpress.org/docs/licensing/) distinguishes CC0 general content from GPLv2-or-later code snippets. Observed Markdown-response SHA-256: `663530fcf5e92aa201fa4c27d2e22344c0744ee60ccd9a2c69bd104e8f18e323`.

The agent-skills repository's [LICENSE](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/LICENSE) declares GPLv2 or later. Pinned LICENSE response SHA-256: `e32a315ba45df64329783a922f7bf457064b7a8fa1f46c1bda55a95850d5377c`. Catalogs contain links and metadata; full vendor page bodies and archives remain untracked and are discarded after processing.

## Observed verification

Focused lookup for `rest api authentication` returns the registered [Authentication article](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/) with a successful receipt: `bodyStored: false`, response SHA-256 `2fc7e2bde8f5c069ffb6739d58d7a853dc8f6f545d4146481cb9c9bb52c00e57`. The returned text is article Markdown, not a navigation fragment or challenge. A separate focused lookup also retrieved the pinned REST skill and its authentication summary with Git blob checks. Neither reading a skill nor a valid hash establishes installed-project compatibility.

`links check --source wordpress-docs --limit 5` checked exactly 5 selected links: all HEAD 200, healthy, without redirects. This is five observations out of 1,013 documentation links, not a full link audit:

- [rest-api/using-the-rest-api/authentication/](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/) — HEAD 200.
- [block-editor/reference-guides/core-blocks/core-blocks-widgets/core-block-page-list-item/](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/core-blocks-widgets/core-block-page-list-item/) — HEAD 200.
- [themes/theme-security/theme-security-issues/](https://developer.wordpress.org/themes/theme-security/theme-security-issues/) — HEAD 200.
- [block-editor/reference-guides/components/external-link/](https://developer.wordpress.org/block-editor/reference-guides/components/external-link/) — HEAD 200.
- [block-editor/reference-guides/packages/packages-project-management-automation/](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-project-management-automation/) — HEAD 200.

Runtime/privacy, official-integrity and wiki checks are run against the final staged delivery. The existing hosted catalog-sync workflow verifies the same scoped refresh before delivery completion; its observed outcome is recorded in the issue and PR. Tests, fixtures, fresh-session checks, dedicated QA and review-agent audits remain deferred. No new CI or workflow is added.

## Limits and rollback

The seven exact handbook scopes and page counts are in the [WordPress hub](../../knowledge/cms/wordpress/INDEX.md) and [durable topic](../topics/wordpress-coverage.md). The handbooks are rolling; feature requirements must be checked against core, PHP, Gutenberg and plugin versions. The separate skills commit is source provenance, not a WordPress release version. PHP code-reference pages, WP-CLI commands, developer news, WordPress.com and third-party plugin manuals are excluded from the docs catalog.

Revert this registration together to remove its two sources, catalogs, lock entries, domain configuration and hub links. No consumer project, installed skill, unrelated source, hosted-runner host policy or Contentful status changes.
