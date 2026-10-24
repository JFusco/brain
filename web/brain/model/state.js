// The viewer's shared mutable state. Modules read and update it; nothing here renders.
export const reduced = matchMedia('(prefers-reduced-motion: reduce)');

export const state = {
  graph: null,
  lastGraph: undefined,
  known: new Set(),
  stats: null,
  // Scene objects, created once at startup.
  network: null,
  galaxy: null,
  captureNebula: null,
  intakeLayer: null,
  intakeSignature: '',
  guidance: null,
  // Selection and overview filtering.
  selected: null,
  focusGraph: null,
  focusedDomain: '',
  expanded: new Set(),
  overviewReferences: new Set(),
  // Transient highlights, keyed by node id with an expiry time where they fade.
  active: new Map(),
  activeKinds: new Map(),
  fresh: new Map(),
  planned: new Set(),
  liveEvents: [],
  // Search animation.
  visualTime: 0,
  searchStage: 'idle',
  searchUntil: 0,
  searchFound: new Set(),
  searchEdges: new Set(),
  externalSearchTimer: undefined,
};

export const nodeObjects = new Map(),
  metricDisplays = new Map(),
  starLabels = new Map(),
  externalSessions = new Map();
