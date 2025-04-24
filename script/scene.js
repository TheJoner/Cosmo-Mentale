import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Base setup
 */
const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({ antialias: window.devicePixelRatio < 2 });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Controls
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2.5;
controls.maxDistance = 10.5;
controls.enableRotate = false;
controls.enablePan = false;
controls.enableDamping = true;

/**
 * Lights
 */
const light = new THREE.AmbientLight(0x898989, 0.2);
const light1 = new THREE.HemisphereLight(0x5c1c69, 0xac8080, 4);
const light2 = new THREE.DirectionalLight(0x0000ff, 2);
light2.position.set(-2, 10, 4);
scene.add(light, light1, light2);

/**
 * Load Brain model
 */
const loader = new GLTFLoader();
let brain = new THREE.Group();

loader.load('/data/models/cervello.glb', function (gltf) {
  brain.add(gltf.scene);
  scene.add(brain);
}, undefined, function (error) {
  console.error(error);
});

/**
 * Galaxy
 */
const parameters = {
  size: 0.01,
  count: 17000,
  branches: 10,
  radius: 4,
  spin: 1,
  randomness: 0.8,
  randomnessPower: 1,
  insideColor: 0xfb7c27,
  outsideColor: 0x783bf4,
};

let points;
let pointGeometry;
let pointMaterial;

function generateGalaxy() {
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  if (points) {
    scene.remove(points);
    pointGeometry.dispose();
    pointMaterial.dispose();
  }

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const branchAngle = ((i % parameters.branches) / parameters.branches) * (Math.PI * 2);
    const radius = Math.pow(Math.random(), parameters.randomnessPower) * parameters.radius;
    const spin = radius + parameters.spin;

    const currentColor = colorInside.clone();
    currentColor.lerp(colorOutside, radius / parameters.radius);

    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * radius * parameters.randomness;
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * radius * parameters.randomness;
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * radius * parameters.randomness;

    positions[i3] = Math.cos(branchAngle + spin) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spin) * radius + randomZ;

    colors[i3] = currentColor.r;
    colors[i3 + 1] = currentColor.g;
    colors[i3 + 2] = currentColor.b;
  }

  pointGeometry = new THREE.BufferGeometry();
  pointMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  points = new THREE.Points(pointGeometry, pointMaterial);
  scene.add(points);
}

generateGalaxy();

//Frasi AFK
let textSprite = null;
let phrases = [];
let phraseIndex = 0;
let inactivityTimer = null;
let isTextVisible = false;

async function loadPhrases() {
  const res = await fetch('/data/text/phrases.json');
  phrases = await res.json();
  createTextSprite(phrases[0]);
  setInterval(() => {
    phraseIndex = (phraseIndex + 1) % phrases.length;
    updateTextSprite(phrases[phraseIndex]);
  }, 10000);
}
loadPhrases();

function setupInactivityMonitor() {
  const resetInactivity = () => {
    hideText();
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      showText();
    }, 5000);
  };

  window.addEventListener('mousemove', resetInactivity);
  window.addEventListener('mousedown', resetInactivity);
  window.addEventListener('wheel', resetInactivity);
  window.addEventListener('keydown', resetInactivity);

  resetInactivity();
}
setupInactivityMonitor();

function showText() {
  if (textSprite) textSprite.visible = true;
  isTextVisible = true;
}

function hideText() {
  if (textSprite) textSprite.visible = false;
  isTextVisible = false;
}

function createTextSprite(message) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  drawText(context, canvas, message);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  textSprite = new THREE.Sprite(material);
  textSprite.scale.set(6, 1.5, 1);
  textSprite.position.set(0, -2.5, 0);
  scene.add(textSprite);
  textSprite.visible = false;
}

function updateTextSprite(message) {
  const canvas = textSprite.material.map.image;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawText(context, canvas, message);
  textSprite.material.map.needsUpdate = true;
}

function drawText(context, canvas, message) {
  context.font = 'bold 60px Courier New';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#5facdc';
  context.shadowColor = '#5e26c5';
  context.shadowBlur = 30;
  context.fillText(message, canvas.width / 2, canvas.height / 2);
}

/*animazione fade*/

// Fai il fade-in appena la pagina è pronta
window.addEventListener('load', () => {
  const overlay = document.getElementById('fadeOverlay');
  overlay.classList.add('fade-out');

  setTimeout(() => {
    overlay.style.display = 'none'; // opzionale: lo rimuove
  }, 1000);
});

// Per fare il fade-out e poi cambiare pagina
function fadeOutAndNavigate(url) {
  const overlay = document.getElementById('fadeOverlay');
  overlay.style.display = 'block'; // riattiva se l'avevi nascosto
  overlay.classList.remove('fade-out');
  overlay.classList.add('visible');

  setTimeout(() => {
    window.location.href = url;
  }, 1000); // deve combaciare con il transition
}
// Eventuale pulsante uscita (se esiste)
const exitBtn = document.getElementById('exitButton');
if (exitBtn) {
  exitBtn.addEventListener('click', () => {
    fadeOutAndNavigate('graph.html'); // o altra destinazione
  });
}

/**
 * Animation Loop
 */
function animate() {
  brain.rotation.y += 0.001;
  points.rotation.y += 0.001;
  let transitioning = false;
if (!transitioning && camera.position.z <= 3) {
  transitioning = true;
  fadeOutAndNavigate('/pages/graph.html'); // cambia a dove vuoi andare
}

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
