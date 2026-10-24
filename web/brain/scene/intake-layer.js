import * as THREE from 'three';
import { hash } from '../lib/hash.js';
import { state } from '../model/state.js';

// Violet points on the galaxy rim, up to 12 per domain, for captures awaiting curation.
// Rebuilt only when the pending counts change.
export function renderIntakeLayer(pending) {
  const { galaxy } = state,
    signature = JSON.stringify(pending);
  if (!galaxy || signature === state.intakeSignature) return;
  state.intakeSignature = signature;
  if (state.intakeLayer) {
    galaxy.remove(state.intakeLayer);
    state.intakeLayer.geometry.dispose();
    state.intakeLayer.material.dispose();
  }
  const points = [],
    domains = Object.entries(pending);
  for (let d = 0; d < domains.length; d++) {
    const count = Math.min(domains[d][1], 12),
      angle = (d / Math.max(domains.length, 1)) * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const jitter = hash(domains[d][0] + i),
        a = angle + ((jitter % 100) / 100 - 0.5) * 0.18,
        radius = 161 + (((jitter >>> 9) % 100) / 100) * 15;
      points.push(
        Math.cos(a) * radius,
        Math.sin(a) * radius * 0.85,
        (((jitter >>> 18) % 100) / 100) * 28 - 14,
      );
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  state.intakeLayer = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: galaxy.children[0].material.map,
      color: '#bf86ff',
      size: 3.5,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  galaxy.add(state.intakeLayer);
}
