import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    // 画面の座標を 0.0 〜 1.0 に変換
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float t = uTime * 0.3;

    // パステルカラー（少し色味を調整したよ）
    vec3 colorA = vec3(0.7, 0.85, 1.0); // 水色
    vec3 colorB = vec3(1.0, 0.8, 0.9);  // ピンク
    vec3 colorC = vec3(0.85, 0.7, 1.0); // 紫

    // ゆっくり波打つような混ざり方
    float noise1 = sin(uv.x * 3.0 + t) * 0.5 + 0.5;
    float noise2 = cos(uv.y * 2.0 - t * 0.8) * 0.5 + 0.5;
    
    vec3 color = mix(colorA, colorB, noise1);
    color = mix(color, colorC, noise2);

    // ザラザラした質感（グレイン）
    float grain = (random(uv + t) - 0.5) * 0.08;
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

function animate(time) {
  material.uniforms.uTime.value = time * 0.001;
  // リサイズに追従させるための念押し
  material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(animate);