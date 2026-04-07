import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

// --- 背景（パステル・グレイン） ---
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec3 c1 = vec3(0.9, 0.95, 1.0);
    vec3 c2 = vec3(1.0, 0.9, 0.95);
    float n = sin(uv.x * 2.0 + uTime * 0.2) * 0.5 + 0.5;
    vec3 color = mix(c1, c2, n);
    color += (random(uv) - 0.5) * 0.015; // 静止グレイン
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

// --- インタラクション：ブロック積み ---
const container = document.querySelector('#block-container');
const colors = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'];

window.addEventListener('click', (e) => {
  // 画像や既存ブロック以外の場所をクリックしたらブロック追加
  if (e.target.tagName === 'HTML' || e.target.id === 'app' || e.target.id === 'canvas') {
    const block = document.createElement('div');
    block.className = 'block';
    // ランダムな色をパレットから選ぶ
    block.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    container.appendChild(block);
    
    // 落ちてくるような演出
    block.style.transform = 'translateY(-20px)';
    setTimeout(() => { block.style.transform = 'translateY(0)'; }, 50);
  }
});

window.addEventListener('resize', () => renderer.setSize(window.innerWidth, window.innerHeight));