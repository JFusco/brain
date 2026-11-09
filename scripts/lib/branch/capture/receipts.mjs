import { sha } from '../../leaf/hash.mjs';
import { now } from '../../leaf/time.mjs';

export function requestBinding(bytes, requestId, domain) {
  if (requestId === undefined) return null;
  if (
    typeof requestId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)
  )
    throw new Error('Capture request ID must be a UUID');
  if (typeof domain !== 'string' || !domain)
    throw new Error('Request-bound capture requires --domain');
  return { requestId: requestId.toLowerCase(), inputSha256: sha(bytes), domain };
}

export function receiptFrom(index, requestId) {
  const receipt = index.requests?.[requestId];
  if (!receipt) return { requestId, found: false };
  const candidate = index.candidates[receipt.id];
  if (!candidate) throw new Error('Capture receipt candidate is missing');
  return {
    ...receipt,
    found: true,
    currentStatus: candidate.status,
    disposition: candidate.disposition || null,
  };
}

export function existingRequest(index, binding) {
  if (!binding || !index.requests?.[binding.requestId]) return null;
  const receipt = receiptFrom(index, binding.requestId);
  if (receipt.inputSha256 !== binding.inputSha256 || receipt.domain !== binding.domain)
    throw new Error('Capture request ID belongs to different input or domain');
  return { ...receipt, replayed: true };
}

export function recordRequest(index, binding, result, policy) {
  if (!binding) return result;
  index.requests ??= {};
  index.requests[binding.requestId] = {
    ...binding,
    ...result,
    duplicate: !!result.duplicate,
    policy,
    createdAt: now(),
  };
  return receiptFrom(index, binding.requestId);
}
