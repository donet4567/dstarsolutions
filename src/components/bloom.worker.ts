import * as THREE from "three";
import { bloomColours, createPetal, updateBloom } from "./bloom-model";
import type { BloomValues } from "./bloom-model";

type Message = { type: "init"; canvas: OffscreenCanvas; width: number; height: number; dpr: number; input: BloomValues; animate: boolean }
  | { type: "input"; input: BloomValues }
  | { type: "animate"; animate: boolean }
  | { type: "resize"; width: number; height: number; dpr: number };

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let root: THREE.Group;
const petals: THREE.Group[] = [];
let input: BloomValues = { progress: 0, pointerX: 0, pointerY: 0, rotation: 0 };
let animate = false;
let ready = false;
let frame = 0;
let previous = 0;
let time = 0;

function draw(now: number) {
  frame = 0;
  if (!ready) return;
  const delta = previous ? Math.min((now - previous) / 1000, .05) : 0;
  previous = now;
  if (animate) time += delta;
  updateBloom(root, petals, input, time, delta);
  renderer.render(scene, camera);
  if (animate) schedule();
}
function schedule() {
  if (ready && !frame) frame = requestAnimationFrame(draw);
}
function resize(width: number, height: number, dpr: number) {
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

async function initialize(message: Extract<Message, { type: "init" }>) {
  input = message.input;
  animate = message.animate;
  renderer = new THREE.WebGLRenderer({ canvas: message.canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, .1, 1000);
  camera.position.set(0, 0, 9.5);
  resize(message.width, message.height, message.dpr);
  scene.add(new THREE.AmbientLight(0xffffff, .8));
  const key = new THREE.DirectionalLight("#fff8ef", 3.4);
  key.position.set(-3, 5, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -.001;
  scene.add(key);
  const fill = new THREE.DirectionalLight("#d5dfff", 1.7);
  fill.position.set(4, -1, 3);
  scene.add(fill);

  // The same three rectangular lightformers and 128px half-float environment
  // used by the original scene, generated once inside the rendering worker.
  const environment = new THREE.Scene();
  const lights = [
    { position: [-3, 4, 5], scale: [5, 4, 1], intensity: 3, colour: "#ffffff" },
    { position: [4, 0, 2], scale: [2, 6, 1], intensity: 2, colour: "#e8dfff" },
    { position: [0, -4, 3], scale: [5, 2, 1], intensity: 1, colour: "#ffdfce" },
  ];
  for (const light of lights) {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(light.colour).multiplyScalar(light.intensity), side: THREE.DoubleSide, toneMapped: false }));
    plane.position.fromArray(light.position);
    plane.scale.fromArray(light.scale);
    plane.lookAt(0, 0, 0);
    environment.add(plane);
  }
  const target = new THREE.WebGLCubeRenderTarget(128, { type: THREE.HalfFloatType });
  new THREE.CubeCamera(.1, 1000, target).update(renderer, environment);
  scene.environment = target.texture;
  root = new THREE.Group();
  root.rotation.set(-.25, -.28, -.16);
  const geometry = createPetal();
  bloomColours.forEach((colour, index) => {
    const orbit = new THREE.Group();
    orbit.rotation.z = index * Math.PI / 4;
    const petal = new THREE.Group();
    const mesh = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ color: colour, metalness: .16, roughness: .29, clearcoat: .85, clearcoatRoughness: .24, envMapIntensity: .9 }));
    mesh.castShadow = mesh.receiveShadow = true;
    petal.add(mesh);
    petals.push(petal);
    orbit.add(petal);
    root.add(orbit);
  });
  const center = new THREE.Mesh(new THREE.SphereGeometry(.58, 40, 40), new THREE.MeshPhysicalMaterial({ color: "#f5dec8", metalness: .12, roughness: .27, clearcoat: .9 }));
  center.position.set(0, 0, .34);
  center.castShadow = true;
  root.add(center);
  scene.add(root);
  await renderer.compileAsync(scene, camera);
  ready = true;
  draw(performance.now());
  postMessage({ type: "ready" });
}

self.onmessage = (event: MessageEvent<Message>) => {
  const message = event.data;
  if (message.type === "init") {
    void initialize(message).catch(() => postMessage({ type: "error" }));
  } else if (message.type === "input") {
    input = message.input;
    schedule();
  } else if (message.type === "animate") {
    animate = message.animate;
    previous = 0;
    if (!animate && frame) { cancelAnimationFrame(frame); frame = 0; }
    schedule();
  } else if (message.type === "resize" && renderer) {
    resize(message.width, message.height, message.dpr);
    schedule();
  }
};
