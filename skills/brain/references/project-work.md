# Project briefings and practical playbooks

Use this when the user asks Brain to prepare for a build, fix or review. Identify
the task and one application workspace from the request and repository context.
Read only bounded package manifests and relevant project instructions; never
inspect private auth, environment, session or inbox content.

```sh
node ~/Projects/brain/scripts/brain.mjs brief --query "<task>" --project "$PWD" --workspace <app> --domain <domain>
node ~/Projects/brain/scripts/brain.mjs playbooks --domain <domain> --project "$PWD" --workspace <app>
```

Omit `--workspace` for a single application. Without a project, use known literal
`--versions`; otherwise state that package applicability is unconfirmed. `brief`
calls the existing ranked route and supplies note procedures, decision branches,
evidence limits and gaps. It does not compose an answer or run project code.
`playbooks` lists published workflows from committed main; listing is not reading.
Use a focused `brief` or `route` consultation for the selected lesson, then read
only applicable returned notes and official references. Report actual note reads,
citations and completion using that consultation's session.

Turn the evidence into a short task-specific briefing:

- **Context:** intended behavior, application workspace and confirmed versions.
- **Relevant guidance:** applicable lessons or playbooks with citations.
- **Pitfalls and differences:** concrete failure modes, conditions that change
  the advice, stale evidence and unresolved decisions.
- **Recommended steps:** the smallest implementation and verification sequence
  consistent with the consuming project. Label your proposed steps as proposals.

If a selected source lacks enough substance, read its official page or disclose
the gap. A catalog hit, excerpt or successful retrieval is not technical proof.
Do not expand into implementation, project enrollment or capture without the
user's corresponding instruction.

## Explain differing guidance

Compare source recommendations together with version, product surface,
applicability and evidence date. Use the note's “Where guidance differs” section
when present. Two recommendations for different conditions can both apply; do
not invent a disagreement because titles, links or hashes differ.

```sh
node ~/Projects/brain/scripts/brain.mjs explain --node <returned-node-id> --versions next@16
node ~/Projects/brain/scripts/brain.mjs compare --from <node-id> --to <node-id> --versions next@16
```

These commands expose committed metadata, authored decision branches and explicit
links. The comparison verdict remains unresolved until the relevant claims are
read and assessed. Explain which condition selects the recommendation, or name
the missing evidence/project decision. Follow stronger consuming-project rules.

## Explicit usefulness feedback

Only when the user explicitly supplies a usefulness response for a named note,
record `helped`, `needs-clarification` or `did-not-apply` using its returned ID and
the current committed snapshot. `clear` removes that note-version response.

```sh
node ~/Projects/brain/scripts/brain.mjs feedback --node <knowledge-note-id> --snapshot <main-sha> --value helped
```

One private local response is retained per note content version. Repeated choices
do not add votes; unrelated main updates retain the response. Feedback does not
change ranking, verify a claim, capture chat text or authorize publication.
Never infer “helped” from a read, citation, successful command or user silence.
