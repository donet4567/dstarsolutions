import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

export type WorldController = { setProgress: (value:number) => void; setDispersed: (value:boolean) => void; setPaused: (value:boolean) => void; dispose: () => void };

function random(seed:number) { const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); }
function texture(width:number, height:number, paint:(context:CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  paint(context);
  const result = new THREE.CanvasTexture(canvas); result.colorSpace = THREE.SRGBColorSpace; return result;
}

// All scene geometry and surface textures are local and procedural.
export function mountStudioWorld(host:HTMLElement, interaction:HTMLElement):WorldController | undefined {
  const compact = matchMedia("(max-width:768px)").matches;
  let renderer:THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ alpha:false, antialias:!compact, powerPreference:"low-power" }); } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1 : 1.25));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x07080a); scene.fog = new THREE.FogExp2(0x07080a, .012);
  const camera = new THREE.PerspectiveCamera(44, 1, .1, 220); camera.position.set(0, 1.5, 11.5);
  const textures:THREE.Texture[] = [];
  const stone = texture(256,256,(context) => {
    context.fillStyle = "#08090b"; context.fillRect(0,0,256,256);
    for (let i=0;i<600;i++) { const grey = Math.floor(135+random(i+200)*120); context.fillStyle = `rgba(${grey},${grey},${grey},${.5+random(i+400)*.5})`; const size = .9+random(i+500)*1.4; context.fillRect(random(i)*256,random(i+100)*256,size,size); }
  }); textures.push(stone);
  const moonTexture = texture(512,256,(context) => {
    context.fillStyle="#222226"; context.fillRect(0,0,512,256);
    for (let i=0;i<2200;i++) { const x=random(i+20)*512,y=random(i+50)*256,r=1+random(i+90)*15; const glow=context.createRadialGradient(x-r*.2,y-r*.3,r*.1,x,y,r); const value=Math.floor(15+random(i+130)*45); glow.addColorStop(0,`rgba(${value},${value},${value+2},.4)`); glow.addColorStop(.7,"rgba(4,5,7,.3)"); glow.addColorStop(1,"rgba(120,115,100,.12)"); context.fillStyle=glow; context.fillRect(x-r,y-r,r*2,r*2); }
  }); textures.push(moonTexture);
  const galaxy = texture(512,128,(context) => {
    context.fillStyle="#08090b"; context.fillRect(0,0,512,128);
    for(let i=0;i<10000;i++) { const angle=random(i+10)*Math.PI*12, radius=Math.pow(random(i+20),.6)*220; const arm=Math.floor(random(i+30)*3)*Math.PI*2/3; const theta=angle*.15+radius*.024+arm; const x=256+Math.cos(theta)*radius, y=64+Math.sin(theta)*radius*.27+(random(i+40)-.5)*20; const brightness=Math.floor(100+random(i+50)*150); context.fillStyle=`rgba(${brightness},${Math.floor(brightness*.91)},${Math.floor(brightness*.76)},${.06+random(i+60)*.4})`; context.fillRect(x,y,random(i+70)*1.8+.3,random(i+80)+.3); }
    const core=context.createRadialGradient(256,64,0,256,64,32); core.addColorStop(0,"#fff0cfb0"); core.addColorStop(1,"#fff0cf00"); context.fillStyle=core; context.fillRect(210,20,92,88);
  }); textures.push(galaxy);

  scene.add(new THREE.HemisphereLight(0xb5bfce,0x09090b,.5));
  const key=new THREE.DirectionalLight(0xdde1ed,2.1); key.position.set(-5,8,10); scene.add(key);
  const sun=new THREE.DirectionalLight(0xe7c28c,3.8); sun.position.set(24,9,-14); scene.add(sun);
  const rim=new THREE.PointLight(0xe8d4b3,65,65,1.7); rim.position.set(11,4,-11); scene.add(rim);
  const front=new THREE.PointLight(0xaab3c4,12,25,1.5); front.position.set(-4,4,6); scene.add(front);

  const floorGeometry=new THREE.PlaneGeometry(260,260);
  const floorMaterial=new THREE.MeshStandardMaterial({color:0x101115,metalness:.85,roughness:.24});
  const floor=new THREE.Mesh(floorGeometry,floorMaterial); floor.rotation.x=-Math.PI/2; floor.position.y=-2.8; scene.add(floor);
  let mirror:Reflector | undefined;
  if(!compact) {
    mirror=new Reflector(new THREE.PlaneGeometry(220,220),{clipBias:.004,textureWidth:Math.min(1024,innerWidth),textureHeight:Math.min(512,innerHeight),color:0x303034});
    mirror.rotation.x=-Math.PI/2; mirror.position.y=-2.79; scene.add(mirror);
    const veil=new THREE.Mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshBasicMaterial({color:0x08090b,transparent:true,opacity:.68,depthWrite:false})); veil.rotation.x=-Math.PI/2; veil.position.y=-2.78; scene.add(veil);
  }
  const grid=new THREE.GridHelper(140,70,0x34363e,0x25272c); grid.position.y=-2.77; (grid.material as THREE.Material).transparent=true; (grid.material as THREE.Material).opacity=.055; scene.add(grid);
  const reflectionTexture=texture(128,256,(context)=>{const glow=context.createRadialGradient(64,64,0,64,96,120);glow.addColorStop(0,"#fff1c5a0");glow.addColorStop(.22,"#d5bd7e55");glow.addColorStop(1,"#d5bd7e00");context.fillStyle=glow;context.fillRect(0,0,128,256);context.globalCompositeOperation="destination-in";const across=context.createLinearGradient(0,0,128,0);across.addColorStop(0,"#0000");across.addColorStop(.3,"#000");across.addColorStop(.7,"#000");across.addColorStop(1,"#0000");context.fillStyle=across;context.fillRect(0,0,128,256);const along=context.createLinearGradient(0,0,0,256);along.addColorStop(0,"#0000");along.addColorStop(.15,"#000");along.addColorStop(.75,"#000");along.addColorStop(1,"#0000");context.fillStyle=along;context.fillRect(0,0,128,256);});textures.push(reflectionTexture);
  const reflectedLight=new THREE.Mesh(new THREE.PlaneGeometry(14,45),new THREE.MeshBasicMaterial({map:reflectionTexture,transparent:true,opacity:.48,blending:THREE.AdditiveBlending,depthWrite:false}));reflectedLight.rotation.x=-Math.PI/2;reflectedLight.position.set(10,-2.76,-7);scene.add(reflectedLight);

  const planet=new THREE.Mesh(new THREE.SphereGeometry(5.7,compact?32:56,32),new THREE.MeshStandardMaterial({map:moonTexture,color:0x797475,roughness:.96,metalness:.12}));
  planet.position.set(compact?7.8:15,1.5,-31); planet.rotation.set(.15,.3,.1); scene.add(planet);
  const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(5.77,32,24),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false,
    vertexShader:"varying vec3 vN; varying vec3 vV; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}",
    fragmentShader:"varying vec3 vN; varying vec3 vV; void main(){float rim=pow(1.0-abs(dot(normalize(vN),normalize(vV))),3.0);float light=clamp(vN.x*.7+vN.y*.15+.3,0.0,1.0);gl_FragColor=vec4(vec3(.75,.61,.41)*rim*light,rim*.45);}"})); atmosphere.position.copy(planet.position); scene.add(atmosphere);

  const skyPositions=new Float32Array((compact?260:650)*3);
  for(let i=0;i<skyPositions.length/3;i++) { skyPositions[i*3]=(random(i+500)-.5)*180; skyPositions[i*3+1]=random(i+600)*70-7; skyPositions[i*3+2]=-40-random(i+700)*100; }
  const skyGeometry=new THREE.BufferGeometry(); skyGeometry.setAttribute("position",new THREE.BufferAttribute(skyPositions,3));
  scene.add(new THREE.Points(skyGeometry,new THREE.PointsMaterial({color:0xd7d6d1,size:compact?.045:.055,transparent:true,opacity:.5,sizeAttenuation:true,depthWrite:false})));
  const groundPositions=new Float32Array(180*3);
  for(let i=0;i<180;i++) { groundPositions[i*3]=(random(i+1700)-.5)*65; groundPositions[i*3+1]=-2.74+random(i+1800)*.12; groundPositions[i*3+2]=(random(i+1900)-.5)*65; }
  const groundGeometry=new THREE.BufferGeometry(); groundGeometry.setAttribute("position",new THREE.BufferAttribute(groundPositions,3)); scene.add(new THREE.Points(groundGeometry,new THREE.PointsMaterial({color:0xc4b7a4,size:.065,transparent:true,opacity:.6})));

  const cubeGeometry=new RoundedBoxGeometry(.84,.84,.84,1,.018);
  const cubeMaterial=new THREE.MeshStandardMaterial({map:stone,color:0x8e929a,metalness:.65,roughness:.42,bumpMap:stone,bumpScale:.012,emissiveMap:stone,emissive:0xffffff,emissiveIntensity:.9});
  const edgeGeometry=new THREE.EdgesGeometry(new THREE.BoxGeometry(.84,.84,.84)); const edgeMaterial=new THREE.LineBasicMaterial({color:0x727782,transparent:true,opacity:.1});
  const cubes:{mesh:THREE.Group;base:THREE.Vector3;released:THREE.Vector3;rotation:THREE.Euler;phase:number}[]=[];
  for(let i=0;i<27;i++) {
    const mesh=new THREE.Group(); mesh.add(new THREE.Mesh(cubeGeometry,cubeMaterial),new THREE.LineSegments(edgeGeometry,edgeMaterial));
    const base=new THREE.Vector3((i%3-1)*1.12-1.1+(random(i+4)-.5)*1.6,Math.floor(i/3)%3*1.05-.15+(random(i+8)-.5)*1.1,(Math.floor(i/9)-1)*1.05-1.4+(random(i+10)-.5)*1.2);
    if(i%7===0) {base.y=-1.9+random(i+12)*.4;base.x+=(random(i+14)-.5)*2;}
    const released=base.clone().add(new THREE.Vector3((random(i+24)-.5)*12,(random(i+28)-.25)*6,(random(i+32)-.5)*9)); released.y=Math.max(-2.2,released.y);
    const rotation=new THREE.Euler((random(i+36)-.5)*1.4,(random(i+40)-.5)*1.4,(random(i+44)-.5)*.8);
    mesh.position.copy(base); mesh.rotation.copy(rotation); const size=.7+random(i+48)*.45; mesh.scale.setScalar(size); scene.add(mesh); cubes.push({mesh,base,released,rotation,phase:i*.83});
  }
  // Peripheral panes make the depth legible without an expensive particle field.
  const shardMaterial=new THREE.MeshStandardMaterial({map:stone,color:0x3d4148,transparent:true,opacity:.45,metalness:.55,roughness:.2,side:THREE.DoubleSide});
  const shardGeometry=new THREE.BufferGeometry(); shardGeometry.setAttribute("position",new THREE.Float32BufferAttribute([-.5,-.7,0,.5,-.45,0,.35,.7,0,-.5,-.7,0,.35,.7,0,-.4,.45,0],3)); shardGeometry.setAttribute("uv",new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2)); shardGeometry.computeVertexNormals();
  const shards:THREE.Mesh[]=[];
  for(let i=0;i<(compact?5:10);i++) { const shard=new THREE.Mesh(shardGeometry,shardMaterial); shard.position.set((i%2?1:-1)*(5+random(i+80)*5),random(i+90)*8-1,random(i+100)*9-2); shard.rotation.set(random(i+110),random(i+120)*2,random(i+130)); shard.scale.setScalar(.5+random(i+140)*1.5); scene.add(shard); shards.push(shard); }

  const observer=new THREE.Group(); const humanMaterial=new THREE.MeshStandardMaterial({color:0x31353c,metalness:.5,roughness:.65});
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.45,3,6),humanMaterial); body.position.y=.9;
  const head=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),humanMaterial); head.position.y=1.34; observer.add(body,head);
  for(const side of [-1,1]) { const leg=new THREE.Mesh(new THREE.CylinderGeometry(.04,.045,.62,6),humanMaterial); leg.position.set(side*.07,.35,0); const arm=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.54,6),humanMaterial); arm.position.set(side*.17,.88,0); arm.rotation.z=side*.08; observer.add(leg,arm); }
  observer.position.set(compact?3:5.8,-2.78,-6); observer.rotation.y=-.4; scene.add(observer);

  const ribbonGeometry=new THREE.PlaneGeometry(17,3.8,72,8);
  const positions=ribbonGeometry.attributes.position;
  for(let i=0;i<positions.count;i++) { const x=positions.getX(i),y=positions.getY(i); positions.setXYZ(i,x,y+Math.sin(x*.44)*1.1,Math.cos(x*.42)*1.4+y*Math.sin(x*.35)*.55); } ribbonGeometry.computeVertexNormals();
  const ribbon=new THREE.Mesh(ribbonGeometry,new THREE.MeshStandardMaterial({map:galaxy,emissive:0xaaa08b,emissiveMap:galaxy,emissiveIntensity:.45,roughness:.32,metalness:.15,side:THREE.DoubleSide})); ribbon.position.set(0,-2,-2); ribbon.rotation.z=-.4; ribbon.visible=false; scene.add(ribbon);

  const canvas=renderer.domElement; host.appendChild(canvas); host.dataset.ready="true";
  let composer:EffectComposer|undefined;
  let film:ShaderPass|undefined;
  let output:OutputPass|undefined;
  if(!compact) {
    composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));output=new OutputPass();composer.addPass(output);
    film=new ShaderPass({uniforms:{tDiffuse:{value:null},uResolution:{value:new THREE.Vector2(1440,1000)}},
      vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader:"uniform sampler2D tDiffuse;uniform vec2 uResolution;varying vec2 vUv;float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;c=pow(max(c,vec3(0.0)),vec3(.9));float grain=(noise(floor(vUv*uResolution))-.5)*.028;float vignette=1.0-smoothstep(.35,.86,length(vUv-.5))*.18;gl_FragColor=vec4(max(c*vignette+grain,vec3(0.0)),1.0);}"});composer.addPass(film);
  }
  let frame=0,disposed=false,visible=true,paused=false,dispersed=false,held=false,scatter=0,progress=0,targetProgress=0,px=0,py=0,clock=0,last=0,impulse=0,lastInteraction=0;
  let resizeTimer:ReturnType<typeof setTimeout>|undefined;
  let holdTimer:ReturnType<typeof setTimeout>|undefined; let downX=0,downY=0;
  const cameraDistance=compact?19:11.5;
  const currentCamera=new THREE.Vector3(0,1.5,cameraDistance),targetCamera=new THREE.Vector3(),lookAt=new THREE.Vector3();
  const draw=(time:number) => {
    frame=0; if(disposed || !visible || document.hidden) return;
    const active=time-lastInteraction<700||Math.abs(progress-targetProgress)>.005||Math.abs(scatter-(dispersed||held?1:impulse))>.01;
    const interval=1000/(compact?(active?30:20):(active?50:24));
    if(time-last<interval) { schedule(); return; }
    const elapsed=Math.min(.05,(time-last)/1000 || .016); const shouldAdvance=!paused; last=time;
    if(shouldAdvance) clock+=elapsed;
    progress+=(targetProgress-progress)*.07;
    const desired=dispersed||held?1:impulse; scatter+=(desired-scatter)*.08; impulse=Math.max(0,impulse-elapsed*.85);
    const travel=THREE.MathUtils.smoothstep(progress,0,1);
    targetCamera.set(Math.sin(travel*1.1)*2.5+px*.18,1.5+travel*1.3-py*.12,cameraDistance-travel*(compact?4:3.2)); currentCamera.lerp(targetCamera,.06); camera.position.copy(currentCamera); lookAt.set(-.1+travel, .6+travel*.25,-1.5-travel*2); camera.lookAt(lookAt);
    cubes.forEach(({mesh,base,released,rotation,phase}) => { mesh.position.lerpVectors(base,released,scatter); mesh.position.y+=Math.sin(clock*.35+phase)*.16; mesh.rotation.set(rotation.x+Math.sin(clock*.18+phase)*.1+scatter*phase*.16,rotation.y+Math.cos(clock*.14+phase)*.12+scatter*phase*.1,rotation.z+Math.sin(clock*.16+phase)*.08); });
    shards.forEach((shard,index) => { shard.rotation.y+=shouldAdvance?elapsed*.015*(index%2?1:-1):0; });
    const reveal=THREE.MathUtils.smoothstep(progress,.14,.65); ribbon.visible=reveal>.001; ribbon.position.y=-4.5+reveal*5.7; ribbon.rotation.z=-.55+travel*.35; ribbon.rotation.y=travel*.18;
    if(composer)composer.render();else renderer.render(scene,camera);
    host.dataset.scatter=scatter>.3?"dispersed":"gathered";
    if(!paused || Math.abs(scatter-desired)>.003 || Math.abs(progress-targetProgress)>.002 || currentCamera.distanceTo(targetCamera)>.005) schedule();
  };
  const schedule=() => { if(!frame && visible && !disposed && !document.hidden) frame=requestAnimationFrame(draw); };
  const pointer=(event:PointerEvent) => { if((event.target as Element).closest("a,button,nav,input,textarea,select"))return;lastInteraction=performance.now();px=event.clientX/innerWidth-.5; py=event.clientY/innerHeight-.5; if(holdTimer && Math.hypot(event.clientX-downX,event.clientY-downY)>12) { clearTimeout(holdTimer); holdTimer=undefined; held=false; } if(!paused) schedule(); };
  const release=() => { if(holdTimer) clearTimeout(holdTimer); holdTimer=undefined; held=false; schedule(); };
  const press=(event:PointerEvent) => { if((event.target as Element).closest("a,button,input,textarea,select,summary")) return; downX=event.clientX; downY=event.clientY; impulse=1; holdTimer=setTimeout(()=>{held=true;schedule();},350); schedule(); };
  const resize=() => { const width=host.clientWidth,height=host.clientHeight; if(!width||!height) return; renderer.setSize(width,height,false); composer?.setSize(width,height);film?.uniforms.uResolution.value.set(width*renderer.getPixelRatio(),height*renderer.getPixelRatio());camera.aspect=width/height; camera.updateProjectionMatrix(); schedule(); };
  const queueResize=()=>{if(resizeTimer)clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,120);};
  const intersection=new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; last=performance.now(); if(visible) schedule(); else {cancelAnimationFrame(frame);frame=0;} }); intersection.observe(interaction);
  const sizeObserver=new ResizeObserver(queueResize); sizeObserver.observe(host);
  interaction.addEventListener("pointermove",pointer,{passive:true}); interaction.addEventListener("pointerdown",press,{passive:true});
  addEventListener("pointerup",release); addEventListener("pointercancel",release); document.addEventListener("visibilitychange",schedule);
  resize();
  return {
    setProgress(value) { targetProgress=Math.min(1,Math.max(0,value)); schedule(); },
    setDispersed(value) { dispersed=value;lastInteraction=performance.now();schedule(); },
    setPaused(value) { paused=value; last=performance.now(); schedule(); },
    dispose() {
      disposed=true; cancelAnimationFrame(frame); if(holdTimer)clearTimeout(holdTimer);if(resizeTimer)clearTimeout(resizeTimer);intersection.disconnect(); sizeObserver.disconnect();
      interaction.removeEventListener("pointermove",pointer); interaction.removeEventListener("pointerdown",press); removeEventListener("pointerup",release); removeEventListener("pointercancel",release); document.removeEventListener("visibilitychange",schedule);
      const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
      scene.traverse((object) => { if(object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.Points) { geometries.add(object.geometry); const material=object.material; (Array.isArray(material)?material:[material]).forEach(item=>materials.add(item)); } });
      geometries.forEach(item=>item.dispose()); materials.forEach(item=>item.dispose()); textures.forEach(item=>item.dispose()); mirror?.getRenderTarget().dispose();film?.dispose();output?.dispose();composer?.dispose();renderer.dispose(); canvas.remove(); delete host.dataset.ready; delete host.dataset.scatter;
    },
  };
}
