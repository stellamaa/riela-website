// WaterTexture.js
import * as THREE from 'three';

const easeOutSine = (t, b, c, d) => c * Math.sin((t / d) * (Math.PI / 2)) + b;
const easeOutQuad = (t, b, c, d) => {
  t /= d;
  return -c * t * (t - 2) + b;
};

export class WaterTexture {
  constructor({ debug = false } = {}) {
    this.size = 64;
    this.radius = this.size * 0.1;
    this.width = this.height = this.size;
    this.points = [];
    this.maxAge = 64;

    if (debug) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.radius = this.width * 0.05;
    }

    this.initTexture();
    if (debug) document.body.append(this.canvas);
  }

  initTexture() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.clear();
    this.texture = new THREE.Texture(this.canvas);
  }

  clear() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  addPoint({ x, y }) {
    const last = this.points.length > 0 ? this.points[this.points.length - 1] : { x, y };
    const dx = x - last.x,
          dy = y - last.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.points.push({ x, y, age: 0, vx: dx / dist, vy: dy / dist, force: dist });
  }

  update() {
    this.clear();
    for (let i = this.points.length - 1; i >= 0; i--) {
      const p = this.points[i];
      p.age++;
      if (p.age > this.maxAge) this.points.splice(i, 1);
    }

    this.points.forEach(point => this.drawPoint(point));
    this.texture.needsUpdate = true;
  }

  drawPoint(point) {
    const ctx = this.ctx;
    const posX = point.x * this.width,
          posY = point.y * this.height;
    const intensity =
      point.age < this.maxAge * 0.3
        ? easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1)
        : easeOutQuad(
            1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7),
            0,
            1,
            1
          );
    const finalIntensity = intensity * point.force;
    const red = ((point.vx + 1) / 2) * 255;
    const green = ((point.vy + 1) / 2) * 255;
    const blue = finalIntensity * 255;
    const color = `${red},${green},${blue}`;

    const offset = this.size * 5;
    ctx.shadowOffsetX = offset;
    ctx.shadowOffsetY = offset;
    ctx.shadowBlur = this.radius * 1;
    ctx.shadowColor = `rgba(${color},${0.2 * finalIntensity})`;

    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,0,0,1)';
    ctx.arc(posX - offset, posY - offset, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
