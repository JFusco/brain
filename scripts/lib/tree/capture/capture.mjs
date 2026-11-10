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
import {
  requestBinding,
  existingRequest,
  recordRequest,
  receiptFrom,
} from '../../branch/capture/receipts.mjs';

const readIndex = () =>
  readJSON(at('.state/harvest.json'), { schemaVersion: 1, sources: {}, candidates: {} });

export function captureReceipt(requestId, cursor) {
  if (requestId === undefined) throw new Error('Capture receipt requires --request-id');
  const binding = requestBinding(Buffer.alloc(0), requestId, 'receipt');
  return receiptFrom(readIndex(), binding.requestId, cursor);
}

export function capture(input, { domain: requestedDomain, requestId } = {}) {
  const bytes = Buffer.isBuffer(input) ? input : Buffer.from(input),
    binding = requestBinding(bytes, requestId, requestedDomain),
    // Only request-bound captures require exact bytes; legacy captures keep lenient decoding.
    text = binding
      ? new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes)
      : bytes.toString('utf8'),
    index = readIndex(),
    existing = existingRequest(index, binding);
  if (existing) return existing;
  if (requestedDomain && !config().domains.includes(requestedDomain))
    throw new Error('Unknown knowledge domain');
  scanner();
  if (!text.trim()) throw new Error('Capture requires content on stdin');
  if (Buffer.byteLength(text) > config().capture.candidateBytes)
    throw new Error('Capture exceeds candidate byte limit; split it into separate captures');
  const rules = scan([{ id: 'capture', bytes: Buffer.from(text) }]),
    content = scrub(text.trim()),
    policy = policyHash();
  const domain = requestedDomain || domainFor(content),
    legacyId = sha(policy + '\0capture\0' + content).slice(0, 24),
    domainId = sha(policy + '\0capture\0' + domain + '\0' + content).slice(0, 24);
  // Preserve legacy IDs and suppress identical captures across explicit/inferred routes.
  for (const candidateId of [legacyId, domainId])
    if (index.candidates[candidateId]?.domain === domain) {
      const result = recordRequest(
        index,
        binding,
        {
          id: candidateId,
          status: index.candidates[candidateId].status,
          domain,
          duplicate: true,
        },
        index.candidates[candidateId].policy,
      );
      if (binding) {
        writeJSON(at('.state/harvest.json'), index, 0o600);
        refreshSummary(index);
      }
      return result;
    }
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
  const result = recordRequest(index, binding, { id, status, domain }, policy);
  writeJSON(at('.state/harvest.json'), index, 0o600);
  refreshSummary(index);
  return result;
}
