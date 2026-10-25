import * as THREE from 'three';
import { captureDuration } from '../lib/activity.js';

// Untargeted captures converge on the galaxy rim; targeted ones condense at their domain sector.
const SPREAD = { start: 265, end: 146, step: 4, depth: 100, cloud: 1, ring: 158 },
  SECTOR = { start: 90, end: 4, step: 1.5, depth: 40, cloud: 0.4, ring: 42 };

// A bounded decorative response to capture metadata, never published graph nodes. Captures
// queue, so each one plays to completion before the next begins.
export function createCaptureNebula(texture, scene) {
  const group = new THREE.Group(),
    clouds = [],
    queue = [],
    positions = new Float32Array(96 * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: texture,
      color: '#e1bcff',
      size: 5,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  group.add(stars);
  for (let i = 0; i < 9; i++) {
    const cloud = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        color: i % 2 ? '#6a98ff' : '#bb65ee',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    clouds.push(cloud);
    group.add(cloud);
  }
  const ring = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(
      Array.from(
        { length: 128 },
        (_, i) =>
          new THREE.Vector3(Math.cos((i * Math.PI) / 64), Math.sin((i * Math.PI) / 64) * 0.85, 0),
      ),
    ),
    new THREE.LineBasicMaterial({
      color: '#deacff',
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  group.add(ring);
  group.visible = false;
  group.frustumCulled = false;
  scene.add(group);
  let current = null,
    elapsed = 0;
  // Starts the next queued capture; a long backlog plays shorter versions to catch up.
  const next = () => {
    const waiting = queue.length - 1;
    current = queue.shift() || null;
    elapsed = 0;
    if (!current) return false;
    current.duration = captureDuration(waiting);
    group.visible = true;
    return true;
  };
  return {
    trigger(target = null) {
      queue.push({ target });
    },
    queued: () => queue.length,
    update(delta, reduced, focused) {
      if (!current && !next()) {
        group.visible = false;
        return false;
      }
      elapsed = Math.min(current.duration, elapsed + delta);
      const { duration, target } = current,
        shape = target && !focused ? SECTOR : SPREAD,
        time = elapsed * (8000 / duration),
        progress = elapsed / duration;
      group.position.set(focused ? 0 : target?.x || 0, focused ? 0 : target?.y || 0, 0);
      group.scale.setScalar(focused ? 0.45 : 1);
      const envelope = reduced
        ? 0.45
        : Math.sin(Math.PI * Math.min(1, progress * 2)) * 0.5 + Math.sin(Math.PI * progress) * 0.5;
      for (let i = 0; i < positions.length / 3; i++) {
        const travel = reduced ? 1 : Math.min(1, Math.max(0, (time - (i % 12) * 65) / 2400)),
          ease = 1 - Math.pow(1 - travel, 3);
        const angle = i * 2.399 + (1 - ease) * 1.7,
          radius = shape.start + (shape.end + (i % 7) * shape.step - shape.start) * ease;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius * 0.85;
        positions[i * 3 + 2] = (1 - ease) * shape.depth + Math.sin(i * 1.7) * 12 * shape.cloud;
      }
      geometry.attributes.position.needsUpdate = true;
      stars.material.opacity = reduced
        ? 0.7
        : Math.min(1, time / 180) * (1 - Math.pow(progress, 3));
      stars.material.size = reduced ? 4 : 4 + Math.sin(Math.PI * progress) * 3;
      clouds.forEach((cloud, i) => {
        const angle = i * 2.399 + (reduced ? 0 : progress * 0.55),
          radius = (35 + (i % 3) * 30) * shape.cloud;
        cloud.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.75,
          -15 + (i % 3) * 8,
        );
        cloud.scale.set(
          (95 + (reduced ? 20 : progress * 100)) * shape.cloud,
          (75 + (reduced ? 20 : progress * 75)) * shape.cloud,
          1,
        );
        cloud.material.opacity = 0.48 * envelope;
      });
      ring.visible = !reduced;
      ring.scale.setScalar(18 * shape.cloud + Math.min(1, time / 3600) * shape.ring);
      ring.material.opacity = (1 - Math.min(1, time / 4800)) * 0.75;
      if (elapsed >= duration) current = null;
      return true;
    },
  };
}
