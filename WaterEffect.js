// WaterEffect.js
import * as THREE from 'three';
import { Effect } from 'postprocessing'; // install via npm

const fragment = `
uniform sampler2D uTexture;
void mainUv(inout vec2 uv) {
  vec4 tex = texture2D(uTexture, uv);
  float vx = -(tex.r * 2. - 1.);
  float vy = -(tex.g * 2. - 1.);
  float intensity = tex.b;
  float maxAmp = 0.2;
  uv.x += vx * intensity * maxAmp;
  uv.y += vy * intensity * maxAmp;
}
`;

export class WaterEffect extends Effect {
  constructor(texture) {
    super('WaterEffect', fragment, {
      uniforms: new Map([['uTexture', new THREE.Uniform(texture)]])
    });
  }
}
