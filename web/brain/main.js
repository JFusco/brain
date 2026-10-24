import './style.css';
import { $ } from './lib/dom.js';
import { eventStream } from './live/events.js';
import { loadGraph } from './live/graph.js';
import { setNavigator } from './model/navigation.js';
import { state } from './model/state.js';
import { animate } from './scene/animate.js';
import { createCaptureNebula } from './scene/capture-nebula.js';
import { createGalaxy } from './scene/galaxy.js';
import { glowTexture } from './scene/glow.js';
import { createNetwork, motion, rebuild, resizeScene } from './scene/network.js';
import { bindControls } from './ui/controls.js';
import { choose } from './ui/details.js';
import { createGuidance } from './ui/guidance.js';
import { intake } from './ui/intake.js';
import { metrics } from './ui/metrics.js';
import { bindSearch } from './ui/search.js';

setNavigator(choose);
bindSearch();
bindControls();
state.guidance = createGuidance();
try {
  await loadGraph();
  const texture = glowTexture();
  state.network = createNetwork(texture);
  state.galaxy = createGalaxy(texture, state.network.scene());
  state.captureNebula = createCaptureNebula(texture, state.network.scene());
  window.addEventListener('resize', resizeScene);
  resizeScene();
  rebuild();
  motion();
  requestAnimationFrame(animate);
  eventStream();
  await metrics();
  await intake();
  $('status').textContent = 'Search committed knowledge. Paths show evidence connections.';
  setInterval(() => {
    if (!document.hidden)
      loadGraph().catch(() => {
        $('status').textContent = 'Knowledge refresh unavailable; showing the last snapshot.';
      });
  }, 5000);
  setInterval(() => {
    if (!document.hidden) {
      metrics();
      intake();
    }
  }, 10000);
} catch (error) {
  $('status').textContent =
    `Visualization unavailable: ${error.message}. Knowledge search remains available when the local server is healthy.`;
}
