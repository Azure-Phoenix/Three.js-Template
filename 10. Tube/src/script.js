import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 5, -5);
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

/**
 ******************************
 ************ Main ************
 ******************************
 */

/**
 * Definitions
 */

// Main Model
let model;
let mixer, animations;

let railingPoints = [
  new THREE.Vector3(0, 0.837124, -0.343891),
  new THREE.Vector3(0, 0.551485, -0.324998),
  new THREE.Vector3(0, 0.53799, -0.075345),
  new THREE.Vector3(0, 3.78326, 5.13612),
  new THREE.Vector3(0, 4.08796, 5.12389),
  new THREE.Vector3(0, 4.09759, 4.87529),
];
let path = new THREE.CurvePath();
railingPoints.forEach((pt, idx, arr) => {
  if (idx < arr.length - 1) {
    path.add(new THREE.LineCurve(pt, arr[idx + 1]));
  }
});
path.closePath();

const railingGeometry = new THREE.TubeGeometry(path, 128, 0.05, 8, true);
const railingMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const railing = new THREE.Mesh(railingGeometry, railingMaterial);
scene.add(railing);

/**
 * Models
 */
// const curve = new THREE.CatmullRomCurve3([
//   new THREE.Vector3(0, 0.837124, -0.343891),
//   new THREE.Vector3(0, 0.551485, -0.324998),
//   new THREE.Vector3(0, 0.53799, -0.075345),
//   new THREE.Vector3(0, 3.78326, 5.13612),
//   new THREE.Vector3(0, 4.08796, 5.12389),
//   new THREE.Vector3(0, 4.09759, 4.87529),
// ]);

// let points = [
//   new THREE.Vector3(0, 0.837124, -0.343891),
//   new THREE.Vector3(0, 0.551485, -0.324998),
//   new THREE.Vector3(0, 0.53799, -0.075345),
//   new THREE.Vector3(0, 3.78326, 5.13612),
//   new THREE.Vector3(0, 4.08796, 5.12389),
//   new THREE.Vector3(0, 4.09759, 4.87529),
// ];

// let curve = new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.1);

// // TubeGeometry parameters
// let radius = 0.01; // Radius of the tube
// let radialSegments = 8; // Number of segments around the tube circumference
// let tubularSegments = 100; // Number of segments along the tube length
// let closed = false; // Whether the tube is closed or not

// let geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, closed);
// let material = new THREE.MeshBasicMaterial({ color: "red" });

// scene.add(new THREE.Mesh(geometry, material));

// const railingGeometry = new THREE.TubeGeometry(curve, 128, 0.05, 8, true);
// const railingMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
// const railing = new THREE.Mesh(railingGeometry, railingMaterial);
// scene.add(railing);

// Extrude
// curve.curveType = "catmullrom";
// curve.closed = true;

// const extrudeSettings1 = {
//   steps: 100,
//   bevelEnabled: false,
//   extrudePath: curve,
// };

// const pts1 = [],
//   count = 12;

// for (let i = 0; i < count; i++) {
//   const l = 0.02;

//   const a = ((2 * i) / count) * Math.PI;

//   pts1.push(new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));
// }

// const shape1 = new THREE.Shape(pts1);

// const geometry1 = new THREE.ExtrudeGeometry(shape1, extrudeSettings1);

// const material1 = new THREE.MeshStandardMaterial({
//   color: 0xb00000,
//   side: THREE.DoubleSide,
// });

// const mesh1 = new THREE.Mesh(geometry1, material1);

// scene.add(mesh1);

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
