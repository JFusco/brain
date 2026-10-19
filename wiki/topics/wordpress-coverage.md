---
title: "WordPress documentation coverage"
aliases: ["wordpress-docs", "wordpress-agent-skills", "WordPress handbooks"]
---

# WordPress documentation coverage

[Issue 69](https://github.com/JFusco/brain/issues/69) adds the `cms/wordpress` domain and two official sources using the existing catalog implementation. The [knowledge hub](../../knowledge/cms/wordpress/INDEX.md) holds current coverage and lookup commands.

The documentation source follows the robots-advertised `https://developer.wordpress.org/sitemap.xml` through its nested sitemaps. It keeps only `/block-editor/`, `/themes/`, `/plugins/`, `/rest-api/`, `/apis/`, `/advanced-administration/` and `/coding-standards/` URLs. Registration produced 1,013 links: 577 block editor, 139 theme, 102 plugin, 62 REST API, 45 common API, 75 advanced administration and 13 coding-standard pages. The PHP code reference, WP-CLI commands, news, WordPress.com and third-party manuals remain outside this catalog. Sitemap coverage does not establish completeness or article correctness.

The [WordPress AI handbook](https://make.wordpress.org/ai/handbook/projects/agent-skills/) identifies `WordPress/agent-skills` as its official repository. Brain catalogs `skills/`, `shared/`, `docs/`, README, CONTRIBUTING and LICENSE at the resolved default-branch commit: 19 reference-only skills and 96 supporting documents at registration. No files are installed into an agent's discovery directories, and no vendor script runs.

Both catalogs use the unchanged HTTPS, approved-host/redirect, download/expansion, bounded index traversal (default 32), 1 MiB catalog, privacy and last-good safeguards. The documentation registration caps matching pages at 3,000. `official sync wordpress-docs wordpress-agent-skills` is the refresh command; the existing hosted catalog-sync workflow can run the same scoped refresh. The runner-blocked host policy is unchanged.

The [documentation license policy](https://make.wordpress.org/docs/licensing/) declares CC0 for general content and GPLv2 or later for code snippets; the agent-skills LICENSE declares GPLv2 or later. These are separate source observations. WordPress.org handbooks roll forward independently of an installed site's version, and a repository commit is not a WordPress release pin. Feature requirements must be checked against core, PHP, Gutenberg and plugin versions; lookup leaves compatibility unconfirmed.

The [registration journal](../journal/2026-10-19-wordpress-coverage.md) records observed retrieval, license hashes and bounded verification. Revert this registration's changes together to remove the domain, sources, catalogs, lock entries and hub. Keep unrelated sources, captures and failure evidence intact.

## Discovery and refresh follow-up

[Issue 73](https://github.com/JFusco/brain/issues/73) closes the discovery gaps found after registration. The opt-in Brain skill description includes WordPress, TypeScript and accessibility. Automatic capture recognizes WordPress-specific identifiers and lets recognizable WordPress context win a tie with React or frontend; higher scores and ties involving other domains retain their previous behavior. Explicit `--domain` still wins. This is a keyword heuristic, not semantic classification.

The coverage watch list includes the WordPress GitHub organization and Make WordPress AI. The [AI handbook MCP adapter page](https://make.wordpress.org/ai/handbook/projects/mcp-adapter/) identifies [WordPress/mcp-adapter](https://github.com/WordPress/mcp-adapter); Brain records it as a website pointer without installation or execution. This does not register a new mirrored source or establish compatibility with a consuming project.

Collection sync results now report `crawls` with `indexesFetched`, `maxIndexes` and success/failure status. Private source-run records and logs retain the counts, including partial failures. Counts represent successfully downloaded logical indexes, including image and nested sitemaps; they are not counts of retained handbook sections, HTTP redirect hops or verified articles. A collection can configure `maxIndexes` as an integer from 1 to 128; the default remains 32. Invalid values are rejected by registry validation and the crawler. Catalog serialization, page revisions and last-good retention stay unchanged.

On 2026-10-19, the actual `official sync wordpress-docs` refreshed 18 of 32 indexes and left the 1,013-link catalog unchanged. All four review examples routed to `cms/wordpress`. A separate live one-index bounded crawl refused further traversal after one download and left the saved catalog unchanged. These are bounded runtime observations, not exhaustive browser or behavioral coverage. Shared lookup-title disambiguation remains deferred. The [follow-up journal](../journal/2026-10-19-wordpress-followup.md) records verification and rollback.
