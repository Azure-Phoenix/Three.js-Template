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

// Add black-green fog
scene.fog = new THREE.Fog(0x001100, 50, 200); // Dark green color, near: 50, far: 200

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
camera.position.set(10, 10, 10);
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
scene.add(axes);

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// GUI
const gui = new dat.GUI();

// Clock
const clock = new THREE.Clock();

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
const planeG = new THREE.PlaneGeometry(1000, 1000);
const planeM = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
const plane = new THREE.Mesh(planeG, planeM);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const spotLight = new THREE.SpotLight(0xffffff, 100, 100, Math.PI / 8, 0.5, 1);
spotLight.position.set(0, 3, 5);
scene.add(spotLight);

const spotLightTarget = new THREE.Object3D();
spotLightTarget.position.set(1, 0, 5);
scene.add(spotLightTarget);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotLightHelper);

// Cone geometry to visualize spotlight ray
// Function to create cone geometry for spotlight ray visualization
function createSpotlightRay(
  spotlight,
  targetPosition = new THREE.Vector3(0, 0, 0),
  color = 0xffff00,
  opacity = 0.3
) {
  // Calculate cone dimensions based on spotlight parameters
  const spotlightAngle = spotlight.angle;
  const spotlightDistance = spotlight.distance;
  const coneRadius = Math.tan(spotlightAngle) * spotlightDistance;

  const coneGeometry = new THREE.ConeGeometry(
    coneRadius,
    spotlightDistance,
    128,
    1,
    true
  );
  const coneMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: opacity,
    // wireframe: true,
  });
  const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
  coneMesh.position.copy(spotlight.position);

  // Calculate direction from spotlight to target
  const direction = targetPosition.clone().sub(spotlight.position).normalize();
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), direction);
  coneMesh.setRotationFromQuaternion(quaternion);

  // Move cone so its top (narrow end) is at the spotlight position
  coneMesh.position.add(
    direction.clone().multiplyScalar(spotlightDistance * 0.5)
  );

  return coneMesh;
}

// Create spotlight ray visualization
const spotlightRay = createSpotlightRay(spotLight);
// scene.add(spotlightRay);

// Function to update ray direction to follow spotlight target
function updateRayDirection() {
  if (spotLightTarget && spotlightRay) {
    // Calculate direction from spotlight to target
    const direction = new THREE.Vector3();
    direction
      .subVectors(spotLightTarget.position, spotLight.position)
      .normalize();

    // Update ray position and rotation
    spotlightRay.position.copy(spotLight.position);

    // Calculate rotation to point toward target
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), direction);
    spotlightRay.setRotationFromQuaternion(quaternion);

    // Move cone so its top (narrow end) is at the spotlight position
    spotlightRay.position.add(
      direction.clone().multiplyScalar(spotLight.distance * 0.5)
    );
  }
}

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
let test = 0;
const animate = () => {
  // Delta Time
  let delta = clock.getDelta();

      if (spotLightTarget) {
      spotLightTarget.position.x = Math.sin(test) * Math.sqrt(2) + 0;
      spotLightTarget.position.z = Math.cos(test) * Math.sqrt(2) + 5;
      test += delta;
      spotLight.target = spotLightTarget;
      
      // Update ray direction to follow the spotlight
      updateRayDirection();
      
      // Update spotlight helper to follow the light direction
      // spotLightHelper.update();
    }

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
