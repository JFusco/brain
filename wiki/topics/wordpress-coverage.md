---
title: "WordPress documentation coverage"
aliases: ["wordpress-docs", "wordpress-agent-skills", "WordPress handbooks"]
---

# WordPress documentation coverage

[Issue 69](https://github.com/JFusco/brain/issues/69) adds the `cms/wordpress` domain and two official sources using the existing catalog implementation. The [knowledge hub](../../knowledge/cms/wordpress/INDEX.md) holds current coverage and lookup commands.

The documentation source follows the robots-advertised `https://developer.wordpress.org/sitemap.xml` through its nested sitemaps. It keeps only `/block-editor/`, `/themes/`, `/plugins/`, `/rest-api/`, `/apis/`, `/advanced-administration/` and `/coding-standards/` URLs. Registration produced 1,013 links: 577 block editor, 139 theme, 102 plugin, 62 REST API, 45 common API, 75 advanced administration and 13 coding-standard pages. The PHP code reference, WP-CLI commands, news, WordPress.com and third-party manuals remain outside this catalog. Sitemap coverage does not establish completeness or article correctness.

The [WordPress AI handbook](https://make.wordpress.org/ai/handbook/projects/agent-skills/) identifies `WordPress/agent-skills` as its official repository. Brain catalogs `skills/`, `shared/`, `docs/`, README, CONTRIBUTING and LICENSE at the resolved default-branch commit: 19 reference-only skills and 96 supporting documents at registration. No files are installed into an agent's discovery directories, and no vendor script runs.

Both catalogs use the unchanged HTTPS, approved-host/redirect, download/expansion, 32-index traversal, 1 MiB catalog, privacy and last-good safeguards. The documentation registration caps matching pages at 3,000. `official sync wordpress-docs wordpress-agent-skills` is the refresh command; the existing hosted catalog-sync workflow can run the same scoped refresh. The runner-blocked host policy is unchanged.

The [documentation license policy](https://make.wordpress.org/docs/licensing/) declares CC0 for general content and GPLv2 or later for code snippets; the agent-skills LICENSE declares GPLv2 or later. These are separate source observations. WordPress.org handbooks roll forward independently of an installed site's version, and a repository commit is not a WordPress release pin. Feature requirements must be checked against core, PHP, Gutenberg and plugin versions; lookup leaves compatibility unconfirmed.

The [registration journal](../journal/2026-10-19-wordpress-coverage.md) records observed retrieval, license hashes and bounded verification. Revert this registration's changes together to remove the domain, sources, catalogs, lock entries and hub. Keep unrelated sources, captures and failure evidence intact.
