import { $ } from '../lib/dom.js';
import { reduced } from '../model/state.js';
import { PULSES } from '../scene/pulse.js';

const WINDOW_MS = 5 * 60 * 1000,
  COLORS = {
    ...Object.fromEntries(Object.entries(PULSES).map(([kind, pulse]) => [kind, pulse.color])),
    capture: '#c194ff',
  },
  beats = [];
let drawn = 0;

// Records one blip; the strip keeps the last five minutes of activity.
export function heartbeat(kind) {
  if (!COLORS[kind]) return;
  beats.push({ at: Date.now(), color: COLORS[kind] });
  while (beats.length > 240) beats.shift();
  drawn = 0;
}

// Redraws at most five times a second; new blips swell briefly unless motion is reduced.
export function drawHeartbeat(queued) {
  const now = Date.now(),
    canvas = $('heartbeat');
  $('heartbeat-queue').hidden = !queued;
  $('heartbeat-queue').textContent = queued ? `+${queued} queued` : '';
  if (!canvas || now - drawn < 200) return;
  drawn = now;
  const ratio = devicePixelRatio || 1,
    width = canvas.clientWidth,
    height = canvas.clientHeight;
  if (canvas.width !== width * ratio) canvas.width = width * ratio;
  if (canvas.height !== height * ratio) canvas.height = height * ratio;
  const context = canvas.getContext('2d'),
    middle = height / 2;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  context.globalAlpha = 0.35;
  context.strokeStyle = '#5d86a6';
  context.beginPath();
  context.moveTo(0, middle);
  context.lineTo(width, middle);
  context.stroke();
  for (const beat of beats) {
    const age = now - beat.at;
    if (age > WINDOW_MS) continue;
    const x = width - (age / WINDOW_MS) * width,
      swell = reduced.matches ? 0 : Math.max(0, 1 - age / 1500),
      peak = middle - 3 - swell * (middle - 4);
    context.globalAlpha = Math.max(0.3, 1 - age / WINDOW_MS);
    context.strokeStyle = beat.color;
    context.beginPath();
    context.moveTo(x - 2.5, middle);
    context.lineTo(x, peak);
    context.lineTo(x + 2.5, middle);
    context.stroke();
  }
  context.globalAlpha = 1;
}
