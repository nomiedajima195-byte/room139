import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

const canvas = document.querySelector('#canvas');
const app = document.querySelector('#app');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float t = uTime * 0.15;
    vec3 c1 = vec3(0.85, 0.9, 1.0);
    vec3 c2 = vec3(1.0, 0.85, 0.9);
    vec3 c3 = vec3(0.9, 0.85, 1.0);
    float n1 = sin(uv.x * 2.0 + t) * 0.5 + 0.5;
    float n2 = cos(uv.y * 2.0 - t * 0.6) * 0.5 + 0.5;
    vec3 color = mix(c1, c2, n1);
    color = mix(color, c3, n2);
    color += (random(uv) - 0.5) * 0.012;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const material = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uResolution: { value: new THREE.Vector2() } },
  fragmentShader
});
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

function animate(time) {
  material.uniforms.uTime.value = time * 0.001;
  material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// ログ生成
app.addEventListener('click', (e) => {
  if (e.target !== app) return;
  const old = document.querySelector('.temp-input');
  if (old) old.remove();

  const input = document.createElement('input');
  input.className = 'temp-input';
  input.style.left = `${e.clientX}px`;
  input.style.top = `${e.clientY}px`;
  app.appendChild(input);
  input.focus();

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && input.value.trim()) {
      createNode(input.value, e.clientX, e.clientY);
      input.remove();
    }
  });
});

function createNode(text, x, y) {
  const node = document.createElement('div');
  node.className = 'node';
  node.innerText = text;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  app.appendChild(node);

  let start = Date.now();
  const rx = Math.random() * 0.5 + 0.5;
  const ry = Math.random() * 0.5 + 0.5;

  function drift() {
    let elapsed = (Date.now() - start) * 0.001;
    node.style.left = `${x + Math.sin(elapsed * 0.4 * rx) * 20}px`;
    node.style.top = `${y + Math.cos(elapsed * 0.3 * ry) * 20}px`;
    requestAnimationFrame(drift);
  }
  drift();
}

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});