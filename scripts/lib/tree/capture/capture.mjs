import { config } from '../../branch/platform/config.mjs';
import { writeJSON, atomic } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { at } from '../../leaf/paths.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { now } from '../../leaf/time.mjs';
import { scrub, policyHash } from '../../branch/privacy/client-terms.mjs';
import { scanner, scan } from '../../branch/privacy/scanner.mjs';
import { domainFor } from '../../branch/capture/domain.mjs';
import { refreshSummary } from '../../branch/capture/summary.mjs';

export function capture(text, { domain: requestedDomain } = {}) {
  if (requestedDomain && !config().domains.includes(requestedDomain))
    throw new Error('Unknown knowledge domain');
  scanner();
  if (!text.trim()) throw new Error('Capture requires content on stdin');
  if (Buffer.byteLength(text) > config().capture.candidateBytes)
    throw new Error('Capture exceeds candidate byte limit; split it into separate captures');
  const rules = scan([{ id: 'capture', bytes: Buffer.from(text) }]),
    content = scrub(text.trim()),
    policy = policyHash(),
    index = readJSON(at('.state/harvest.json'), { schemaVersion: 1, sources: {}, candidates: {} });
  const domain = requestedDomain || domainFor(content),
    legacyId = sha(policy + '\0capture\0' + content).slice(0, 24),
    domainId = sha(policy + '\0capture\0' + domain + '\0' + content).slice(0, 24);
  // Preserve legacy IDs and suppress identical captures across explicit/inferred routes.
  for (const candidateId of [legacyId, domainId])
    if (index.candidates[candidateId]?.domain === domain)
      return {
        id: candidateId,
        status: index.candidates[candidateId].status,
        domain,
        duplicate: true,
      };
  const id = requestedDomain ? domainId : legacyId;
  if (index.candidates[id])
    throw new Error('Existing capture domain differs; use an explicit domain');
  const status = rules.length ? 'quarantined' : 'pending',
    file = `inbox/${now().slice(0, 10)}/${id}.md`,
    body = `---\nid: ${JSON.stringify(id)}\ndomain: ${JSON.stringify(domain)}\nclass: "capture"\nstatus: ${JSON.stringify(status)}\n---\n\n${content}\n`;
  atomic(at(file), body, 0o600);
  index.candidates[id] = {
    id,
    domain,
    class: 'capture',
    status,
    file,
    contentSha256: sha(content),
    fileSha256: sha(body),
    policy,
    createdAt: now(),
    occurrences: [],
    rules: rules.map(r => r.rule),
  };
  writeJSON(at('.state/harvest.json'), index, 0o600);
  refreshSummary(index);
  return { id, status, domain };
}
