import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Render on input only. No animation loop, remote textures or model downloads.
export function mountOrbit(host: HTMLElement) {
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); } catch { return () => {}; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 50);
  camera.position.set(0, 0, 8);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const angle = Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 ? .72 : 1.8;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: .42, bevelEnabled: true, bevelThickness: .18, bevelSize: .14, bevelSegments: 5, steps: 1 });
  geometry.center();
  const material = new THREE.MeshStandardMaterial({ color: "#d9ad4e", metalness: 1, roughness: .23 });
  const star = new THREE.Mesh(geometry, material);
  star.rotation.set(.12, -.48, -.18);
  scene.add(star);
  scene.add(new THREE.HemisphereLight(0xe7dcff, 0x3e1837, 2));
  const light = new THREE.DirectionalLight(0xffedc0, 5); light.position.set(3, 4, 5); scene.add(light);
  const edge = new THREE.DirectionalLight(0xbab2ff, 4); edge.position.set(-4, -2, 2); scene.add(edge);
  const canvas = renderer.domElement;
  host.appendChild(canvas); host.dataset.ready = "true";
  let frame = 0, visible = true, px = 0, py = 0;
  const render = () => {
    frame = 0;
    if (!visible) return;
    const progress = Math.min(1, Math.max(0, scrollY / innerHeight));
    star.rotation.set(.12 + py * .2 + progress * .5, -.48 + px * .35 + progress * 1.7, -.18 + progress * .35);
    host.style.setProperty("--orbit-travel", String(progress));
    renderer.render(scene, camera);
  };
  const schedule = () => { if (!frame && visible) frame = requestAnimationFrame(render); };
  const pointer = (e: PointerEvent) => { px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5; schedule(); };
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); schedule(); };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }); observer.observe(host);
  const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(host);
  addEventListener("pointermove", pointer, { passive: true }); addEventListener("scroll", schedule, { passive: true });
  resize();
  return () => { cancelAnimationFrame(frame); observer.disconnect(); sizeObserver.disconnect(); removeEventListener("pointermove", pointer); removeEventListener("scroll", schedule); geometry.dispose(); material.dispose(); environment.dispose(); renderer.dispose(); canvas.remove(); delete host.dataset.ready; host.style.removeProperty("--orbit-travel"); };
}
