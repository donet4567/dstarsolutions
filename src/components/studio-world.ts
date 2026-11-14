import * as THREE from "three";
import { makeMonarch } from "./monarch";
import { makeGarden } from "./wildflower-garden";

export type WorldController = {
  takeFlight(): void;
  setPaused(value: boolean): void;
  dispose(): void;
};

type Flight = "flying" | "landing" | "perched";

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
  const light = new THREE.DirectionalLight(0xfff5e6, 1.3);
  light.position.set(-4, 7, 6);
  scene.add(light, new THREE.HemisphereLight(0xfffcf4, 0xc4ae96, 1.45));

  const loader = new THREE.TextureLoader();
  const maps = ["wing", "body", "underside"].map(name => {
    const map = loader.load(`/models/monarch/${name}.webp`, schedule);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return map;
  });
  const butterfly = makeMonarch(maps[0], maps[1], maps[2]);
  const { rig } = butterfly;
  const garden=makeGarden();
  scene.add(rig,garden.mesh);
  host.appendChild(renderer.domElement);

  let frame = 0, visible = true, disposed = false, paused = false;
  let state: Flight = "flying";
  let elapsed = 0, wingPhase = 0, clock = 0, last = 0, trip = 0;
  let width = 1, height = 1, flightScale = 1, restingScale = .3, halfHeight = 1;
  let route: THREE.CatmullRomCurve3 | undefined, duration = 4, launchScale = 1;
  let onFlower = true;
  let perches: THREE.Vector3[] = [];
  const perch = new THREE.Vector3(), sample = new THREE.Vector3(), tangent = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const attitude = new THREE.Quaternion(), angles = new THREE.Euler(0,0,0,"ZXY");
  const lastPointer = new THREE.Vector2(-10000,-10000);
  const launchOrientation = new THREE.Quaternion();
  const textMetrics = document.createElement("canvas").getContext("2d");
  const clamp = THREE.MathUtils.clamp;
  const smooth = THREE.MathUtils.smoothstep;

  function point(x: number, y: number, z = 0) {
    const half = halfHeight * (camera.position.z-z) / camera.position.z;
    return new THREE.Vector3((x*2-1)*half*camera.aspect,(1-y*2)*half,z);
  }
  function screenPosition(position: THREE.Vector3) {
    projected.copy(position).project(camera);
    return new THREE.Vector2((projected.x+1)*width/2,(1-projected.y)*height/2);
  }
  function measurePerches() {
    const title = stage.querySelector("h1");
    if (!title) return [];
    const bounds = host.getBoundingClientRect();
    const style = getComputedStyle(title);
    if (textMetrics) textMetrics.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return [title.firstChild, title.querySelector("span")?.firstChild, title.querySelector("em")?.firstChild].flatMap(node => {
      if (node?.nodeType !== Node.TEXT_NODE || !node.textContent) return [];
      // Land on the cap of a real letter, including when the heading wraps.
      const index = Math.min(1,node.textContent.length-1);
      const range = document.createRange();
      range.setStart(node,index); range.setEnd(node,index+1);
      const letter = range.getBoundingClientRect();
      const glyph = textMetrics?.measureText(node.textContent[index].toUpperCase());
      const inset = glyph ? glyph.fontBoundingBoxAscent - glyph.actualBoundingBoxAscent : letter.height*.16;
      return [point((letter.left+letter.width*.5-bounds.left)/width,(letter.top+(Number.isFinite(inset)?inset:letter.height*.16)-bounds.top-2)/height)];
    });
  }
  function selectPerch() {
    if (!perches.length) return point(.32,.37);
    const flower=garden.flowerPosition();
    if (trip===0 || (state==="landing" && trip===1)) {
      onFlower=true;
      return flower;
    }
    const spots=[...perches,flower];
    const index=state==="landing" ? trip-1 : trip;
    const ordered=spots.map((_,i)=>spots[(index+i+spots.length)%spots.length]);
    const selected=ordered.find(p=>screenPosition(p).distanceTo(lastPointer)>105) ?? ordered[0];
    onFlower=selected===flower;
    return selected;
  }
  function depart(away?: THREE.Vector2) {
    const start = rig.position.clone();
    const screen = screenPosition(start);
    const x = screen.x/width, y = screen.y/height;
    const direction = away ? Math.sign(screen.x-away.x) || (trip%2 ? -1 : 1) : 1;
    const alternate = trip%2===1;
    perch.copy(selectPerch());
    // A steep escape, a shallow bank towards the lens, then a decelerating
    // approach from above the selected letter. No teleport between journeys.
    route = new THREE.CatmullRomCurve3([
      start,
      point(clamp(x+direction*.12,.12,.86),clamp(y-.15,.16,.60),.7),
      point(alternate?.66:.79, compact?.28:.23,alternate?-.9:-.35),
      point(alternate?.82:.60, compact?.36:.38,1.15),
      point(alternate?.49:.38, compact?.25:.22,-1.15),
      perch.clone().add(new THREE.Vector3(.32,.44,.25)),
      perch.clone(),
    ],false,"centripetal");
    duration = trip===0 ? 4.8 : 3.8 + (trip%3)*.28;
    trip++;
    elapsed = 0;
    state = "flying";
    launchOrientation.copy(rig.quaternion);
    launchScale=rig.scale.x;
    host.dataset.flight = state;
    schedule();
  }
  function resize() {
    if (!host.clientWidth || !host.clientHeight) return;
    width = host.clientWidth; height = host.clientHeight;
    renderer.setSize(width,height,false);
    camera.aspect = width/height; camera.updateProjectionMatrix();
    halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z;
    const unitPerPixel = 2*halfHeight/height;
    flightScale = clamp(width*.135,68,168)*unitPerPixel/4.5;
    restingScale = clamp(width*.06,33,66)*unitPerPixel/4.5;
    const bedWidth=compact?clamp(width*.47,140,265):clamp(width*.32,230,440);
    garden.mesh.scale.setScalar(bedWidth*unitPerPixel/3.15);
    garden.mesh.position.copy(point(compact?.715:.77,compact?.405:.615));
    garden.mesh.rotation.x=.11;
    garden.mesh.updateMatrixWorld();
    perches=measurePerches();
    if (!route) {
      rig.position.copy(point(.84,compact?.28:.34,-.25));
      rig.rotation.set(-.12,-.32,-.32);
      rig.scale.setScalar(flightScale);
      depart();
    } else if (state==="perched") {
      if(onFlower) perch.copy(garden.flowerPosition());
      else perch.copy(selectPerch());
      state="perched";elapsed=duration;
      rig.position.copy(perch);rig.quaternion.copy(restPose);rig.scale.setScalar(restingScale);
    } else depart();
    schedule();
  }
  function schedule() {
    if (!frame && visible && !disposed && !document.hidden) frame=requestAnimationFrame(draw);
  }
  function draw(time: number) {
    frame=0;
    if (disposed || !visible || document.hidden || maps.some(map=>!map.image)) return;
    const interval = state==="perched" ? 80 : 18;
    if (time-last<interval) {schedule();return;}
    const dt = paused ? 0 : Math.min((time-last)/1000,.08);
    last = time; clock+=dt; elapsed+=dt;
    garden.update(clock);
    const t=clamp(elapsed/duration,0,1);
    const approach=smooth(t,.65,1);
    const airborne=1-approach;
    // Short powered climbs alternate with longer, open-wing glides.
    const speedEnvelope = .66*Math.sin(clock*3.75)+.34*Math.sin(clock*6.3+.4);
    const effort = airborne * (.18+.82*smooth(speedEnvelope,-.48,.34));
    wingPhase+=dt*Math.PI*2*(3.3+effort*2.6);
    const stroke=(phase:number)=>Math.sin(phase+.26*Math.sin(phase));
    const beat=stroke(wingPhase);
    if (t<1 && route) {
      if (approach>0 && state==="flying") {
        state="landing";
        perches=measurePerches();
        perch.copy(selectPerch());
        route.points[route.points.length-2].copy(perch).add(new THREE.Vector3(.32,.44,.25));
        route.points[route.points.length-1].copy(perch);
        route.updateArcLengths();
      }
      const travel=1-Math.pow(1-t,1.4);
      route.getPointAt(travel,sample);
      route.getTangentAt(travel,tangent);
      rig.position.copy(sample);
      rig.position.y+=Math.sin(wingPhase-.7)*flightScale*.10*effort;
      const heading=Math.atan2(-tangent.x, .42+tangent.y*.54);
      angles.set(-.28+tangent.z*.62+.13*beat*effort,
        -.23+tangent.x*.58,heading,"ZXY");
      attitude.setFromEuler(angles);
      if (t<.10) attitude.slerp(launchOrientation,1-smooth(t,0,.10));
      const settling=smooth(t,.78,1);
      if (settling>0) attitude.slerp(restPose,settling);
      rig.quaternion.slerp(attitude,1-Math.exp(-dt*12));
      const size=THREE.MathUtils.lerp(launchScale,flightScale,smooth(t,0,.25));
      rig.scale.setScalar(THREE.MathUtils.lerp(size,restingScale,approach));
    } else {
      state="perched";
      if(onFlower) garden.flowerPosition(perch);
      rig.position.copy(perch);
      rig.quaternion.copy(restPose);
      rig.scale.setScalar(restingScale);
    }
    // The trailing edge bends behind the leading edge on the power stroke.
    // On landing both pairs draw upright. Occasional slow openings remain.
    const restAngle=1.16-.32*Math.pow(.5+.5*Math.sin(clock*1.38),8);
    const rear=stroke(wingPhase-.31);
    butterfly.beat(
      THREE.MathUtils.lerp(.07+effort*(.38+.82*beat),restAngle,approach),
      THREE.MathUtils.lerp(.09+effort*(.36+.74*rear),restAngle-.05,approach),
      Math.cos(wingPhase)*effort, tangent.x*.09*airborne);
    renderer.render(scene,camera);
    host.dataset.ready="true";
    host.dataset.flight=state;
    if (!paused) schedule();
  }
  const restPose=new THREE.Quaternion().setFromEuler(new THREE.Euler(-.34,-.74,-1.14,"ZXY"));
  function proximity(event: PointerEvent) {
    if (paused || !visible || (event.type==="pointermove" && event.pointerType==="touch")) return;
    const bounds=host.getBoundingClientRect();
    lastPointer.set(event.clientX-bounds.left,event.clientY-bounds.top);
    if (lastPointer.x<0 || lastPointer.x>width || lastPointer.y<0 || lastPointer.y>height) return;
    if (elapsed<.8 && state==="flying") return;
    const distance=screenPosition(rig.position).distanceTo(lastPointer);
    if (distance < (state==="perched" ? 62 : compact ? 56 : 96)) depart(lastPointer);
  }
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if (visible) { last=performance.now(); schedule(); }
    else {cancelAnimationFrame(frame);frame=0;}
  });
  observer.observe(stage);
  // The first notification can precede layout stabilization. A late font load
  // must also move a resting butterfly with its letter.
  const sizes=new ResizeObserver(()=>{if(width!==host.clientWidth || height!==host.clientHeight) resize();});
  sizes.observe(host);
  void document.fonts.ready.then(()=>{if(!disposed) perches=measurePerches();});
  stage.addEventListener("pointermove",proximity,{passive:true});
  stage.addEventListener("pointerdown",proximity,{passive:true});
  document.addEventListener("visibilitychange",schedule);
  resize();
  return {
    takeFlight(){if(!paused) depart();},
    setPaused(value){paused=value;last=performance.now();schedule();},
    dispose(){
      disposed=true;cancelAnimationFrame(frame);observer.disconnect();sizes.disconnect();
      stage.removeEventListener("pointermove",proximity);
      stage.removeEventListener("pointerdown",proximity);
      document.removeEventListener("visibilitychange",schedule);
      garden.dispose();butterfly.dispose();maps.forEach(map=>map.dispose());renderer.dispose();renderer.domElement.remove();
      delete host.dataset.ready;delete host.dataset.flight;
    },
  };
}
