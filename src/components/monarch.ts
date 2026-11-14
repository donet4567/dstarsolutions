import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const unit = .0045;
const hingeX = 661, hingeY = 467;

// Trace the right-hand pair in specimen coordinates so every vein keeps its
// place on the membrane as the wing cups, twists and folds about the thorax.
function membrane(fore: boolean) {
  const edge = new THREE.Path();
  if (fore) {
    edge.moveTo(662,448);
    edge.bezierCurveTo(738,318,925,99,1088,89);
    edge.bezierCurveTo(1111,86,1135,86,1140,91);
    edge.bezierCurveTo(1168,110,1163,149,1154,179);
    edge.bezierCurveTo(1144,233,1100,259,1085,310);
    edge.bezierCurveTo(1074,359,1054,390,1042,450);
    edge.bezierCurveTo(1039,482,988,487,912,483);
    edge.bezierCurveTo(827,479,737,495,681,474);
    edge.quadraticCurveTo(662,462,662,448);
  } else {
    edge.moveTo(669,475);
    edge.bezierCurveTo(745,452,840,465,911,487);
    edge.bezierCurveTo(980,508,1038,555,1039,606);
    edge.bezierCurveTo(1046,634,1029,651,1027,681);
    edge.bezierCurveTo(1016,697,1001,717,994,738);
    edge.bezierCurveTo(982,756,960,753,944,776);
    edge.bezierCurveTo(926,805,905,802,882,812);
    edge.bezierCurveTo(851,826,809,828,784,823);
    edge.bezierCurveTo(746,817,735,807,722,778);
    edge.bezierCurveTo(690,707,668,631,661,558);
    edge.quadraticCurveTo(654,512,669,475);
  }
  const outline = edge.getSpacedPoints(112).slice(0,-1);
  const center = new THREE.Vector2(fore ? 930 : 835, fore ? 342 : 630);
  const positions: number[] = [], uvs: number[] = [], flex: number[] = [], twist: number[] = [], indices: number[] = [];
  function vertex(x: number, y: number) {
    const span = Math.max(0,(x-hingeX)/500);
    const camber = .14*Math.sin(Math.PI*span) - .10*span*span + .015*Math.cos(y*.026)*span;
    positions.push((x-hingeX)*unit,(hingeY-y)*unit,camber);
    uvs.push((x-646)/522, 1-(y-80)/756);
    const chord = (hingeY-y)*unit - span*(fore ? 1.6 : -.6);
    twist.push(0, 0, span*chord*.46);
    flex.push(-.035*span*span, -.04*span*span, -.30*span*span);
  }
  vertex(center.x,center.y);
  for (let row=1; row<=9; row++) {
    for (let i=0; i<outline.length; i++) {
      const t=row/9;
      vertex(THREE.MathUtils.lerp(center.x,outline[i].x,t),THREE.MathUtils.lerp(center.y,outline[i].y,t));
      const start=1+(row-1)*outline.length;
      const a=start+i, b=start+(i+1)%outline.length;
      if (row===1) indices.push(0,b,a);
      else indices.push(a-outline.length,b,a, a-outline.length,b-outline.length,b);
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices);
  geometry.morphTargetsRelative=true;
  geometry.morphAttributes.position=[new THREE.Float32BufferAttribute(flex,3),new THREE.Float32BufferAttribute(twist,3)];
  geometry.computeVertexNormals();
  return geometry;
}

function anatomy() {
  const parts: THREE.BufferGeometry[] = [];
  function tint(geometry: THREE.BufferGeometry, color: number) {
    const rgb=new THREE.Color(color);
    const values= new Float32Array(geometry.attributes.position.count*3);
    for(let i=0;i<values.length;i+=3) rgb.toArray(values,i);
    geometry.setAttribute("color",new THREE.BufferAttribute(values,3));
    parts.push(geometry);
  }
  function oval(x:number,y:number,z:number,w:number,h:number,d:number,color:number) {
    const shape=new THREE.SphereGeometry(1,18,14);
    shape.scale(w,h,d).translate(x,y,z);
    tint(shape,color);
  }
  function filament(points: number[][], thickness:number, color:number) {
    const path=new THREE.CatmullRomCurve3(points.map(([x,y,z])=>new THREE.Vector3(x,y,z)));
    tint(new THREE.TubeGeometry(path,16,thickness,6,false),color);
  }
  const charcoal=0x2b201e;

  for(const side of [-1,1]) {
    oval(side*.054,.239,.058,.031,.039,.026,0x171416);
    filament([[side*.044,.275,.06],[side*.13,.54,.12],[side*.30,.78,.11],[side*.46,.93,.06]],.011,charcoal);
    oval(side*.46,.93,.06,.019,.032,.017,charcoal);
    for(let i=0;i<3;i++) {
      const y=.14-i*.14;
      filament([[side*.09,y,-.04],[side*.23,y-.06,-.21],[side*(.32+i*.045),y-.23,-.29],[side*.27,y-.36,-.32]],.009,charcoal);
    }

  }
  const merged=mergeGeometries(parts)!;
  parts.forEach(part=>part.dispose());
  return new THREE.Mesh(merged,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.78}));
}

