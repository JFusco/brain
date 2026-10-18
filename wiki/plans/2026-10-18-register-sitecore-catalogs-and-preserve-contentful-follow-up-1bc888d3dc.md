---
status: "partial"
executed: true
evidence: ["https://github.com/JFusco/brain/pull/63", "https://github.com/JFusco/brain/pull/65", "48639ded6d0fa2787afbb3833ccea0e5f169971e; local sync, excerpts and ten-link sample"]
source_tool: "codex"
source: "User handoff and follow-up for JFusco/brain#64 and JFusco/brain#65"
topics: ["automatic-knowledge-maintenance"]
digest: "1bc888d3dc1d2fa9e003cf1f4f3fca452d88de030e92054a832a2fa1488f4bbd"
---

# Register Sitecore catalogs and preserve Contentful follow-up

This is a sanitized execution record of the user handoff for JFusco/brain#64,
updated by the user's decisions to defer Contentful and stop for PR review.
It is reconstructed from the instructions and observed work, not recovered
from an agent session store.

1. Verify merged PR 63's runner-blocked-host policy and preserve existing
   private state, dirty checkout work and historical failures.
2. Continue on the existing PR 65 branch. Register only official SitecoreAI
   platform and Experience Manager 10.4 developer-manual sitemaps. Correct
   source prefixes to the URLs actually listed, and send an explicit Accept
   header when fetching collection indexes. Keep all download, host, size,
   privacy and last-good-catalog protections.
3. Generate the two catalogs with local official sync. Run runtime content,
   official integrity and wiki checks, verify three lookup results and one
   focused excerpt per domain, and sample five links per source. Preserve
   actual redirects, failures, source revisions and the limits of sampling.
4. Keep Contentful unregistered and pending: Chrome can open its official
   indexes, but direct automated requests return an HTTP 429 challenge.
   Do not substitute a mirror or claim unattended refresh is solved.
5. Remove the old LaunchAgent, requested old caches, and verified merged
   branches/worktrees. Link the explicitly authorized manual Brain skills.
   Preserve the primary checkout's pre-existing edits. The primary edited
   CLI rejected inbox rescan; do not report it as completed.
6. Update README coverage, add a journal for PRs 63 and 65, update the
   maintenance topic, archive this plan and regenerate/check the wiki graph.
7. Commit and push without force, update the PR's actual verification and
   mark it ready for review. The latest instruction is to stop before merge.
   After a later authorized merge, verify the merged head before deleting
   the PR branch and its remaining worktrees under AGENTS.md step 8.

## Execution status

PR 63 merged as f8eb511363186ef181c727f3fc53ce2b44757f56.
PR 65 commits 136a694 and 48639de contain the cleanup rule and Sitecore
registration/header fix. Local sync produced 407 and 393 catalog links.
Both excerpt fetches succeeded, and all ten sampled links reached HTTP 200
after redirects. README/wiki delivery is the final PR follow-up. Contentful
and the PR merge remain pending, so this plan is archived as partial.
