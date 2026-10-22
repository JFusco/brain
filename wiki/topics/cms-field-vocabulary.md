---
title: "CMS field vocabulary"
---

# CMS field vocabulary

Brain reads the published `cms-field-vocabulary` package as structured reference
data, with an exact dependency pin and npm integrity lock. The package remains the
owner of native field definitions, value shapes and rendering operations; Brain's
notes hold separate practical modeling guidance. Tables are not mirrored into
notes or official catalogs.

`lookup --cms-profile <exact-id>` explicitly opts into one product/version/surface
profile. `vocabulary profiles` lists available profiles. Results retain canonical
field identity, documented/undocumented claim status, official URLs and locators,
package version, catalog hash and source-lock digest. Wrong domains, unavailable
packages, unknown profiles and known SDK version conflicts fail explicitly.
Explicit selection alone does not prove application compatibility. Raw rendering
operations keep their authority and selection predicates; this integration does
not apply consumer policy or resolve branch selections.

Lookup reads bounded installed JSON without executing package code or requesting
npm metadata. The dependency's catalog and manifests remain in ignored
`node_modules/`. Ordinary lookup omits the vocabulary. `--fetch` continues to fetch
selected ordinary documentation pages, without revalidating field evidence.

A newly claimed local nightly run performs an advisory npm release check. The
private receipt retains the result; `maintenance status` reports it. Successful
checks have a 24-hour window and failures back off for one hour while preserving
the last good observation and last failure. A detected release never changes the
pin or expands routine catalog PR scope. Upgrading is an ordinary code change.

Implementation and local evidence are recorded in the
[integration journal](../journal/2026-10-21-cms-field-vocabulary.md).
