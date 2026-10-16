---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/brain/issues/14"]
source_tool: "repository"
source: "repository:issue-14"
topics: ["automatic-knowledge-maintenance"]
digest: "b39bb55c46a12ff834faada2117121177c7bc2cc14fe3aa5d23467bf82652978"
---

# Repair Sitecore retrieval and canonical documentation links

1. Compare public HEAD and GET requests with ordinary Accept headers; identify the Sitecore request-format failure and verify canonical product/version pages.
2. Add bounded GET fallback for rejected HEAD, preserve method/status evidence, and enable targeted checks of the existing website-pointer bucket.
3. Apply an exact source-registry proposal for the two verified canonical URLs and regenerate their hubs. Preserve all historical observations.
4. Verify focused retrieval returns actual article content rather than embedded assistant UI, cache only excerpts/receipts and invalidate earlier extraction keys.
5. Record actual checks, limitations and rollback in an issue-linked PR and wiki; merge after runtime/privacy and hosted integrity/head verification. Keep backups disabled and concurrent work intact.
