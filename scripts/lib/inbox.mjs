import fs from 'node:fs';
import { config } from './branch/platform/config.mjs';
import { writeJSON } from './leaf/fs-safe.mjs';
import { sha } from './leaf/hash.mjs';
import { readJSON } from './leaf/json.mjs';
import { at } from './leaf/paths.mjs';
import { now } from './leaf/time.mjs';
import { policyHash, scan, scanner, clientHits } from './privacy.mjs';
import { refreshSummary } from './capture.mjs';
import { mergedBrainPR } from './maintenance.mjs';

const index = () =>
  readJSON(at('.state/harvest.json'), { schemaVersion: 1, sources: {}, candidates: {} });
function candidate(state, id) {
  const c = state.candidates[id];
  if (!c) throw new Error('Unknown candidate ID');
  if (c.policy !== policyHash())
    throw new Error('Candidate was scanned under an older privacy policy; run inbox rescan');
  if (sha(fs.readFileSync(at(c.file))) !== c.fileSha256)
    throw new Error('Candidate content changed; refusing stale approval');
  return c;
}
// Captures are the review queue; the historical harvested backlog is listed only on request.
export function list({ domain, all = false, backlog = false } = {}) {
  return Object.values(index().candidates)
    .filter(
      c =>
        !c.disposition &&
        (backlog || c.class === 'capture') &&
        (!domain || c.domain === domain) &&
        (all || c.status === 'pending'),
    )
    .map(c => ({
      id: c.id,
      domain: c.domain,
      class: c.class,
      status: c.status,
      bytes: fs.statSync(at(c.file)).size,
    }));
}
export function show(id) {
  const c = candidate(index(), id);
  if (c.status === 'quarantined')
    throw new Error(
      'Candidate is quarantined. Inspect private provenance locally; do not load raw content into a review session.',
    );
  const bytes = fs.readFileSync(at(c.file));
  if (bytes.length > config().capture.candidateBytes + 2048)
    throw new Error('Candidate exceeds review byte cap');
  return bytes.toString();
}
// Re-scan records saved under an older privacy policy; bodies are never rewritten.
export function rescan(ids = []) {
  scanner();
  const state = index(),
    policy = policyHash(),
    result = { rescanned: 0, pending: 0, quarantined: 0, changed: 0 };
  for (const id of ids) if (!state.candidates[id]) throw new Error('Unknown candidate ID');
  const work = [];
  for (const c of (ids.length
    ? ids.map(id => state.candidates[id])
    : Object.values(state.candidates)
  ).filter(c => !c.disposition && c.status !== 'quarantined' && c.policy !== policy)) {
    const bytes = fs.readFileSync(at(c.file));
    if (sha(bytes) !== c.fileSha256) {
      result.changed++;
      continue;
    }
    work.push({ c, bytes });
  }
  for (let start = 0; start < work.length; start += 300) {
    const batch = work.slice(start, start + 300),
      rules = new Map();
    for (const finding of scan(batch.map(({ c, bytes }) => ({ id: c.id, bytes })))) {
      if (!rules.has(finding.id)) rules.set(finding.id, []);
      rules.get(finding.id).push(finding.rule);
    }
    for (const { c, bytes } of batch) {
      const found = [
        ...(rules.get(c.id) || []),
        ...(clientHits(bytes.toString()).length ? ['client-term'] : []),
      ];
      c.status = found.length ? 'quarantined' : 'pending';
      c.rules = [...new Set([...(c.rules || []), ...found])];
      c.policy = policy;
      result.rescanned++;
      result[c.status]++;
    }
  }
  if (result.rescanned) {
    writeJSON(at('.state/harvest.json'), state, 0o600);
    refreshSummary(state);
  }
  return result;
}
export async function resolve(ids, as, { pr } = {}) {
  if (!['accepted', 'rejected', 'superseded'].includes(as))
    throw new Error('Resolve requires --as accepted|rejected|superseded');
  if (as === 'accepted' && !pr) throw new Error('Acceptance requires --pr <merged-number>');
  if (as !== 'accepted' && pr) throw new Error('Only acceptance cites a PR');
  const state = index();
  for (const id of ids) {
    const c = candidate(state, id);
    if (c.disposition) throw new Error('Candidate is already resolved');
    if (as === 'accepted' && c.status !== 'pending')
      throw new Error('Only pending candidates can be accepted');
  }
  // Acceptance records the merged knowledge PR that used the candidate.
  const merged = as === 'accepted' ? await mergedBrainPR(pr) : null;
  for (const id of ids)
    state.candidates[id].disposition = {
      as,
      at: now(),
      ...(merged ? { pr: Number(pr), mergeCommit: merged.merge_commit_sha } : {}),
    };
  writeJSON(at('.state/harvest.json'), state, 0o600);
  refreshSummary(state);
  return { resolved: ids.length, as };
}
