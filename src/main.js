import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

// --- シーン設定 ---
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// --- 霧のシェーダー（Fragment Shader） ---
// ここでザラザラ感と色の混ざり具合を計算しているよ
const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;

  // ノイズ関数（ザラザラとムラを作る）
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float t = uTime * 0.2;

    // パステルカラーの定義
    vec3 colorA = vec3(0.8, 0.9, 1.0); // ミント/スカイ
    vec3 colorB = vec3(1.0, 0.85, 0.9); // ピーチ/ピンク
    vec3 colorC = vec3(0.9, 0.8, 1.0); // ラベンダー

    // ゆっくり混ざり合う動き
    float mixValue = sin(uv.x * 2.0 + t) * 0.5 + 0.5;
    mixValue += cos(uv.y * 3.0 - t) * 0.2;
    
    vec3 finalColor = mix(colorA, colorB, mixValue);
    finalColor = mix(finalColor, colorC, sin(t * 0.5) * 0.5 + 0.5);

    // 【重要】ザラザラした粒子感（グレイン）を加える
    float grain = (random(uv + t) - 0.5) * 0.07;
    finalColor += grain;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// --- メッシュ作成 ---
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

// リサイズ対応
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(animate);