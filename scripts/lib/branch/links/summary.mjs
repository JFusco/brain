import { readJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';

export function linkSummary() {
  const state = readJSON(at('.state/link-health.json'), { links: {} }),
    counts = {};
  for (const record of Object.values(state.links).filter(record => record.active !== false))
    counts[record.state] = (counts[record.state] || 0) + 1;
  return {
    lastRun: state.lastRun || null,
    lastSuccess: state.lastSuccess || null,
    poolSize: state.poolSize || 0,
    observed: Object.keys(state.links).length,
    counts,
    lastBatch: state.lastBatch || null,
  };
}
