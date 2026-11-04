---
title: "Unscoped ui-design-brain package"
topics: [ui-pattern-vocabulary]
issue: 'https://github.com/jfusco/brain/issues/316'
issues: ['https://github.com/jfusco/brain/issues/316']
---

# Unscoped ui-design-brain package

[Issue 316](https://github.com/JFusco/brain/issues/316) moves Brain to the unscoped npm package `ui-design-brain`. UI Design Brain moved to `JFusco/ui-design-brain` and publishes under that name from 1.18.3, with npm provenance. The scoped `@verndale/ui-design-brain` stays frozen at 1.18.2. Renovate treats the two names as different packages, so Pin Courier could never propose this move, and the shared preset enables both names until every consumer has moved.

Brain now pins `ui-design-brain@1.18.5`. The UI pattern reader and its npm release check use the new name; the catalog layout under `skills/ui-design-brain/` is unchanged. The release state file records no package name, so the next check records the new package's version. The `ui-design-brain` authority path in `brain.config.json` now points at the moved local checkout, `../ui-design-brain`.
