import * as THREE from 'three'; // Importa la libreria THREE.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Importa il loader GLTF

/**
 * Base setup
 */
const scene = new THREE.Scene();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.querySelector('.canvas-container').appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0x898989, 5);
scene.add(light);

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

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
 * Animation Loop
 */
function animate() {
    brain.rotation.y += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
