import { $ } from '../lib/dom.js';
import { hash } from '../lib/hash.js';
import { metricDisplays, nodeObjects, reduced, starLabels, state } from '../model/state.js';
import { color, connectionColor, connectionWidth, scanLevel } from './colors.js';
import { orbitPosition } from './galaxy.js';
import { placed } from './network.js';
import { drawHeartbeat } from '../ui/heartbeat.js';
import { searchVisual } from './search-visual.js';

let lastFrame = 0;

// Orbits the decorative dust and lights around their moving system centers.
function orbitGalaxy(galaxy, t) {
  const dust = galaxy.children[0].geometry,
    positions = dust.attributes.position,
    particles = dust.userData.particles;
  const centers = galaxy.userData.systems.map(system => orbitPosition(system, t));
  for (let i = 0; i < positions.count; i++) {
    const particle = particles[i],
      center = particle.cluster < 0 ? { x: 0, y: 0, z: 0 } : centers[particle.cluster],
      angle = particle.angle + t * particle.speed;
    positions.setXYZ(
      i,
      center.x + Math.cos(angle) * particle.radius,
      center.y + Math.sin(angle) * particle.radius * particle.flatten,
      center.z + particle.depth + Math.sin(angle) * particle.radius * 0.24,
    );
  }
  positions.needsUpdate = true;
  galaxy.userData.lights.forEach((light, i) => light.position.copy(centers[i]));
}

function pulseCorona(corona) {
  corona.visible =
    ['searching', 'found', 'captured'].includes(state.searchStage) && !reduced.matches;
  if (!corona.visible) return;
  const progress = (state.visualTime % 1500) / 1500;
  corona.material.color.set(state.searchStage === 'captured' ? '#c194ff' : '#8ceaff');
  corona.scale.setScalar(1 + progress * 18);
  corona.material.opacity = (1 - progress) * (state.searchStage === 'found' ? 0.65 : 0.3);
}

// Eases each dashboard counter toward its latest total.
function tweenMetrics(delta) {
  for (const display of metricDisplays.values())
    if (display.value !== display.target) {
      display.value = reduced.matches
        ? display.target
        : display.value + (display.target - display.value) * Math.min(1, delta / 160);
      if (Math.abs(display.target - display.value) < 0.05) display.value = display.target;
      display.number.textContent = Math.round(display.value).toLocaleString();
    }
}

export function animate(timestamp) {
  const delta = lastFrame ? Math.min(timestamp - lastFrame, 50) : 0;
  lastFrame = timestamp;
  const { network, galaxy, intakeLayer, focusGraph } = state;
  if (network && !document.hidden) {
    if (!reduced.matches) {
      state.visualTime += delta;
      const t = state.visualTime / 1000;
      if (galaxy) orbitGalaxy(galaxy, t);
      for (const n of network.graphData().nodes) {
        const p = placed(n),
          phase = hash(n.id);
        n.x = p.x + (n.id === focusGraph?.id ? 0 : Math.sin(t * 0.3 + phase) * 1.1);
        n.y = p.y + (n.id === focusGraph?.id ? 0 : Math.cos(t * 0.24 + phase) * 1.1);
      }
    }
    if (state.searchStage !== 'idle' && Date.now() > state.searchUntil) searchVisual('idle');
    const capturing = state.captureNebula?.update(delta, reduced.matches, !!focusGraph) || false;
    state.pulses?.update(delta, reduced.matches, !!focusGraph);
    state.afterglow?.update(delta, !!focusGraph);
    drawHeartbeat(state.captureNebula?.queued() || 0);
    $('capture-state').hidden = !capturing;
    document.body.classList.toggle('capture-active', capturing);
    for (const { node, sprite } of nodeObjects.values()) {
      sprite.material.color.set(color(node));
      const pulse = reduced.matches
        ? 0
        : scanLevel(node.id) +
          (state.searchStage === 'found' && state.searchFound.has(node.id)
            ? 0.5 + 0.5 * Math.sin(state.visualTime * 0.008)
            : 0);
      const size = sprite.userData.baseSize * (1 + pulse * 0.8);
      sprite.scale.set(size, size, 1);
    }
    network.nodeColor(color).linkColor(connectionColor).linkWidth(connectionWidth);
    if (galaxy?.userData.corona) pulseCorona(galaxy.userData.corona);
    if (intakeLayer) {
      intakeLayer.material.opacity = capturing ? 1 : 0.65;
      intakeLayer.material.size =
        capturing && !reduced.matches ? 4.5 + Math.sin(state.visualTime * 0.006) : 3.5;
    }
    for (const node of network.graphData().nodes) {
      const label = starLabels.get(node.id);
      if (label) {
        const point = network.graph2ScreenCoords(node.x, node.y, node.z);
        label.style.left = point.x + 'px';
        label.style.top = point.y + 13 + 'px';
      }
    }
    tweenMetrics(delta);
  }
  requestAnimationFrame(animate);
}
