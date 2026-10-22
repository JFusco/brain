---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/brain/issues/122", "Local sync and Git-blob-verified selective authentication lookup succeeded. The repository archive exceeded the existing download cap and was refused; the source was changed to the existing tree-only catalog path without raising any download limit. The failed attempt remains in private logs. GitHub latest is Bleeding Edge, so the stable release is pinned explicitly."]
source_tool: "codex"
source: "brain-approved-additions-asvs"
topics: ["official-reference-expansion"]
digest: "768a6ba2764caae4f59966c4df705faba8e96179e78aa7380bbaba5ed3e042a5"
---

# Register stable OWASP ASVS requirements

1. Implement the approved issue scope with existing privacy and runtime protections.
2. Added English ASVS 5.0.0 requirements at the immutable v5.0.0_release commit, alongside the existing OWASP cheat sheets. Uses bounded Git-tree cataloging and preserves Markdown suffixes in pinned GitHub reading links. Does not assess or certify applications.
3. Verify local runtime, source retrieval where applicable and wiki integrity.
4. Commit, push and read back the issue-linked PR. Require passing Wiki integrity on its exact head, merge, update main and delete the verified merged branch.
