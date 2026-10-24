import * as THREE from 'three';
import { hash } from '../lib/hash.js';
import { addBackgroundStars, addNebulae } from './backdrop.js';
import { glowSprite } from './glow.js';

export function orbitPosition(system, time = 0) {
  const angle = system.angle + time * system.speed;
  return new THREE.Vector3(
    Math.cos(angle) * system.radius,
    Math.sin(angle) * system.radius * Math.cos(system.tilt),
    Math.sin(angle) * system.radius * Math.sin(system.tilt),
  );
}

// Central dust plus seven orbiting star systems. children[0] is the dust cloud that the
// animation loop moves; userData carries the systems, their lights and the search corona.
export function createGalaxy(texture, scene) {
  const group = new THREE.Group(),
    positions = [],
    colors = [],
    particles = [];
  const systems = Array.from({ length: 7 }, (_, i) => ({
    radius: 48 + i * 15,
    angle: i * 2.399,
    tilt: (i % 2 ? 1 : -1) * (0.38 + i * 0.06),
    speed: (i % 2 ? 1 : -1) * (0.009 + i * 0.002),
  }));
  for (let i = 0; i < 3300; i++) {
    const h = hash('system-star:' + i),
      j = hash('system-depth:' + i),
      cluster = i < 1900 ? -1 : i % systems.length;
    const radius =
      cluster < 0
        ? 12 + Math.pow((h % 100000) / 100000, 0.55) * 143
        : Math.pow((h % 100000) / 100000, 1.8) * 19;
    const particle = {
      cluster,
      radius,
      angle: ((j % 10000) / 10000) * Math.PI * 2,
      flatten: cluster < 0 ? 0.55 + (h % 100) / 180 : 0.7,
      depth: (((h >>> 12) % 1000) / 1000) * (cluster < 0 ? 94 : 18) - (cluster < 0 ? 47 : 9),
      speed: (cluster < 0 ? 0.004 : 0.025) + (h % 100) / 5000,
    };
    particles.push(particle);
    const center = cluster < 0 ? new THREE.Vector3() : orbitPosition(systems[cluster]);
    positions.push(
      center.x + Math.cos(particle.angle) * radius,
      center.y + Math.sin(particle.angle) * radius * particle.flatten,
      center.z + particle.depth + Math.sin(particle.angle) * radius * 0.24,
    );
    const c = new THREE.Color(
      cluster < 0 ? (i % 5 ? '#8fbee8' : '#e8d3b9') : cluster % 2 ? '#a0dffe' : '#c3b5f5',
    );
    colors.push(c.r, c.g, c.b);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.userData.particles = particles;
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  group.add(
    new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 2.2,
        map: texture,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  // Decorative star systems have independent, inclined orbits; they are not knowledge or activity.
  const lights = [];
  for (const [i, system] of systems.entries()) {
    const points = Array.from({ length: 181 }, (_, step) =>
      orbitPosition({ ...system, angle: (step * Math.PI) / 90 }),
    );
    const orbit = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: i % 2 ? '#7ba4cd' : '#b0adcc',
        transparent: true,
        opacity: 0.12,
      }),
    );
    group.add(orbit);
    const light = glowSprite(texture, i % 2 ? '#a6e2ff' : '#d2bffa', 0.8);
    light.position.copy(orbitPosition(system));
    light.scale.set(9 + (i % 3) * 2, 9 + (i % 3) * 2, 1);
    lights.push(light);
    group.add(light);
  }
  group.userData.systems = systems;
  group.userData.lights = lights;
  const coronaPoints = Array.from(
    { length: 97 },
    (_, i) =>
      new THREE.Vector3(Math.cos((i * Math.PI) / 48) * 8, Math.sin((i * Math.PI) / 48) * 8, 0),
  );
  const corona = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(coronaPoints),
    new THREE.LineBasicMaterial({
      color: '#8ceaff',
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  corona.visible = false;
  group.add(corona);
  group.userData.corona = corona;
  addNebulae(group, texture);
  scene.add(group);
  addBackgroundStars(scene, texture);
  return group;
}
