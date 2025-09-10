// main.js
import * as THREE from 'th';
import { WaterTexture } from 'WaterTexture.js';
import { WaterEffect } from 'WaterEffect.js';
import { EffectComposer, RenderPass, EffectPass } from 'postprocessing';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.append(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const waterTex = new WaterTexture();
const geometry = new THREE.PlaneGeometry(5, 5);
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const waterEffect = new WaterEffect(waterTex.texture);
const waterPass = new EffectPass(camera, waterEffect);
renderPass.renderToScreen = false;
waterPass.renderToScreen = true;
composer.addPass(renderPass);
composer.addPass(waterPass);

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

window.addEventListener('mousemove', e => {
  waterTex.addPoint({
    x: e.clientX / window.innerWidth,
    y: 1 - e.clientY / window.innerHeight
  });
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  waterTex.update();
  composer.render(clock.getDelta());
}

animate();
