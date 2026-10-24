import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import { $, element } from '../lib/dom.js';
import { displayPosition, isVisible } from '../lib/layout.js';
import { navigate } from '../model/navigation.js';
import { nodeObjects, reduced, starLabels, state } from '../model/state.js';
import { color, connectionColor, connectionWidth, energized } from './colors.js';

export const placed = n => displayPosition(n, state.focusGraph, state.graph.domains);

// Pins the visible nodes at their computed positions and relabels a focused neighborhood.
export function rebuild() {
  const { graph, network, focusGraph } = state;
  if (!graph || !network) return;
  const nodes = graph.nodes
    .filter(n => (focusGraph ? focusGraph.ids.has(n.id) : isVisible(n, state)))
    .map(n => ({ ...n, ...placed(n) }));
  for (const n of nodes) {
    n.fx = n.x;
    n.fy = n.y;
    n.fz = n.z;
  }
  const ids = new Set(nodes.map(n => n.id));
  const links = graph.edges
    .filter(e => ids.has(e.source) && ids.has(e.target))
    .map(e => ({ ...e }));
  nodeObjects.clear();
  network.graphData({ nodes, links });
  network.nodeColor(color);
  if (state.galaxy) state.galaxy.visible = !focusGraph;
  network.linkDirectionalParticles(reduced.matches ? 0 : focusGraph ? 3 : 1);
  starLabels.clear();
  $('star-labels').replaceChildren();
  if (focusGraph)
    for (const id of focusGraph.neighbors) {
      const node = graph.nodes.find(n => n.id === id),
        button = element('button', node.title);
      button.className = 'star-label';
      button.onclick = () => navigate(id);
      button.title = node.title;
      starLabels.set(id, button);
      $('star-labels').append(button);
    }
}

export function resizeScene() {
  if (!state.network) return;
  const r = $('scene').getBoundingClientRect();
  state.network.width(r.width).height(r.height);
}

export function motion() {
  const { network } = state;
  if (!network) return;
  network.controls().autoRotate = false;
  if (document.hidden) network.pauseAnimation();
  else network.resumeAnimation();
}

export function createNetwork(texture) {
  const network = new ForceGraph3D($('scene'), { controlType: 'orbit' })
    .backgroundColor('#02050c')
    .showNavInfo(false)
    .nodeId('id')
    .nodeLabel(n => (state.focusGraph ? element('span', n.title) : ''))
    .nodeVal(0.15)
    .nodeRelSize(1)
    .nodeThreeObject(n => {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          color: color(n),
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      const size =
        state.focusGraph?.id === n.id
          ? 13
          : state.focusGraph
            ? 4
            : n.kind === 'index'
              ? 4
              : n.kind === 'source'
                ? 3.4
                : 2.8;
      sprite.scale.set(size, size, 1);
      sprite.userData.baseSize = size;
      nodeObjects.set(n.id, { node: n, sprite });
      return sprite;
    })
    .nodeColor(color)
    .linkColor(connectionColor)
    .linkOpacity(0.4)
    .linkWidth(connectionWidth)
    .linkDirectionalParticles(reduced.matches ? 0 : 1)
    .linkDirectionalParticleSpeed(edge =>
      energized(edge) ? 0.018 : state.searchStage === 'searching' ? 0.01 : 0.004,
    )
    .linkDirectionalParticleWidth(0.85)
    .linkDirectionalParticleColor(() => '#d3f4ff')
    .onNodeClick(n => navigate(n.id))
    .d3VelocityDecay(0.9)
    .cooldownTicks(1);
  network.cameraPosition({ x: 0, y: 0, z: 420 });
  network.controls().enableDamping = true;
  network.controls().dampingFactor = 0.08;
  return network;
}
