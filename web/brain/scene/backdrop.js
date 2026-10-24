import * as THREE from 'three';
import { hash } from '../lib/hash.js';
import { glowSprite } from './glow.js';

// Faint clouds, the bright core and its halo, added to the galaxy group.
export function addNebulae(group, texture) {
  for (let i = 0; i < 9; i++) {
    const cloud = glowSprite(texture, i % 2 ? '#466ca7' : '#71548f', 0.05);
    const angle = i * 2.399;
    cloud.position.set(Math.cos(angle) * 90, Math.sin(angle) * 65, -35);
    cloud.scale.set(95, 70, 1);
    group.add(cloud);
  }
  const core = glowSprite(texture, '#fff0d5', 0.85);
  core.scale.set(21, 21, 1);
  group.add(core);
  const halo = glowSprite(texture, '#8dbbe4', 0.15);
  halo.scale.set(58, 58, 1);
  group.add(halo);
}

// A fixed field of distant stars behind the galaxy.
export function addBackgroundStars(scene, texture) {
  const stars = [],
    starColors = [];
  for (let i = 0; i < 1800; i++) {
    const h = hash('star:' + i),
      j = hash('star-z:' + i);
    stars.push(
      ((h % 10000) / 10000) * 1000 - 500,
      (((h >>> 12) % 10000) / 10000) * 700 - 350,
      -80 - ((j % 1000) / 1000) * 200,
    );
    const c = new THREE.Color(i % 7 ? '#91b6dd' : '#f3dbb8');
    starColors.push(c.r, c.g, c.b);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
  starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
  scene.add(
    new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        size: 1.5,
        map: texture,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      }),
    ),
  );
}