// Elliptical body sections follow the specimen from crown to abdomen tip.
// Projecting the dorsal photograph over the volume retains its scale markings.
function bodySurface(map: THREE.Texture) {
  const profile = [[392,2],[402,13],[418,15],[429,23],[452,30],[481,32],[505,28],[529,23],
    [542,18],[565,22],[610,25],[650,24],[685,22],[704,19],[718,13],[737,10],[748,2]];
  const vertices:number[]=[],uvs:number[]=[],faces:number[]=[];
  const slices=32;
  profile.forEach(([y,radius],row)=>{
    for(let i=0;i<=slices;i++) {
      const theta=i/slices*Math.PI*2;
      const x=Math.cos(theta)*radius;
      vertices.push(x*unit,(hingeY-y)*unit,Math.sin(theta)*radius*unit*.84+.035);
      uvs.push((634+x-586)/98,1-(y-378)/388);
      if(row && i) {
        const b=row*(slices+1)+i, a=b-slices-1;
        faces.push(a-1,a,b, a-1,b,b-1);
      }
    }
  });
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
  geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
  geometry.setIndex(faces);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map,roughness:.86}));
}

export function makeMonarch(map: THREE.Texture, bodyMap: THREE.Texture, underside: THREE.Texture) {
  const rig=new THREE.Group();
  const material=new THREE.MeshStandardMaterial({map,roughness:.84});
  const ventral=new THREE.MeshStandardMaterial({map:underside,side:THREE.BackSide,roughness:.9});
  const fore=membrane(true), hind=membrane(false);
  const wings: {front:THREE.Mesh;back:THREE.Mesh;side:number}[]=[];
  for(const side of [-1,1]) {
    const shoulder=new THREE.Group();
    shoulder.position.x=side*.075;
    shoulder.scale.x=side;
    const front=new THREE.Mesh(fore,material),back=new THREE.Mesh(hind,material);
    front.position.z=.027;
    for (const wing of [front,back]) {
      const reverse=new THREE.Mesh(wing.geometry,ventral);
      reverse.morphTargetInfluences=wing.morphTargetInfluences;
      wing.add(reverse);
    }
    shoulder.add(front,back);
    rig.add(shoulder);
    wings.push({front,back,side});
  }
  const body=anatomy();
  const shell=bodySurface(bodyMap);
  rig.add(body,shell);
  return {
    rig,
    beat(angle:number, lag:number, flex:number, bank:number) {
      for (const {front,back,side} of wings) {
        front.rotation.set(.045*flex,-angle-side*bank,.07*flex);
        back.rotation.set(-.035*flex,-lag-side*bank*.65,-.047*flex);
        front.morphTargetInfluences![0]=flex;
        back.morphTargetInfluences![0]=flex*.8;
        front.morphTargetInfluences![1]=flex;
        back.morphTargetInfluences![1]=flex*.65;
      }
    },
    dispose() {
      fore.dispose(); hind.dispose(); material.dispose(); ventral.dispose(); body.geometry.dispose(); body.material.dispose();
      shell.geometry.dispose(); shell.material.dispose();
    },
  };
}
