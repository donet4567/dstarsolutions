import * as THREE from "three";

export type WorldController = {
  setProgress(value: number): void;
  setDispersed(value: boolean): void;
  setPaused(value: boolean): void;
  dispose(): void;
};

// A lathed, bevelled section gives the bearing both an inner wall and a machined face.
function bearing(radius: number, width: number, depth: number, segments: number) {
  const bevel = Math.min(width, depth) * .2;
  const outer = radius + width;
  const profile = [
    [radius, -depth + bevel], [radius + bevel, -depth], [outer - bevel, -depth],
    [outer, -depth + bevel], [outer, depth - bevel], [outer - bevel, depth],
    [radius + bevel, depth], [radius, depth - bevel], [radius, -depth + bevel],
  ];
  const geometry = new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), segments);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

// Long softboxes leave broad reflections across metal as each bearing turns.
function studioLights() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#43464b";
  context.fillRect(0, 0, 256, 128);
  for (const [x, width, color] of [[12, 55, "#ffffff"], [90, 12, "#161617"], [140, 29, "#fff1db"], [201, 11, "#ffffff"]] as const) {
    context.fillStyle = color;
    context.fillRect(x, 7, width, 85);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.mapping = THREE.EquirectangularReflectionMapping;
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

export function mountStudioWorld(host: HTMLElement, interaction: HTMLElement): WorldController | undefined {
  const compact = matchMedia("(max-width:768px)").matches;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.25 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const environment = studioLights();
  scene.environment = environment;
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 50);
  camera.position.z = 12;
  const light = new THREE.DirectionalLight(0xfff2df, 2.4);
  light.position.set(-4, 7, 6);
  scene.add(light, new THREE.HemisphereLight(0xe5efff, 0x73574a, 1.2));

  const metal = new THREE.MeshStandardMaterial({ color: 0xc8c6bd, metalness: .77, roughness: .24 });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x292b2d, metalness: .8, roughness: .31 });
  const enamel = new THREE.MeshStandardMaterial({ color: 0xfa4221, metalness: .38, roughness: .21 });
  const indexInk = new THREE.MeshBasicMaterial({ color: 0x2b2826 });
  const rig = new THREE.Group();
  scene.add(rig);
  const segments = compact ? 64 : 112;
  const outer = new THREE.Group(), middle = new THREE.Group(), inner = new THREE.Group();
  rig.add(outer, middle, inner);
  function ring(group: THREE.Group, r: number, w: number, d: number, material: THREE.Material, z = 0) {
    const mesh = new THREE.Mesh(bearing(r, w, d, segments), material);
    mesh.position.z = z;
    group.add(mesh);
  }
  ring(outer, 1.73, .28, .125, metal);
  ring(outer, 1.71, .05, .13, graphite);
  ring(middle, 1.34, .19, .10, graphite);
  ring(middle, 1.47, .035, .104, metal);
  ring(inner, .79, .25, .16, enamel);
  ring(inner, .77, .065, .17, metal);

  // Cut index marks into the face visually in one instanced draw.
  const graduations = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), indexInk, 96);
  const stamp = new THREE.Object3D();
  for (let i = 0; i < graduations.count; i++) {
    const angle = i / graduations.count * Math.PI * 2;
    const major = i % 8 === 0;
    const length = major ? .17 : .067;
    const r = 1.963 - length / 2;
    stamp.position.set(Math.sin(angle) * r, Math.cos(angle) * r, .126);
    stamp.rotation.z = -angle;
    stamp.scale.set(major ? .025 : .012, length, .008);
    stamp.updateMatrix();
    graduations.setMatrixAt(i, stamp.matrix);
  }
  outer.add(graduations);
  const capGeometry = new THREE.CylinderGeometry(.108, .108, .27, 20);
  for (const side of [-1, 1]) {
    const cap = new THREE.Mesh(capGeometry, enamel);
    cap.rotation.z = Math.PI / 2;
    cap.position.x = side * 1.96;
    outer.add(cap);
  }
  const hub = new THREE.Mesh(new THREE.IcosahedronGeometry(.42, 0), metal);
  rig.add(hub);

  // Position in viewport fractions so the sculpture clears the reading column.
  let halfWidth = 1, halfHeight = 1;
  let frame = 0, visible = true, disposed = false, paused = false;
  let progress = 0, target = 0, spread = 0, released = false, held = false;
  let impulse = 0, phase = 0, last = 0, pointerX = 0, pointerY = 0, aimX = 0, aimY = 0;
  let holdTimer: number | undefined, pressX = 0, pressY = 0;
  const canvas = renderer.domElement;
  host.appendChild(canvas);

  function schedule() {
    if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function draw(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const goal = released || held ? 1 : impulse;
    const moving = Math.abs(target - progress) + Math.abs(goal - spread) + Math.abs(pointerX - aimX) + Math.abs(pointerY - aimY) > .005;
    // An idle turntable needs fewer redraws. Interaction tracks the display.
    if (time - last < (moving ? 15 : 40)) { schedule(); return; }
    const dt = Math.min((time - last) / 1000, .08);
    last = time;
    const ease = 1 - Math.exp(-9 * dt);
    progress += (target - progress) * ease;
    spread += (goal - spread) * ease;
    pointerX += (aimX - pointerX) * ease;
    pointerY += (aimY - pointerY) * ease;
    impulse = Math.max(0, impulse - dt * .85);
    if (!paused) phase += dt;
    const turn = THREE.MathUtils.smoothstep(progress, 0, .96);
    const lift = Math.sin(turn * Math.PI);
    rig.scale.setScalar(compact ? Math.min(halfWidth * .275, .73) : Math.min(halfWidth * .185, .89));
    rig.position.set(halfWidth * (compact ? .44 - turn * 1.10 : .53 - turn * 1.17),
      halfHeight * (compact ? .38 - turn * .27 : .13 - turn * .04) + lift * .35, 0);
    rig.rotation.set(-.14 + pointerY * .06, -.26 + turn * .5 + pointerX * .09, -.44 + turn * .64);
    outer.rotation.set(.37 + .08 * Math.sin(phase * .24), -.49 + turn * 1.38, phase * .036);
    middle.rotation.set(.71 + turn * 1.45, .51 + .23 * Math.sin(phase * .29), -.3 + turn * .6);
    inner.rotation.set(-.25 + turn * .9, -.82 + phase * .17, .23);
    hub.rotation.set(phase * .15, phase * .21, turn);
    const separation = lift * .62 + spread * 1.05;
    outer.position.set(-separation * .63, separation * .26, -separation * .42);
    middle.position.z = separation * .2;
    inner.position.set(separation * .64, -separation * .26, separation * .63);
    hub.position.set(separation * 1.22, -separation * .5, separation * 1.02);
    renderer.render(scene, camera);
    host.dataset.ready = "true";
    host.dataset.scatter = spread > .3 ? "dispersed" : "gathered";
    if (!paused || moving || impulse > .001) schedule();
  }
  function resize() {
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    halfWidth = halfHeight * camera.aspect;
    schedule();
  }
  function release() {
    window.clearTimeout(holdTimer);
    held = false;
    schedule();
  }
  function press(event: PointerEvent) {
    if ((event.target as Element).closest("a,button,input,textarea,select,summary")) return;
    pressX = event.clientX; pressY = event.clientY;
    impulse = 1;
    holdTimer = window.setTimeout(() => { held = true; schedule(); }, 350);
    schedule();
  }
  function pointer(event: PointerEvent) {
    if (Math.hypot(event.clientX - pressX, event.clientY - pressY) > 12) release();
    if (paused || event.pointerType === "touch") return;
    aimX = event.clientX / innerWidth - .5;
    aimY = event.clientY / innerHeight - .5;
    schedule();
  }
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule(); else { cancelAnimationFrame(frame); frame = 0; }
  });
  intersection.observe(interaction);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(host);
  interaction.addEventListener("pointermove", pointer, { passive: true });
  interaction.addEventListener("pointerdown", press, { passive: true });
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  document.addEventListener("visibilitychange", schedule);
  resize();
  return {
    setProgress(value) { target = value; schedule(); },
    setDispersed(value) { released = value; schedule(); },
    setPaused(value) { paused = value; schedule(); },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(holdTimer);
      intersection.disconnect();
      sizeObserver.disconnect();
      interaction.removeEventListener("pointermove", pointer);
      interaction.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      document.removeEventListener("visibilitychange", schedule);
      const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse((object) => { if (object instanceof THREE.Mesh) geometries.add(object.geometry); });
      geometries.forEach((geometry) => geometry.dispose());
      graduations.dispose();
      [metal, graphite, enamel, indexInk, environment].forEach((resource) => resource.dispose());
      renderer.dispose();
      canvas.remove();
      delete host.dataset.ready;
      delete host.dataset.scatter;
    },
  };
}
