---
title: "Adapt shared agent guidance to the receiving repository"
format: "playbook"
domain: "tooling"
aliases: ["repo-local skills", "skills-lock", "AGENTS.md standards", "canonical skill folder"]
evidence_date: "2026-10-26"
reviewed_at: "2026-10-26"
applicability: "Proposed portability review for explicitly authorized repository-local agent instructions and skills; agent loaders and lock formats require individual verification"
provenance: "agent-skills-docs@c559c83aa7aab907d45f60db66e0656c40ad908ea412d9bb9647b2bda197e798; official Agent Skills specification read; sanitized unverified portability report and proposed process"
status: "current"
versions: []
---

# Adapt shared agent guidance to the receiving repository

## When to use this

Use this when the owner explicitly asks to adopt standards or skills from another repository. Existing target instructions and current owner policy govern the change. This playbook does not authorize installing skills, adding gates or copying a sibling dependency set.

## What to do

1. **Documented:** the [Agent Skills specification](https://agentskills.io/specification) defines a skill directory with a `SKILL.md`, required name/description frontmatter and optional resources. It does not establish a universal cross-agent installation directory or lockfile. **Proposed:** keep one canonical repository-local folder and verify each agent's supported loader before linking it. One candidate layout is `.agents/skills/<name>/SKILL.md` with a relative `.claude/skills/<name>` link to `../../.agents/skills/<name>`. A minimal `CLAUDE.md` importing `@AGENTS.md` is a candidate only after confirming the receiving loader supports that import. Test actual discovery and link resolution separately; symlink existence is not execution proof.
2. **Proposed:** preserve upstream provenance, license and the governing skill manager's lock metadata for byte-identical vendored copies. For a deliberately adapted local skill, document the source and compute its local integrity value using the receiving repository's actual checker. A custom SHA-256 over sorted relative paths and bytes can be useful only with a precise encoding/order contract; a field called `computedHash` is not a standardized skills-lock format. If an authorized integrity gate exists, check missing/broken links and changed bytes there. Hash equality establishes identity, not trustworthiness or correct instructions.
3. **Proposed:** copy only applicable standards sections from source text and record deliberate substitutions in a reviewable deviation list. Compare package managers, frameworks, available CI/wiki tooling, commit/PR checks, product label/identifier behavior, timezones and merge policy. Preserve already-correct sentences verbatim where helpful; literal copying does not make false target requirements true. Inspect conflicts before adding duplicate gates or dependencies. If a desired rule requires missing tooling, separately authorize and implement that tooling before claiming enforcement, or explicitly defer the rule.
4. **Proposed:** keep a code-map skill short and source-first: start with a relevant query for broad relationship questions, then explain/path/affected when useful, follow the cited source and refresh after integration under the agreed output policy. A map is orientation, not runtime proof. See [Graphify scope and reproducibility](graphify-code-map.md).
5. **Proposed review boundary:** confirm which instruction and skill files the chosen review tool can inspect or repair. A private report described tools refusing instruction-file targets while accepting them as context; that is not a universal product guarantee. Use a permitted manual/context review when needed and clearly identify any unreviewed portion instead of claiming automated approval.

## Evidence and limits

A private portability report described resolved links, preserved vendored bytes, a passing custom hash checker and explicit standards deviations. Those historical outcomes were not reproduced here. No loader discovery, native skill installation, symlink creation, hash-gate implementation or receiving repository modification was performed. Other agents' native directories and other managers' lock schemas remain unverified. The useful procedure is proposed practice; it does not turn reported success into verified support.
