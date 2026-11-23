import * as THREE from "three";
import { makeMonarch } from "./monarch";

export type WorldController = {
  takeFlight(): void;
  setPaused(value: boolean): void;
  dispose(): void;
};

type Flight = "flying" | "landing" | "perched";
type WingMode = "flap" | "glide";
type PerchGroup = "kicker" | "h1" | "h2";
type HeadingPerch = { group: PerchGroup; key: string; pos: THREE.Vector3; scaleFactor: number };

// Wing pose angles (radians about the hinge). Positive raises the wings.
const CLOSED = 1.47; // wings pressed together above the back, as a perched monarch holds them
const GLIDE = .24; // shallow dihedral "V" a monarch holds while gliding
const STROKE_SKEW = -.30; // brief dwell at the top clap, quick turn-around at the bottom

export function mountStudioWorld(host: HTMLElement, stage: HTMLElement): WorldController | undefined {
  const compact = matchMedia("(max-width:768px)").matches;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.25 : 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 50);
  camera.position.z = 12;
  camera.updateMatrixWorld();

  const light = new THREE.DirectionalLight(0xfff5e6, 1.35);
  light.position.set(-4, 7, 6);
  const rim = new THREE.DirectionalLight(0xffd7a8, .75);
  rim.position.set(3.5, -2.5, -5.5);
  scene.add(light, rim, new THREE.HemisphereLight(0xfffcf4, 0xc4ae96, 1.5));

  const loader = new THREE.TextureLoader();
  const maps = ["wing", "body", "underside"].map((name) => {
    const map = loader.load(`/models/monarch/${name}.webp`, schedule);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return map;
  });
  const butterfly = makeMonarch(maps[0], maps[1], maps[2]);
  const { rig } = butterfly;
  scene.add(rig);
  host.appendChild(renderer.domElement);

  let frame = 0, idle = 0, visible = true, disposed = false, paused = false;
  let state: Flight = "flying";
  let elapsed = 0, clock = 0, last = 0, trip = 0;
  let width = 1, height = 1, flightScale = 1, restingScale = .3, halfHeight = 1, ceilingNy = .26, headerNy = .095;
  let route: THREE.CatmullRomCurve3 | undefined, duration = 6.8, launchScale = 1, departingHigh = false;
  let perches: HeadingPerch[] = [];
  let activePerch: HeadingPerch | undefined;

  // Wing-beat state machine: flapping bursts interleaved with short glides.
  let wingMode: WingMode = "flap", modeTime = 0, beatsLeft = 3, glideFor = 0, glideBlend = 0;
  let strokePhase = 0, sink = 0, foreAngle = CLOSED, hindAngle = CLOSED - .05;
  // Perched behaviour: wings closed, occasionally opened slowly to bask.
  let perchAngle = CLOSED, perchTarget = CLOSED, perchHold = 2, perchedSince = 0, autoDepart = 10;
  let bankAngle = 0;

  const perch = new THREE.Vector3(), sample = new THREE.Vector3(), tangent = new THREE.Vector3();
  const prevPos = new THREE.Vector3(), curPos = new THREE.Vector3(), smoothVel = new THREE.Vector3();
  const prevForward = new THREE.Vector3(0, 1, 0), curForward = new THREE.Vector3();
  const curRight = new THREE.Vector3(), curUp = new THREE.Vector3(), turnCross = new THREE.Vector3();
  const viewBias = new THREE.Vector3(0, .48, .88).normalize();
  const basis = new THREE.Matrix4(), bankQuat = new THREE.Quaternion();
  const projected = new THREE.Vector3();
  const attitude = new THREE.Quaternion();
  const lastPointer = new THREE.Vector2(-10000, -10000);
  const launchOrientation = new THREE.Quaternion();
  const restPoseRight = new THREE.Quaternion().setFromEuler(new THREE.Euler(-.34, -.74, -1.14, "ZXY"));
  const restPoseLeft = new THREE.Quaternion().setFromEuler(new THREE.Euler(-.34, .74, 1.14, "ZXY"));
  const activeRestPose = restPoseRight.clone();
  const textMetrics = document.createElement("canvas").getContext("2d");
  const clamp = THREE.MathUtils.clamp;
  const smooth = THREE.MathUtils.smoothstep;
  const lerp = THREE.MathUtils.lerp;
  const strokeTheta = (phase: number) => {
    const a = phase * Math.PI * 2;
    return a + STROKE_SKEW * Math.sin(a);
  };

  function point(x: number, y: number, z = 0) {
    const half = halfHeight * (camera.position.z - z) / camera.position.z;
    return new THREE.Vector3((x * 2 - 1) * half * camera.aspect, (1 - y * 2) * half, z);
  }
  function screenPosition(position: THREE.Vector3) {
    projected.copy(position).project(camera);
    return new THREE.Vector2((projected.x + 1) * width / 2, (1 - projected.y) * height / 2);
  }

  function collectTextPerches(
    el: Element | null,
    group: PerchGroup,
    scaleFactor: number,
    bounds: DOMRect,
    list: HeadingPerch[]
  ) {
    if (!el) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let current = walker.nextNode();
    let nodeIdx = 0;
    while (current) {
      const textNode = current as Text;
      const content = textNode.textContent ?? "";
      const parent = textNode.parentElement ?? el;
      const style = getComputedStyle(parent);
      if (textMetrics) {
        textMetrics.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      }
      for (let i = 0; i < content.length; i++) {
        const ch = content[i];
        if (!/[A-Za-z]/.test(ch)) continue;
        range.setStart(textNode, i);
        range.setEnd(textNode, i + 1);
        const letter = range.getBoundingClientRect();
        if (letter.width < 2 || letter.height < 2) continue;
        const glyph = textMetrics?.measureText(ch);
        const rawInset = glyph && Number.isFinite(glyph.fontBoundingBoxAscent - glyph.actualBoundingBoxAscent)
          ? glyph.fontBoundingBoxAscent - glyph.actualBoundingBoxAscent
          : letter.height * .18;
        const inset = clamp(rawInset, 0, letter.height * .52);
        const nx = (letter.left + letter.width * .5 - bounds.left) / width;
        const ny = (letter.top + inset - bounds.top - 1) / height;
        if (nx > .03 && nx < .97 && ny > .08 && ny < .90) {
          list.push({ group, key: `${group}:${nodeIdx}:${i}`, pos: point(nx, ny), scaleFactor });
        }
      }
      nodeIdx++;
      current = walker.nextNode();
    }
  }

  // Keep upper airspace safely below the fixed navigation bar.
  function measureHeaderNy(): number {
    const bounds = host.getBoundingClientRect();
    const header = document.querySelector<HTMLElement>(".topbar");
    if (!header || !height) return .095;
    return clamp((header.getBoundingClientRect().bottom + 14 - bounds.top) / height, .06, .20);
  }

  // Keep the flight ceiling strictly below INDEPENDENT DIGITAL STUDIO's top boundary.
  function measureCeiling(): number {
    const bounds = host.getBoundingClientRect();
    const kicker = stage.querySelector<HTMLElement>(".orbit-kicker");
    if (!kicker || !height) return .28;
    return clamp((kicker.getBoundingClientRect().bottom + clamp(width * .09, 76, 130) - bounds.top) / height, .28, .52);
  }

  function measurePerches(): HeadingPerch[] {
    if (!width || !height) return [];
    const bounds = host.getBoundingClientRect();
    const list: HeadingPerch[] = [];

    const headerBottom = document.querySelector<HTMLElement>(".topbar")?.getBoundingClientRect().bottom ?? 0;
    const kickerPill = stage.querySelector<HTMLElement>(".orbit-kicker > span:first-child");
    if (kickerPill) {
      const rect = kickerPill.getBoundingClientRect();
      // Place perches along the top rim of the pill when there is clearance below the fixed header.
      if (rect.width > 60 && rect.height > 10 && rect.top - headerBottom >= 16) {
        const kickerScale = .58;
        // Lift rig center ~0.42 local units above rect.top so the perched feet grip the pill's top border.
        const restingPx = clamp(width * .06, 33, 66) / 4.5;
        const footLiftPx = clamp(restingPx * kickerScale * .42, 1.8, 5.5);
        const slots = 7;
        for (let s = 0; s < slots; s++) {
          const frac = .14 + (s / (slots - 1)) * .72;
          const nx = (rect.left + rect.width * frac - bounds.left) / width;
          const ny = (rect.top - footLiftPx - bounds.top) / height;
          if (nx > .04 && nx < .96 && ny > .05 && ny < .88) {
            list.push({ group: "kicker", key: `kicker:${s}`, pos: point(nx, ny), scaleFactor: kickerScale });
          }
        }
      }
    }

    collectTextPerches(stage.querySelector("h1"), "h1", 1, bounds, list);
    collectTextPerches(stage.querySelector(".orbit-hero-copy h2"), "h2", .88, bounds, list);
    return list;
  }

  function targetScale() {
    return restingScale * (activePerch?.scaleFactor ?? 1);
  }

  function selectPerch(): THREE.Vector3 {
    if (!perches.length) return point(.38, .42);
    const currentScreen = activePerch ? screenPosition(activePerch.pos) : undefined;
    const isFar = (item: HeadingPerch) => {
      const p = screenPosition(item.pos);
      const awayFromPointer = p.distanceTo(lastPointer) > 105;
      const awayFromCurrent = !currentScreen || p.distanceTo(currentScreen) > 85;
      return awayFromPointer && awayFromCurrent;
    };

    const groups: PerchGroup[] = ["h1", "h2", "kicker"];
    const availableGroups = groups.filter((g) => perches.some((p) => p.group === g && isFar(p)));
    let chosenGroupPool: HeadingPerch[] = [];

    if (availableGroups.length) {
      const preferred = availableGroups.filter((g) => g !== activePerch?.group);
      const groupChoices = preferred.length ? preferred : availableGroups;
      const weighted: PerchGroup[] = [];
      for (const g of groupChoices) {
        weighted.push(g);
        if (g === "h1" || g === "h2") weighted.push(g);
      }
      const pickedGroup = weighted[Math.floor(Math.random() * weighted.length)];
      chosenGroupPool = perches.filter((p) => p.group === pickedGroup && isFar(p));
    }

    if (!chosenGroupPool.length) {
      chosenGroupPool = perches.filter((item) => screenPosition(item.pos).distanceTo(lastPointer) > 90);
    }
    const pool = chosenGroupPool.length ? chosenGroupPool : perches;
    activePerch = pool[Math.floor(Math.random() * pool.length)];
    return activePerch.pos;
  }

  function syncActivePerch() {
    if (!activePerch) return;
    const match = perches.find((item) => item.key === activePerch!.key);
    if (match) {
      activePerch = match;
      perch.copy(match.pos);
    } else if (perches.length) {
      perch.copy(selectPerch());
    }
  }

  function clearIdle() {
    if (idle) { clearTimeout(idle); idle = 0; }
  }

  function computeApproachPoint(perchScreen: THREE.Vector2, approachFromRight: boolean, group: PerchGroup | undefined) {
    const px = clamp(perchScreen.x / width, .08, .92);
    const py = perchScreen.y / height;
    const approachX = clamp(px + (approachFromRight ? .085 : -.085), .08, .92);
    // For kicker, sweep gently from slightly above and beside the pill's top edge (staying below .topbar)
    // so the butterfly settles down onto the top rather than rising through the pill from below.
    const approachY = group === "kicker"
      ? Math.max(headerNy, py - .032)
      : clamp(py - .085, ceilingNy, .72);
    return point(approachX, approachY, .22);
  }

  function buildRoute(start: THREE.Vector3, away?: THREE.Vector2) {
    const screen = screenPosition(start);
    ceilingNy = measureCeiling();
    headerNy = measureHeaderNy();
    const ceiling = ceilingNy;
    departingHigh = screen.y / height < ceiling - .01;
    const x = clamp(screen.x / width, .12, .88);
    const y = clamp(screen.y / height, departingHigh ? headerNy : ceiling, .74);
    const direction = away ? Math.sign(screen.x - away.x) || (trip % 2 ? -1 : 1) : (trip % 2 ? -1 : 1);
    perch.copy(selectPerch());
    const perchScreen = screenPosition(perch);
    const px = clamp(perchScreen.x / width, .08, .92);
    const py = clamp(perchScreen.y / height, activePerch?.group === "kicker" ? headerNy : ceiling, .78);

    const routeMode = away ? 2 : trip % 3;
    const approachFromRight = px < x || (Math.abs(px - x) < .15 && direction < 0);
    const approachPoint = computeApproachPoint(perchScreen, approachFromRight, activePerch?.group);
    activeRestPose.copy(approachFromRight ? restPoseLeft : restPoseRight);

    const yLow = clamp(ceiling + .03, ceiling, .46);
    const yMid = clamp(ceiling + .13, ceiling + .08, .56);
    const yDeep = clamp(ceiling + .22, ceiling + .14, .68);
    const takeoffY = clamp(y + .05, headerNy, .54);

    let pts: THREE.Vector3[];
    if (routeMode === 0) {
      // Wide sweeping figure-S arc across mid and lower hero airspace
      pts = [
        start,
        point(clamp(x + direction * .13, .12, .88), departingHigh ? takeoffY : clamp(y - .11, ceiling, .58), .65),
        point(clamp(.5 + direction * .29, .14, .88), yLow, -.85),
        point(clamp(.5 - direction * .26, .12, .86), yDeep, 1.05),
        point(clamp(px + (approachFromRight ? .18 : -.18), .10, .90), yMid, -.7),
        approachPoint,
        perch.clone(),
      ];
      duration = trip === 0 ? 6.8 : 6.0 + (trip % 2) * .55;
    } else if (routeMode === 1) {
      // High soaring arch with gentle descent into the target heading
      pts = [
        start,
        point(clamp(x + direction * .10, .14, .86), departingHigh ? takeoffY : clamp(y - .14, ceiling, .52), .55),
        point(clamp((x + px) * .5 + direction * .16, .16, .84), yLow, 1.1),
        point(clamp(px - direction * .12, .12, .88), yMid, -.55),
        approachPoint,
        perch.clone(),
      ];
      duration = 5.6 + (trip % 3) * .35;
    } else {
      // Crisp darting hop to another perch (used after scatter or every third trip)
      pts = [
        start,
        point(clamp(x + direction * .14, .10, .90), departingHigh ? takeoffY : clamp(y - .10, ceiling, .56), .5),
        point(clamp((x + px) * .5, .14, .86), clamp(Math.min(y, py) - .09, ceiling, .44), .85),
        approachPoint,
        perch.clone(),
      ];
      duration = 4.4 + (trip % 2) * .4;
    }

    route = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  }

  function depart(away?: THREE.Vector2) {
    clearIdle();
    const start = rig.position.clone();
    buildRoute(start, away);
    trip++;
    elapsed = 0;
    state = "flying";
    prevPos.copy(start);
    smoothVel.set(0, 0, 0);
    // Start closed on the perch so the first downstroke opens smoothly into flight.
    wingMode = "flap"; modeTime = 0; glideBlend = 0; sink = 0; bankAngle = 0;
    strokePhase = 0; beatsLeft = 3 + Math.floor(Math.random() * 3);
    launchOrientation.copy(rig.quaternion);
    launchScale = rig.scale.x;
    rig.getWorldDirection(prevForward);
    host.dataset.flight = state;
    schedule();
  }

  function resize() {
    if (!host.clientWidth || !host.clientHeight) return;
    width = host.clientWidth; height = host.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
    halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const unitPerPixel = 2 * halfHeight / height;
    flightScale = clamp(width * .135, 68, 168) * unitPerPixel / 4.5;
    restingScale = clamp(width * .06, 33, 66) * unitPerPixel / 4.5;
    perches = measurePerches();
    if (!route) {
      // Enter smoothly from the open right area below INDEPENDENT DIGITAL STUDIO.
      ceilingNy = measureCeiling();
      headerNy = measureHeaderNy();
      const ceiling = ceilingNy;
      rig.position.copy(point(.86, clamp(ceiling + .10, .36, .52), -.25));
      rig.rotation.set(-.12, -.32, -.32);
      rig.scale.setScalar(flightScale);
      prevPos.copy(rig.position);
      depart();
    } else if (state === "perched") {
      syncActivePerch();
      elapsed = duration;
      rig.position.copy(perch); rig.quaternion.copy(activeRestPose); rig.scale.setScalar(targetScale());
    } else depart();
    schedule();
  }

  function schedule() {
    if (!frame && visible && !disposed && !document.hidden) frame = requestAnimationFrame(draw);
  }

  // Wing kinematics for one flight frame. Drives realistic flap bursts, dihedral glides,
  // aeroelastic membrane camber, leading-edge pronation/supination, and final landing fold.
  function flapWings(dt: number, t: number, approach: number) {
    const takeoff = 1 - smooth(elapsed, .4, 1.15);
    const flare = smooth(t, .70, .94);
    const allowGlide = takeoff < .05 && approach < .02;
    modeTime += dt;

    if (wingMode === "flap") {
      // Monarchs beat ~4.1–4.7 Hz in cruise, accelerating gently on takeoff and landing flare.
      const freq = 4.15 + 1.25 * takeoff + 1.45 * flare + .38 * Math.sin(clock * .65);
      const before = strokePhase;
      strokePhase += dt * freq;
      if (Math.floor(strokePhase) > Math.floor(before)) beatsLeft--;
      const fraction = strokePhase % 1;
      // Smoothly enter glide mid-downstroke when wings match shallow dihedral.
      if (allowGlide && beatsLeft <= 0 && fraction > .24 && fraction < .40) {
        wingMode = "glide"; modeTime = 0; glideFor = .55 + Math.random() * .6;
      }
    } else if (modeTime >= glideFor || !allowGlide) {
      wingMode = "flap"; modeTime = 0; beatsLeft = 2 + Math.floor(Math.random() * 3);
    }
    const target = wingMode === "glide" ? 1 : 0;
    glideBlend += (target - glideBlend) * (1 - Math.exp(-dt * (target ? 6.5 : 12)));

    const amp = 1.06 - .36 * flare;
    const mid = .36 + .12 * flare;
    const theta = strokeTheta(strokePhase);
    const hindTheta = strokeTheta(strokePhase - .10); // hindwings lag behind forewings
    const flapFore = mid + amp * Math.cos(theta);
    const flapHind = mid - .05 + amp * .9 * Math.cos(hindTheta);
    const glidePose = GLIDE + .022 * Math.sin(clock * 4.2);
    foreAngle = lerp(flapFore, glidePose, glideBlend);
    hindAngle = lerp(flapHind, glidePose - .05, glideBlend);

    // Fold wings upright gently as landing completes.
    const close = smooth(t, .89, 1);
    const activeFlap = (1 - glideBlend) * (1 - close);
    const flex = -Math.sin(theta) * amp * activeFlap;
    const pronation = -Math.sin(theta) * .24 * activeFlap;
    const sweep = -Math.sin(theta) * .11 * activeFlap;
    foreAngle = lerp(foreAngle, CLOSED, close);
    hindAngle = lerp(hindAngle, CLOSED - .05, close);
    return { theta, flex, pronation, sweep, flap: activeFlap };
  }

  function draw(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden || maps.some((map) => !map.image)) return;
    const dt = paused ? 0 : Math.min((time - last) / 1000, .05);
    last = time; clock += dt; elapsed += dt;

    const t = clamp(elapsed / duration, 0, 1);
    const approach = smooth(t, .64, 1);
    const airborne = 1 - approach;
    const restSize = targetScale();
    let flex = 0, bank = 0, pronation = 0, sweep = 0, bodyPitch = 0, settled = false;

    if (t < 1 && route) {
      if (approach > 0 && state === "flying") {
        state = "landing";
        perches = measurePerches();
        syncActivePerch();
        ceilingNy = measureCeiling();
        headerNy = measureHeaderNy();
        const perchScreen = screenPosition(perch);
        const approachFromRight = perchScreen.x < screenPosition(rig.position).x;
        activeRestPose.copy(approachFromRight ? restPoseLeft : restPoseRight);
        const approachPoint = computeApproachPoint(perchScreen, approachFromRight, activePerch?.group);
        route.points[route.points.length - 2].copy(approachPoint);
        route.points[route.points.length - 1].copy(perch);
        route.updateArcLengths();
      }
      const wing = flapWings(dt, t, approach);
      flex = wing.flex;
      pronation = wing.pronation;
      sweep = wing.sweep;
      bodyPitch = Math.cos(wing.theta - .3) * .085 * wing.flap;

      const u = Math.pow(t, .82);
      const travel = u * u * (3 - 2 * u);
      route.getPointAt(travel, sample);
      route.getTangentAt(travel, tangent);

      // Body physics: downstroke lift + forward surge, glide sink, organic flutter wander.
      sink = wingMode === "glide" ? Math.min(sink + dt * .42, .38) : sink * Math.exp(-dt * 2.8);
      const s = flightScale * airborne;
      const bob = -Math.cos(wing.theta - .5) * .48 * wing.flap;
      const surge = Math.max(0, Math.sin(wing.theta)) * .11 * wing.flap;
      const wanderX = Math.sin(clock * 1.15 + .6) * .46 + Math.sin(clock * 2.35 + 1.7) * .22;
      const wanderY = Math.sin(clock * 1.35 + 2.1) * .40 + Math.sin(clock * 2.65) * .20;
      curPos.copy(sample).addScaledVector(tangent, surge * s);
      curPos.x += wanderX * s * .38;
      curPos.y += (bob + wanderY * .32 - sink * .85) * s;
      const ceilingWorldY = (1 - ceilingNy * 2) * halfHeight * (camera.position.z - curPos.z) / camera.position.z;
      const headerWorldY = (1 - headerNy * 2) * halfHeight * (camera.position.z - curPos.z) / camera.position.z;
      const leaveKicker = departingHigh ? 1 - smooth(t, 0, .30) : 0;
      const arriveKicker = activePerch?.group === "kicker" ? smooth(t, .52, .84) : 0;
      const upperAllowance = Math.max(leaveKicker, arriveKicker);
      const upperWorldY = Math.max(perch.y, headerWorldY);
      const maxWorldY = lerp(ceilingWorldY, upperWorldY, upperAllowance);
      if (curPos.y > maxWorldY) curPos.y = maxWorldY;
      rig.position.copy(curPos);

      // Compute 3D velocity-aligned basis with gentle banking into turns and landing flare.
      if (dt > .001) {
        sample.copy(curPos).sub(prevPos).divideScalar(dt);
        smoothVel.lerp(sample, 1 - Math.exp(-dt * 7.5));
        prevPos.copy(curPos);
      }
      curForward.copy(tangent).multiplyScalar(3.5).add(smoothVel);
      const flare = smooth(t, .68, .95) * (1 - smooth(t, .96, 1));
      const noseUp = (.24 * wing.flap + .07 * glideBlend + .55 * flare) * (curForward.length() || 1);
      curForward.y += noseUp;
      if (curForward.lengthSq() < 1e-5) curForward.set(0, 1, 0);
      curForward.normalize();

      curRight.crossVectors(curForward, viewBias);
      if (curRight.lengthSq() < 1e-4) {
        curRight.set(1, 0, 0).crossVectors(curForward, curRight);
      }
      curRight.normalize();
      curUp.crossVectors(curRight, curForward).normalize();

      // Bank proportionally to horizontal turning curvature.
      turnCross.crossVectors(prevForward, curForward);
      const turnRate = clamp(turnCross.dot(curUp) * 16, -1, 1);
      bankAngle += (turnRate * .48 - bankAngle) * (1 - Math.exp(-dt * 5.5));
      prevForward.copy(curForward);

      if (Math.abs(bankAngle) > .002) {
        bankQuat.setFromAxisAngle(curForward, bankAngle);
        curRight.applyQuaternion(bankQuat);
        curUp.applyQuaternion(bankQuat);
      }
      bank = (bankAngle * .22 + tangent.x * .06) * airborne;

      // Local Rig Axes: +X right wing, +Y head/forward, +Z dorsal/up
      basis.makeBasis(curRight, curForward, curUp);
      attitude.setFromRotationMatrix(basis);

      if (t < .12) attitude.slerp(launchOrientation, 1 - smooth(t, 0, .12));
      const settling = smooth(t, .78, 1);
      if (settling > 0) attitude.slerp(activeRestPose, settling);
      const slerpRate = lerp(8.5, 11.5, smooth(t, .82, 1));
      rig.quaternion.slerp(attitude, 1 - Math.exp(-dt * slerpRate));

      const size = lerp(launchScale, flightScale, smooth(t, 0, .25));
      const scaleBlend = activePerch?.group === "kicker" ? smooth(t, .55, .90) : approach;
      rig.scale.setScalar(lerp(size, restSize, scaleBlend));
      perchAngle = foreAngle;
    } else {
      if (state !== "perched") {
        state = "perched";
        perchAngle = CLOSED; perchTarget = CLOSED;
        perchHold = 1.8 + Math.random() * 2.4;
        perchedSince = performance.now();
        autoDepart = 10 + Math.random() * 7;
      }
      rig.position.copy(perch);
      rig.quaternion.copy(activeRestPose);
      rig.scale.setScalar(restSize);

      perchHold -= dt;
      if (perchHold <= 0) {
        if (perchTarget > 1) {
          perchTarget = activePerch?.group === "kicker" ? .38 + Math.random() * .24 : .18 + Math.random() * .32;
          perchHold = 2.0 + Math.random() * 2.8;
        } else {
          perchTarget = CLOSED;
          perchHold = 2.8 + Math.random() * 3.6;
        }
      }
      // Monarchs open slowly to bask in the light and fold upright calmly.
      perchAngle += (perchTarget - perchAngle) * (1 - Math.exp(-dt * (perchTarget > 1 ? 3.8 : 1.55)));
      foreAngle = perchAngle;
      hindAngle = perchAngle - .05;
      settled = Math.abs(perchTarget - perchAngle) < .002;
    }

    butterfly.beat(foreAngle, hindAngle, flex, bank, pronation, sweep, bodyPitch);
    renderer.render(scene, camera);
    host.dataset.ready = "true";
    host.dataset.flight = state;
    if (paused) return;

    if (state === "perched") {
      const perchedFor = (performance.now() - perchedSince) / 1000;
      if (perchedFor >= autoDepart && settled) { depart(); return; }
      if (settled) {
        clearIdle();
        const wait = Math.max(.05, Math.min(perchHold, autoDepart - perchedFor));
        idle = window.setTimeout(() => {
          idle = 0;
          perchHold = Math.min(perchHold, 0);
          last = performance.now();
          schedule();
        }, wait * 1000);
        return;
      }
    }
    schedule();
  }

  function proximity(event: PointerEvent) {
    if (paused || !visible || (event.type === "pointermove" && event.pointerType === "touch")) return;
    const bounds = host.getBoundingClientRect();
    lastPointer.set(event.clientX - bounds.left, event.clientY - bounds.top);
    if (lastPointer.x < 0 || lastPointer.x > width || lastPointer.y < 0 || lastPointer.y > height) return;
    if (elapsed < .8 && state === "flying") return;
    const distance = screenPosition(rig.position).distanceTo(lastPointer);
    if (distance < (state === "perched" ? 64 : compact ? 56 : 96)) depart(lastPointer);
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { last = performance.now(); schedule(); }
    else { cancelAnimationFrame(frame); frame = 0; clearIdle(); }
  });
  observer.observe(stage);

  const sizes = new ResizeObserver(() => {
    if (width !== host.clientWidth || height !== host.clientHeight) resize();
  });
  sizes.observe(host);

  void document.fonts.ready.then(() => {
    if (disposed) return;
    perches = measurePerches();
    if (state === "perched") {
      syncActivePerch();
      rig.position.copy(perch);
      rig.scale.setScalar(targetScale());
      schedule();
    }
  });

  const onVisibility = () => { last = performance.now(); schedule(); };
  stage.addEventListener("pointermove", proximity, { passive: true });
  stage.addEventListener("pointerdown", proximity, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  resize();

  return {
    takeFlight() { if (!paused) depart(); },
    setPaused(value) { paused = value; last = performance.now(); if (value) clearIdle(); schedule(); },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); clearIdle(); observer.disconnect(); sizes.disconnect();
      stage.removeEventListener("pointermove", proximity);
      stage.removeEventListener("pointerdown", proximity);
      document.removeEventListener("visibilitychange", onVisibility);
      butterfly.dispose(); maps.forEach((map) => map.dispose()); renderer.dispose(); renderer.domElement.remove();
      delete host.dataset.ready; delete host.dataset.flight;
    },
  };
}
