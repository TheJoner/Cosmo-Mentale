import * as THREE from 'three';

let scene, camera, renderer;
let nodes = [];
let isFocusing = false;
let isMouseDown = false;
let lon = 0, lat = 0;
let phi = 0, theta = 0;
let target = new THREE.Vector3();
let connections = null;
let animationData = null;
let nodeInfoList = [];

fetch('/data/text/infoNodes.json')
  .then(res => res.json())
  .then(json => {
    nodeInfoList = json;
    init();       // ⬅️ solo dopo aver caricato il JSON
    animate();
  })
  .catch(err => {
    console.error('Errore nel caricamento del JSON:', err);
  });


function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1));

  const radius = 30;
  const nodeGeometry = new THREE.SphereGeometry(0.8, 32, 32);
  for (let i = 0; i < 30; i++) {
    const phi = Math.acos(-1 + (2 * i) / 30);
    const theta = Math.sqrt(30 * Math.PI) * phi;
    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);

    const color = new THREE.Color(Math.random(), Math.random(), Math.random());

    // Nodo "core"
    const nodeMaterial = new THREE.MeshStandardMaterial({
      emissive: color,
      emissiveIntensity: 1,
      color: 0x000000
    });
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.userData = nodeInfoList[i] || {
      title: `Nodo ${i + 1}`,
      description: `Nessuna descrizione disponibile.`
    };

    node.position.set(x, y, z);

    // Guscio Glow
    const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32); // leggermente più grande
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(node.position);

    nodes.push(node);
    scene.add(node);
    scene.add(glow);
  }

  const connectionThreshold = 0.3; // probabilità di collegamento (più basso = meno linee)
  const connectionPoints = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() < connectionThreshold) {
        connectionPoints.push(nodes[i].position.clone());
        connectionPoints.push(nodes[j].position.clone());
      }
    }
  }

  const connectionGeometry = new THREE.BufferGeometry().setFromPoints(connectionPoints);
  const connectionMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2
  });

  const connections = new THREE.LineSegments(connectionGeometry, connectionMaterial);
  scene.add(connections);

  const particleGeometry = new THREE.BufferGeometry();
  const count = 1000;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100;
  }
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    transparent: true,
    opacity: 0.3
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('click', (event) => {
    if (animationData) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);

    if (intersects.length > 0) {
      const node = intersects[0].object;
      const direction = new THREE.Vector3().subVectors(node.position, camera.position).normalize();
      const endPos = node.position.clone().addScaledVector(direction, -3);

      nodes.forEach(n => { if (n !== node) n.visible = false; });
      document.getElementById('nodeTitle').textContent = node.userData.title;
      document.getElementById('nodeDesc').textContent = node.userData.description;
      const colorHex = '#' + node.material.emissive.getHexString();
      document.getElementById('nodeOverlay').style.color = colorHex;
      document.getElementById('nodeOverlay').style.display = 'block';

      animationData = {
        type: 'focus',
        target: node.position.clone(),
        startPos: camera.position.clone(),
        endPos,
        startTime: performance.now(),
        duration: 800
      };
      isFocusing = true;
    }
  });

  window.addEventListener('keydown', (e) => {
    if ((e.key === 'Escape' || e.key === 'Backspace') && isFocusing && !animationData) {
      const returnTarget = animationData?.target?.clone() || new THREE.Vector3(0, 0, 0);
      const resetPos = new THREE.Vector3(0, 0, 0);
      document.getElementById('nodeOverlay').style.display = 'none';

      animationData = {
        type: 'return',
        target: returnTarget,
        startPos: camera.position.clone(),
        endPos: resetPos,
        startTime: performance.now(),
        duration: 800
      };
    }
  });

  document.addEventListener('mousedown', () => { if (!isFocusing) isMouseDown = true; });
  document.addEventListener('mouseup', () => isMouseDown = false);
  document.addEventListener('mousemove', (event) => {
    if (!isMouseDown || isFocusing || animationData) return;
    lon -= event.movementX * 0.1;
    lat -= event.movementY * 0.1;
  });
}

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();

  if (connections && connections.material) {
    const t = (Math.sin(performance.now() * 0.001) + 1) / 2; // varia tra 0 e 1
    connections.material.opacity = 0.1 + t * 0.3; // fade tra 0.1 e 0.4
  }

  if (animationData) {
    const { startPos, endPos, target, startTime, duration, type } = animationData;
    const t = Math.min((now - startTime) / duration, 1);
    const easedT = t * (2 - t); // easeOutQuad

    camera.position.lerpVectors(startPos, endPos, easedT);
    camera.lookAt(target);

    if (t >= 1) {
      if (type === 'return') {
        nodes.forEach(n => n.visible = true);
        isFocusing = false;
      }
      animationData = null;
    }

  } else {
    if (!isFocusing) {
      lat = Math.max(-85, Math.min(85, lat));
      phi = THREE.MathUtils.degToRad(90 - lat);
      theta = THREE.MathUtils.degToRad(lon);

      target.x = Math.sin(phi) * Math.cos(theta);
      target.y = Math.cos(phi);
      target.z = Math.sin(phi) * Math.sin(theta);
      camera.lookAt(target);
    }
  }

  renderer.render(scene, camera);
}

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
window.addEventListener('DOMContentLoaded', () => {
  const exitButton = document.getElementById('exitButton');
  if (exitButton) {
    exitButton.addEventListener('click', () => {
      fadeOutAndNavigate('/pages/scene.html');
    });
  }
});