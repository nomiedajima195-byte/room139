import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

// --- 初期化 ---
const canvas = document.querySelector('#canvas');
const app = document.querySelector('#app');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// --- シェーダー：静かな粒子の霧 ---
const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float t = uTime * 0.15; // よりゆったりとした動き

    vec3 colorA = vec3(0.85, 0.92, 1.0); // 澄んだ水色
    vec3 colorB = vec3(1.0, 0.88, 0.92); // 淡いピーチ
    vec3 colorC = vec3(0.92, 0.88, 1.0); // 薄いラベンダー

    float n1 = sin(uv.x * 1.5 + t) * 0.5 + 0.5;
    float n2 = cos(uv.y * 2.0 - t * 0.4) * 0.5 + 0.5;
    
    vec3 color = mix(colorA, colorB, n1);
    color = mix(color, colorC, n2);

    // 目に優しい、動かない粒子
    float grain = (random(uv) - 0.5) * 0.012;
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

// --- ログ生成ロジック ---
window.addEventListener('click', (e) => {
  // すでに入力中のものがあれば確定させずに消す
  const currentInput = document.querySelector('.temp-input');
  if (currentInput) {
    currentInput.remove();
    return;
  }

  const input = document.createElement('input');
  input.className = 'temp-input';
  input.type = 'text';
  input.style.left = `${e.clientX}px`;
  input.style.top = `${e.clientY}px`;
  
  app.appendChild(input);
  input.focus();

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
  node.style.opacity = '0';
  node.style.filter = 'blur(8px)';
  
  app.appendChild(node);
  
  // 登場アニメーション
  setTimeout(() => {
    node.style.opacity = '1';
    node.style.filter = 'blur(0px)';
    animateNode(node, x, y);
  }, 20);
}

function animateNode(node, startX, startY) {
  let startTime = Date.now();
  // 個体ごとに少しずつ違う動きをさせるためのランダム係数
  const randX = Math.random() * 0.5 + 0.5;
  const randY = Math.random() * 0.5 + 0.5;

  function update() {
    let elapsed = (Date.now() - startTime) * 0.001;
    // 139（Room 139）のゆったりとした浮遊
    let dx = Math.sin(elapsed * 0.4 * randX) * 15;
    let dy = Math.cos(elapsed * 0.3 * randY) * 15;
    
    node.style.left = `${startX + dx}px`;
    node.style.top = `${startY + dy}px`;
    
    requestAnimationFrame(update);
  }
  update();
}

// --- ループとリサイズ ---
function animate(time) {
  material.uniforms.uTime.value = time * 0.001;
  material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(animate);