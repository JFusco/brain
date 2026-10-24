import * as THREE from 'three';

// The soft radial sprite every star, cloud and particle is drawn with.
export function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const context = canvas.getContext('2d'),
    gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, '#fff');
  gradient.addColorStop(0.12, '#fff');
  gradient.addColorStop(0.3, '#ffffff99');
  gradient.addColorStop(1, '#ffffff00');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export function glowSprite(texture, color, opacity) {
  return new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}
