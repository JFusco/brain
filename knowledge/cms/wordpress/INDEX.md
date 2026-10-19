---
title: "WordPress"
aliases: ["wordpress", "gutenberg", "WordPress.org"]
---

# WordPress

Use these references for WordPress.org development. The website handbooks are rolling; check the target core, Gutenberg and plugin versions before applying an API or example. WordPress.com services and third-party plugins are outside the documentation catalog.

## Coverage and limits

The `wordpress-docs` catalog follows the [official sitemap](https://developer.wordpress.org/sitemap.xml) and retains only these handbook paths. Counts at registration:

| Handbook | Links |
| --- | ---: |
| Block Editor | 577 |
| Themes | 139 |
| Plugins | 102 |
| REST API | 62 |
| Common APIs | 45 |
| Advanced Administration | 75 |
| Coding Standards | 13 |
| **Total** | **1,013** |

The PHP code reference, WP-CLI commands, developer news, WordPress.com and third-party plugin manuals are not catalogued. These are sitemap-listed links, not a claim that every handbook page is discoverable or verified. Refresh uses `official sync wordpress-docs wordpress-agent-skills` and preserves the last good catalog on a failed required download or exceeded bound.

The separate agent-skills catalog contains 19 skill entry points and 96 selected supporting documents at its recorded commit. They are reference only. Some skills declare WordPress 7.0+ or other feature-specific requirements; inspect the selected skill and the consuming project's actual core, PHP, Gutenberg and plugin versions. Brain reports version compatibility as unconfirmed here.

[Documentation licensing](https://make.wordpress.org/docs/licensing/) distinguishes CC0 general content from GPLv2-or-later code snippets. The [agent-skills LICENSE](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/LICENSE) declares GPLv2 or later. Catalogs store links and metadata; focused retrieval keeps only a bounded excerpt and receipt.

```sh
node scripts/brain.mjs lookup --domain cms/wordpress --query "rest api authentication" --limit 1 --fetch
```

## Curated learnings

<!-- brain:curated:start -->
No curated notes yet.
<!-- brain:curated:end -->

<!-- brain:official:start -->
## Official sources

- **wordpress-docs** — link catalog of 1013 pages; rolling-url; revision `205de4d1aa4015040106650fa334bce2b89f9f8ef4d2f5b8324c9972da1b8072`; fetched 2026-10-19.
  - [Catalog source](https://developer.wordpress.org/sitemap.xml); search it with `lookup --domain cms/wordpress`.
- **wordpress-agent-skills** — 19 skills and 96 docs at a pinned commit; default-branch; revision `55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15`; fetched 2026-10-19.
  - [blueprint](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/blueprint/SKILL.md) — reference only.
  - [wordpress-router](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wordpress-router/SKILL.md) — reference only.
  - [wp-abilities-api](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-abilities-api/SKILL.md) — reference only.
  - [wp-abilities-audit](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-abilities-audit/SKILL.md) — reference only.
  - [wp-abilities-verify](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-abilities-verify/SKILL.md) — reference only.
  - [wp-block-development](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-block-development/SKILL.md) — reference only.
  - [wp-block-themes](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-block-themes/SKILL.md) — reference only.
  - [wp-env](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-env/SKILL.md) — reference only.
  - [wp-interactivity-api](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-interactivity-api/SKILL.md) — reference only.
  - [wp-patterns](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-patterns/SKILL.md) — reference only.
  - [wp-performance](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-performance/SKILL.md) — reference only.
  - [wp-phpstan](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-phpstan/SKILL.md) — reference only.
  - [wp-playground](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-playground/SKILL.md) — reference only.
  - [wp-plugin-development](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-plugin-development/SKILL.md) — reference only.
  - [wp-plugin-directory-guidelines](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-plugin-directory-guidelines/SKILL.md) — reference only.
  - [wp-project-triage](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-project-triage/SKILL.md) — reference only.
  - [wp-rest-api](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-rest-api/SKILL.md) — reference only.
  - [wp-wpcli-and-ops](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wp-wpcli-and-ops/SKILL.md) — reference only.
  - [wpds](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/skills/wpds/SKILL.md) — reference only.
  - [CONTRIBUTING.md](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/CONTRIBUTING.md).
  - [docs/ai-authorship.md](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/docs/ai-authorship.md).
  - [docs/authoring-guide.md](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/docs/authoring-guide.md).
  - [docs/compatibility-policy.md](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/docs/compatibility-policy.md).
  - [docs/packaging.md](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/docs/packaging.md).
  - [docs/principles.md](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/docs/principles.md).
  - [docs/skill-set-v1.md](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/docs/skill-set-v1.md).
  - [docs/upstream-sync.md](https://github.com/WordPress/agent-skills/blob/55cd0f78b996f453c194a1a6ecc5c9a2e0f6cf15/docs/upstream-sync.md).
- [Official website](https://github.com/WordPress/mcp-adapter) — pointer only: Official WordPress MCP adapter, identified by the WordPress AI handbook at https://make.wordpress.org/ai/handbook/projects/mcp-adapter/. Website pointer only; no installation or execution. Check requirements against the consuming WordPress project.
<!-- brain:official:end -->
