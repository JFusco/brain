import * as THREE from 'three';
import { glowSprite } from './glow.js';

// Each kind: color, lifetime, whether a comet travels from the core, ring and bloom sizes.
export const PULSES = {
  search: { color: '#8ceaff', ms: 2600, travel: true, ring: 26, bloom: 30 },
  found: { color: '#c9faff', ms: 2200, travel: false, ring: 18, bloom: 38 },
  empty: { color: '#8a9bb0', ms: 2000, travel: false, ring: 22, bloom: 14 },
  error: { color: '#e98a7f', ms: 2000, travel: false, ring: 22, bloom: 14 },
  read: { color: '#a3ffe1', ms: 1600, travel: false, ring: 7, bloom: 12 },
  cited: { color: '#ffdf9e', ms: 1600, travel: false, ring: 7, bloom: 12 },
};
const POOL = 8,
  TRAVEL_MS = 900;

const ringGeometry = new THREE.BufferGeometry().setFromPoints(
  Array.from(
    { length: 65 },
    (_, i) => new THREE.Vector3(Math.cos((i * Math.PI) / 32), Math.sin((i * Math.PI) / 32), 0),
  ),
);

// A fixed pool of short pulses; the oldest is reused when every slot is busy.
export function createPulses(texture, scene) {
  const slots = Array.from({ length: POOL }, () => {
    const group = new THREE.Group(),
      bloom = glowSprite(texture, '#ffffff', 0),
      comet = glowSprite(texture, '#ffffff', 0),
      ring = new THREE.LineLoop(
        ringGeometry,
        new THREE.LineBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
    group.add(bloom, comet, ring);
    group.visible = false;
    group.frustumCulled = false;
    scene.add(group);
    return {
      group,
      bloom,
      comet,
      ring,
      kind: null,
      age: 0,
      exact: false,
      target: new THREE.Vector3(),
    };
  });
  return {
    // An exact target is a star's displayed position; domain and core targets shrink with focus.
    emit(kind, target, exact = false) {
      const config = PULSES[kind];
      if (!config) return;
      const slot = slots.find(s => !s.kind) || slots.reduce((a, b) => (a.age > b.age ? a : b));
      slot.kind = kind;
      slot.age = 0;
      slot.exact = exact;
      slot.target.set(target?.x || 0, target?.y || 0, target?.z || 0);
      for (const part of [slot.bloom, slot.comet, slot.ring]) part.material.color.set(config.color);
      slot.group.visible = true;
    },
    update(delta, reduced, focused) {
      for (const slot of slots) {
        if (!slot.kind) continue;
        const config = PULSES[slot.kind];
        slot.age += delta;
        if (slot.age >= config.ms) {
          slot.kind = null;
          slot.group.visible = false;
          continue;
        }
        const scale = focused ? 0.45 : 1,
          // Reduced motion: a static flash at the target, without travel or expansion.
          travel = reduced || !config.travel ? 1 : Math.min(1, slot.age / TRAVEL_MS),
          local = reduced || !config.travel ? slot.age : Math.max(0, slot.age - TRAVEL_MS),
          life = Math.min(1, local / Math.max(1, config.ms - (config.travel ? TRAVEL_MS : 0)));
        slot.group.position.copy(slot.target).multiplyScalar(slot.exact ? 1 : scale);
        slot.comet.visible = !reduced && config.travel && travel < 1;
        slot.comet.position.copy(slot.group.position).multiplyScalar(travel - 1);
        slot.comet.scale.setScalar(6 * scale);
        slot.comet.material.opacity = 0.9;
        const arrived = travel >= 1;
        slot.bloom.visible = slot.ring.visible = arrived;
        if (!arrived) continue;
        slot.bloom.scale.setScalar(config.bloom * scale * (reduced ? 1 : 0.6 + life * 0.4));
        slot.bloom.material.opacity = reduced ? (life < 0.6 ? 0.55 : 0) : 0.55 * (1 - life);
        slot.ring.visible = !reduced;
        slot.ring.scale.setScalar(config.ring * scale * (0.2 + life));
        slot.ring.material.opacity = 0.7 * (1 - life);
      }
    },
  };
}

// A faint glow per domain that fades over about a minute; repeated activity raises it to a cap.
export function createAfterglow(texture, scene) {
  const glows = new Map();
  return {
    bump(domain, anchor, color) {
      if (!domain || !anchor) return;
      let glow = glows.get(domain);
      if (!glow) {
        glow = { sprite: glowSprite(texture, color, 0), level: 0 };
        glow.sprite.position.set(anchor.x, anchor.y, -8);
        glow.sprite.scale.set(70, 70, 1);
        scene.add(glow.sprite);
        glows.set(domain, glow);
      }
      glow.sprite.material.color.set(color);
      glow.level = Math.min(1, glow.level + 0.4);
    },
    update(delta, focused) {
      for (const glow of glows.values()) {
        glow.level *= Math.exp(-delta / 20000);
        glow.sprite.visible = !focused && glow.level > 0.01;
        glow.sprite.material.opacity = 0.32 * glow.level;
      }
    },
  };
}
