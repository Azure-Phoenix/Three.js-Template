import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 ******************************
 ****** Three.js Initial ******
 ******************************
 */

/**
 * Init
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Set canvas size to one third of viewport
// const setCanvasSize = () => {
//   const width = window.innerWidth / 3;
//   const height = window.innerHeight / 3;
//   renderer.setSize(width, height);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
//   // Update camera aspect ratio
//   camera.aspect = width / height;
//   camera.updateProjectionMatrix();
  
//   // Center the canvas using CSS
//   canvas.style.position = 'absolute';
//   canvas.style.left = '50%';
//   canvas.style.top = '50%';
//   canvas.style.transform = 'translate(-50%, -50%)';
// };

// // Initial setup
// setCanvasSize();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 6);
scene.add(camera);

/**
 * Addition
 */
// Controls
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;
// orbitControls.enableZoom = false;

// Lights
// const ambientLight = new THREE.AmbientLight(0x161e33, 0.8);
// scene.add(ambientLight);

// MODELVIEWER
let pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04
).texture;

// HDR Environment Map
// const rgbeLoader = new RGBELoader();
// rgbeLoader.load("/environment/spruit_sunrise_1k.hdr", (environmentMap) => {
//   environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//   // scene.background = environmentMap;
//   scene.environment = environmentMap;
//   // Adjust renderer exposure for HDR
//   renderer.toneMapping = THREE.ACESFilmicToneMapping;
//   renderer.toneMappingExposure = 3; // Adjust this value to control exposure (0.1 to 2.0 typical range)
// });

// Axes
const axes = new THREE.AxesHelper(10);
// scene.add(axes);

// Clock
const clock = new THREE.Clock();

/**
 ******************************
 ************ Main ************
 ******************************
 */

/**
 * Definitions
 */

// Main Model
let model, model1;
let mixer, animations;

/**
 * Models
 */
// Draco
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

// GLTF Loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Load main model
gltfLoader.load("/models/ice.glb", (gltf) => {
  model = gltf.scene;
  model.scale.set(0.95, 0.95, 0.95);
  model.traverse((child) => {
    if (child.isMesh && child.material) {
      // Example tweaks for extra realism
      child.material.roughness = 0.25;
      child.material.transmission = 0.97;
      child.material.ior = 1.5;
      child.material.thickness = 1.0;
      child.material.color.set(0xbfdfff); // subtle blue tint
      child.material.envMapIntensity = 1.2;
      // Harder surface distortion
      if (child.material.normalMap) {
        child.material.normalScale.set(2, 2); // Stronger normal map effect
      }
      if (child.material.displacementMap) {
        child.material.displacementScale = 0.2; // Stronger geometry distortion
        child.material.displacementBias = 0;
      }
      child.material.needsUpdate = true;
    }
  });
  scene.add(model);
});

gltfLoader.load("/models/dice.glb", (gltf) => {
  model1 = gltf.scene;
  // model1.scale.set(100, 100, 100);
  // model1.traverse((child) => {
  //   if (child instanceof THREE.Mesh) {
  //     child.material = material;
  //   }
  // });

  scene.add(model1);
});

// const torusMesh = new THREE.Mesh(
//   new THREE.TorusKnotGeometry(1, 0.4, 128, 128, 1, 3),
//   material
// );
// torusMesh.position.set(0, 3, 0);
// scene.add(torusMesh);

/**
 * Action
 */
window.addEventListener("click", (event) => {
  console.log("clicked!");
  testfunction();
});

/**
 * Functioins
 */
function testfunction() {
  console.log("testfunction!");
}

// Set canvas size to one third of viewport
const setCanvasSize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Update camera aspect ratio
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

// Initial setup
setCanvasSize();

// Update Auto Resize event
window.addEventListener("resize", () => {
  setCanvasSize();
});

/**
 * Animate
 */
const animate = () => {
  // Update controls
  orbitControls.update();

  if(model && model1) {
    model.rotation.y -= 0.01;
    model1.rotation.y -= 0.01;
  }

  // Render Scene
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();
