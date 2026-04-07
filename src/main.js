import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

// --- 初期化 ---
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// --- シェーダー：パステル・静止グレイン ---
const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float t = uTime * 0.15; // ゆったりとした動き

    vec3 c1 = vec3(0.9, 0.95, 1.0); // 水色
    vec3 c2 = vec3(1.0, 0.9, 0.95);  // ピンク
    vec3 c3 = vec3(0.95, 0.9, 1.0);  // ラベンダー

    float n1 = sin(uv.x * 1.5 + t) * 0.5 + 0.5;
    float n2 = cos(uv.y * 2.0 - t * 0.4) * 0.5 + 0.5;
    
    vec3 color = mix(c1, c2, n1);
    color = mix(color, c3, n2);

    // 目に優しい、動かない粒子
    float grain = (random(uv) - 0.5) * 0.015;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  },
  fragmentShader
});
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

// --- アニメーションループ ---
function animate(time) {
  material.uniforms.uTime.value = time * 0.001;
  material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// リサイズ対応
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(animate);