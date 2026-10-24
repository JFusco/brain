// Stable FNV-1a hash for deterministic layout and decorative jitter.
export const hash = s => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
};
