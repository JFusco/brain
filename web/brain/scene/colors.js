import * as THREE from 'three';
import { $ } from '../lib/dom.js';
import { hash } from '../lib/hash.js';
import { edgeKey, endpoint, needsAttention } from '../lib/knowledge.js';
import { reduced, state } from '../model/state.js';

// A sweeping wave across stars while a search runs.
export function scanLevel(id) {
  return state.searchStage === 'searching' && !reduced.matches
    ? Math.pow(
        Math.max(0, Math.sin(state.visualTime * 0.007 - ((hash(id) % 100) / 100) * Math.PI * 2)),
        8,
      )
    : 0;
}

export function energized(edge) {
  return state.searchStage === 'found' && state.searchEdges.has(edgeKey(edge));
}

// Star color, in priority order: search result, scan, focus, live activity, new, needs
// attention, planned path, usage heat, then kind.
export function color(n) {
  if (state.searchStage === 'found' && state.searchFound.has(n.id)) return '#e6fdff';
  if (scanLevel(n.id) > 0.55) return '#79e6ff';
  if (state.focusGraph?.id === n.id) return '#e8f9ff';
  if ((state.active.get(n.id) || 0) > Date.now())
    return state.activeKinds.get(n.id) === 'cited'
      ? '#ffdf9e'
      : state.activeKinds.get(n.id) === 'read'
        ? '#a3ffe1'
        : '#f1ffff';
  if ((state.fresh.get(n.id) || 0) > Date.now()) return '#f18dcd';
  if (needsAttention(n)) return '#e9ac68';
  if (state.planned.has(n.id)) return '#b5a4f5';
  if ($('heat').checked) {
    const count = state.stats?.nodes[n.id]?.returned || 0;
    return new THREE.Color('#328b86')
      .lerp(new THREE.Color('#f6d58c'), Math.min(1, Math.log2(count + 1) / 6))
      .getStyle();
  }
  return n.kind === 'source' ? '#75b6d0' : n.kind === 'index' ? '#a1efe0' : '#4db6aa';
}

export function connectionColor(edge) {
  if (energized(edge)) return '#c9faff';
  if (scanLevel(endpoint(edge.source)) > 0.6) return '#5ad9ff';
  return state.planned.has(endpoint(edge.source)) && state.planned.has(endpoint(edge.target))
    ? '#a799ed'
    : state.focusGraph
      ? '#68b7d8'
      : '#376681';
}

export function connectionWidth(edge) {
  return energized(edge)
    ? 1.7
    : scanLevel(endpoint(edge.source)) > 0.6
      ? 1
      : state.focusGraph
        ? 0.65
        : 0.45;
}
