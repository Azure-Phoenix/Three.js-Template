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

function VolumetricSpotLightMaterial() {
  //
  var vertexShader = [
    "varying vec3 vNormal;",
    "varying vec3 vWorldPosition;",

    "void main(){",
    "// compute intensity",
    "vNormal		= normalize( normalMatrix * normal );",

    "vec4 worldPosition	= modelMatrix * vec4( position, 1.0 );",
    "vWorldPosition		= worldPosition.xyz;",

    "// set gl_Position",
    "gl_Position	= projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}",
  ].join("\n");
  var fragmentShader = [
    "varying vec3		vNormal;",
    "varying vec3		vWorldPosition;",

    "uniform vec3		lightColor;",

    "uniform vec3		spotPosition;",

    "uniform float		attenuation;",
    "uniform float		anglePower;",

    "void main(){",
    "float intensity;",

    //////////////////////////////////////////////////////////
    // distance attenuation					//
    //////////////////////////////////////////////////////////
    "intensity	= distance(vWorldPosition, spotPosition)/attenuation;",
    "intensity	= 1.0 - clamp(intensity, 0.0, 1.0);",

    //////////////////////////////////////////////////////////
    // intensity on angle					//
    //////////////////////////////////////////////////////////
    "vec3 normal	= vec3(vNormal.x, vNormal.y, abs(vNormal.z));",
    "float angleIntensity	= pow( dot(normal, vec3(0.0, 0.0, 1.0)), anglePower );",
    "intensity	= intensity * angleIntensity;",
    // 'gl_FragColor	= vec4( lightColor, intensity );',

    //////////////////////////////////////////////////////////
    // final color						//
    //////////////////////////////////////////////////////////

    // set the final color
    "gl_FragColor	= vec4( lightColor, intensity);",
    "}",
  ].join("\n");

  // create custom material from the shader code above
  //   that is within specially labeled script tags
  var material = new THREE.ShaderMaterial({
    uniforms: {
      attenuation: {
        type: "f",
        value: 5.0,
      },
      anglePower: {
        type: "f",
        value: 5.5,
      },
      spotPosition: {
        type: "v3",
        value: new THREE.Vector3(0, 0, 0),
      },
      lightColor: {
        type: "c",
        value: new THREE.Color("cyan"),
      },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    // side		: THREE.DoubleSide,
    // blending	: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  return material;
}

function createSpotlightRay() {
  const coneGeometry = new THREE.CylinderGeometry(
    0.02,
    0.4,
    3,
    32 * 2,
    1,
    true
  );
  coneGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -3 / 2, 0));
  coneGeometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  const coneMaterial = new VolumetricSpotLightMaterial();
  const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
  coneMesh.position.copy(spotLight.position);
  coneMaterial.uniforms.lightColor.value.set("white");
  coneMaterial.uniforms.spotPosition.value = coneMesh.position;
  coneMaterial.opacity = 0;

  return coneMesh;
}

const spotlightRay = createSpotlightRay();
scene.add(spotlightRay);

/**
 * Functioins
 */
function turnOffLight() {
  gsap.to(spotlightRay.material.uniforms.attenuation, {
    value: 0.0,
    duration: 0.5,
    ease: "power2.inOut",
  });
}

function turnOnLight() {
  gsap.to(spotlightRay.material.uniforms.attenuation, {
    value: 2.0,
    duration: 1,
    ease: "power2.inOut",
  });
}
/**
 * Action Listeners
 */
// Click Test
// window.addEventListener("click", (event) => {
//   console.log("clicked!");
//   turnOnLight();
// });

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

  if (spotlightRay) {
    spotlightRay.rotation.y += delta;
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
