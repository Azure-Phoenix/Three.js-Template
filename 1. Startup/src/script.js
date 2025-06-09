import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";


/**
 * Definitions
 */
// Three.js Objects
let model;

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
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 6);
scene.add(camera);
// const aspect = window.innerWidth / window.innerHeight;
// const frustumHeight = 10; // Define the visible height you want in your scene
// const frustumWidth = frustumHeight * aspect;
// const camera = new THREE.OrthographicCamera(
//   frustumWidth / -2,
//   frustumWidth / 2,
//   frustumHeight / 2,
//   frustumHeight / -2,
//   1,
//   1000
// );
// camera.position.set(0, 10, 0);
// camera.lookAt(0, 0, 0);

/**
 * Loaders
 */
// Draco Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

// GLTF Loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Lights
 */
// Ambient Light
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

/**
 * Controls
 */
// Orbit Controls
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;

/**
 * Addition
 */
// Axes
const axes = new THREE.AxesHelper(1000);
// scene.add(axes);

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// GUI
const gui = new dat.GUI();

// Clock
// const clock = new THREE.Clock();

// Raycaster
// const rayCaster = new THREE.Raycaster();


/**
 ******************************
 ************ Main ************
 ******************************
 */
/**
 * Models
 */
// Load main model
gltfLoader.load("/models/Tracing.glb", (gltf) => {
  model = gltf.scene;
  // model.scale.set(100, 100, 100);
  // model.traverse((child) => {
  //   if (child instanceof THREE.Mesh) {
  //     child.material = material;
  //   }
  // });

  scene.add(model);
});

/**
 * Functioins
 */
function testfunction() {
  console.log("testfunction!");
}


/**
 * Action Listeners
 */
// Click Test
window.addEventListener("click", (event) => {
  console.log("clicked!");
  testfunction();
});

// Auto Resize
window.addEventListener("resize", () => {
  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
// window.addEventListener("resize", () => {
//   const aspect = window.innerWidth / window.innerHeight;
//   const frustumWidth = frustumHeight * aspect;
//   camera.left = frustumWidth / -2;
//   camera.right = frustumWidth / 2;
//   camera.top = frustumHeight / 2;
//   camera.bottom = frustumHeight / -2;

//   camera.updateProjectionMatrix();

//   renderer.setSize(window.innerWidth, window.innerHeight);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// });

/**
 * Animate
 */
const animate = () => {
  // Delta Time
  // let delta = clock.getDelta();

  // Update controls
  orbitControls.update();

  // Stats Update
  stats.update();

  // Render Scene
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();
