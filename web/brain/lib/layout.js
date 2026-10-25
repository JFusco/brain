import { hash } from './hash.js';

export const INDEX_ID = 'knowledge/INDEX.md';

// Overview position: each domain owns a sector around the index, jittered by a stable hash.
export function position(n, domains) {
  const h = hash(n.id),
    d = Math.max(0, domains.indexOf(n.domain || n.domains?.[0]));
  if (n.id === INDEX_ID) return { x: 0, y: 0, z: 0 };
  const angle = (d / Math.max(1, domains.length)) * Math.PI * 2 + ((h % 1000) / 1000) * 0.65;
  const radius = 32 + (((h >>> 8) % 1000) / 1000) * 96;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    z: (((h >>> 18) % 1000) / 1000) * 35 - 17.5,
  };
}

// A domain's sector center, where its stars cluster; null for an unknown domain.
export function domainAnchor(domain, domains, radius = 80, flatten = 1) {
  const d = domains.indexOf(domain);
  if (d < 0) return null;
  const angle = (d / Math.max(1, domains.length)) * Math.PI * 2 + 0.325;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * flatten, z: 0 };
}

// Focus position: the focused star sits at the center, its neighbors on one or two rings.
export function displayPosition(n, focus, domains) {
  if (!focus) return position(n, domains);
  if (n.id === focus.id) return { x: 0, y: 0, z: 0 };
  const index = focus.neighbors.indexOf(n.id),
    angle = (index / Math.max(1, focus.neighbors.length)) * Math.PI * 2 - 0.65,
    radius = focus.neighbors.length > 12 ? (index % 2 ? 63 : 43) : 52;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * 0.84,
    z: Math.sin(angle * 2) * 12,
  };
}

// The overview shows hubs, notes and sources, plus references that searches or activity
// expanded, limited to the focused domain when one is chosen.
export function isVisible(n, { expanded, overviewReferences, focusedDomain }) {
  return (
    (n.kind === 'index' ||
      n.kind === 'curated-note' ||
      n.kind === 'source' ||
      expanded.has(n.id) ||
      overviewReferences.has(n.id)) &&
    (!focusedDomain ||
      n.domain === focusedDomain ||
      n.domains?.includes(focusedDomain) ||
      n.id === INDEX_ID)
  );
}
