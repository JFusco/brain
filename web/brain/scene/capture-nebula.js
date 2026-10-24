import * as THREE from 'three';

// A bounded decorative response to capture metadata, never published graph nodes.
export function createCaptureNebula(texture, scene) {
  const group = new THREE.Group(),
    clouds = [],
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
  let elapsed = 8000;
  return {
    trigger() {
      elapsed = 0;
      group.visible = true;
    },
    update(delta, reduced, focused) {
      if (elapsed >= 8000) {
        group.visible = false;
        return false;
      }
      elapsed = Math.min(8000, elapsed + delta);
      group.scale.setScalar(focused ? 0.45 : 1);
      const progress = elapsed / 8000,
        envelope = reduced
          ? 0.45
          : Math.sin(Math.PI * Math.min(1, progress * 2)) * 0.5 +
            Math.sin(Math.PI * progress) * 0.5;
      for (let i = 0; i < positions.length / 3; i++) {
        const travel = reduced ? 1 : Math.min(1, Math.max(0, (elapsed - (i % 12) * 65) / 2400)),
          ease = 1 - Math.pow(1 - travel, 3);
        const angle = i * 2.399 + (1 - ease) * 1.7,
          radius = 265 + (146 + (i % 7) * 4 - 265) * ease;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius * 0.85;
        positions[i * 3 + 2] = (1 - ease) * 100 + Math.sin(i * 1.7) * 12;
      }
      geometry.attributes.position.needsUpdate = true;
      stars.material.opacity = reduced
        ? 0.7
        : Math.min(1, elapsed / 180) * (1 - Math.pow(progress, 3));
      stars.material.size = reduced ? 4 : 4 + Math.sin(Math.PI * progress) * 3;
      clouds.forEach((cloud, i) => {
        const angle = i * 2.399 + (reduced ? 0 : progress * 0.55),
          radius = 35 + (i % 3) * 30;
        cloud.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.75,
          -15 + (i % 3) * 8,
        );
        cloud.scale.set(
          95 + (reduced ? 20 : progress * 100),
          75 + (reduced ? 20 : progress * 75),
          1,
        );
        cloud.material.opacity = 0.48 * envelope;
      });
      ring.visible = !reduced;
      ring.scale.setScalar(18 + Math.min(1, elapsed / 3600) * 158);
      ring.material.opacity = (1 - Math.min(1, elapsed / 4800)) * 0.75;
      return true;
    },
  };
}
