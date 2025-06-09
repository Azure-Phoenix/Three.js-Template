import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { LottieLoader } from "./LottieLoader.js";

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
scene.background = new THREE.Color(0x161e33);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(1, 1, 3);
scene.add(camera);

/**
 * Addition
 */
// Controls
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;

// Lights
// const ambientLight = new THREE.AmbientLight(0x161e33, 0.8);
// scene.add(ambientLight);

// MODELVIEWER
let pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04
).texture;

// Axes
const axes = new THREE.AxesHelper(10);
scene.add(axes);

// Clock
const clock = new THREE.Clock();

// Lottie Loader
const lottieLoader = new LottieLoader()
  .setQuality(1)
  .setFrameThrottle(1)
  .setIsLoop(false)
  .setIsAutoplay(false);

/**
 ******************************
 ************ Main ************
 ******************************
 */

/**
 * Definitions
 */
// Create a container for Lottie
// const lottieContainer = document.createElement('div');
// lottieContainer.style.width = '512px';
// lottieContainer.style.height = '512px';
// document.body.appendChild(lottieContainer);

let lottieTexture;
let mesh;

// Load Lottie animation
lottieLoader.load("/models/ALL_RIPE_Animation.json", (texture) => {
  console.log("Lottie texture loaded");
  lottieTexture = texture;

  // Create mesh with the texture
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    map: lottieTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
});

/**
 * Models
 */

/**
 * Action
 */
window.addEventListener("click", (event) => {
  // Get mouse position in normalized device coordinates
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Create raycaster
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections
  const intersects = raycaster.intersectObject(mesh);

  if (intersects.length > 0 && lottieTexture) {
    console.log("Clicked on Lottie animation!");
    // Play the animation from the beginning
    lottieTexture.goToAndPlay(0, true);
  }
});

/**
 * Functioins
 */
function testfunction() {
  console.log("testfunction!");
}

// Auto Resize
window.addEventListener("resize", () => {
  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */
const animate = () => {
  // Update controls
  orbitControls.update();

  // Render Scene
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();

// Add cleanup on window unload
window.addEventListener("unload", () => {
  if (lottieTexture && lottieTexture.dispose) {
    lottieTexture.dispose();
  }
});
