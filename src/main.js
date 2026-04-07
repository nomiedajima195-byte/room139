import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

// --- シーン・レンダラー設定 ---
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// --- 背景の霧（シェーダー） ---
const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float t = uTime * 0.2;

    vec3 colorA = vec3(0.8, 0.9, 1.0); 
    vec3 colorB = vec3(1.0, 0.85, 0.9);
    vec3 colorC = vec3(0.9, 0.8, 1.0);

    float n1 = sin(uv.x * 2.0 + t) * 0.5 + 0.5;
    float n2 = cos(uv.y * 3.0 - t * 0.5) * 0.5 + 0.5;
    
    vec3 color = mix(colorA, colorB, n1);
    color = mix(color, colorC, n2);

    // 目に優しい、動かない静かな粒子
    float grain = (random(uv) - 0.5) * 0.015;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  },
  fragmentShader
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// --- アニメーションループ ---
function animate(time) {
  material.uniforms.uTime.value = time * 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// --- ログ（ノード）作成機能 ---
const app = document.querySelector('#app');

window.addEventListener('click', (e) => {
  // すでに入力中のボックスがあれば削除（一つずつ作る）
  const oldInput = document.querySelector('.temp-input');
  if (oldInput) oldInput.remove();

  // 入力欄を作成
  const input = document.createElement('input');
  input.className = 'temp-input';
  input.type = 'text';
  input.style.left = `${e.clientX}px`;
  input.style.top = `${e.clientY}px`;
  
  app.appendChild(input);
  input.focus();

  // エンターキーで確定
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && input.value.trim() !== '') {
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
  
  // ふわっと出現させるためのアニメーション
  node.style.opacity = '0';
  app.appendChild(node);
  
  setTimeout(() => {
    node.style.opacity = '0.7';
  }, 10);
}

// リサイズ対応
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});