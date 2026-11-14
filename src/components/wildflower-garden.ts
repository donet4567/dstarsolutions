import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type V = THREE.Vector3;
const v = (x:number,y:number,z:number) => new THREE.Vector3(x,y,z);

export function makeGarden() {
  const pieces:THREE.BufferGeometry[]=[];
  let seed=431;
  function random() { seed=(1664525*seed+1013904223)>>>0;return seed/4294967296; }
  function add(geometry:THREE.BufferGeometry,color:number,pose?:THREE.Matrix4) {
    if(pose) geometry.applyMatrix4(pose);
    geometry.deleteAttribute("uv");
    const rgb=new THREE.Color(color);
    const colors=new Float32Array(geometry.attributes.position.count*3);
    for(let i=0;i<colors.length;i+=3) rgb.toArray(colors,i);
    geometry.setAttribute("color",new THREE.BufferAttribute(colors,3));
    pieces.push(geometry);
  }
  function oval(center:V,scale:V,color:number) {
    const geometry=new THREE.SphereGeometry(1,10,7);
    geometry.scale(scale.x,scale.y,scale.z).translate(center.x,center.y,center.z);
    add(geometry,color);
  }
  function stem(points:V[],radius:number,color:number) {
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),8,radius,5,false),color);
  }

  // A rib along the middle and a thin, ruffled margin catch different light.
  function blade(origin:V,tip:V,width:number,curl:number,color:number,side:V,pose?:THREE.Matrix4,round=false) {
    const vertices:number[]=[],indices:number[]=[];
    for(let row=0;row<=7;row++) {
      const t=row/7;
      const span=round?Math.sin(Math.pow(t,.72)*Math.PI*.88):Math.sin(Math.PI*t);
      for(let col=0;col<=4;col++) {
        const u=(col-2)/2;
        const p=origin.clone().lerp(tip,t).addScaledVector(side,u*width*span);
        p.z+=curl*t*t + span*(1-u*u)*width*.24 + Math.sin(t*13+u*2)*t*width*.09;
        vertices.push(p.x,p.y,p.z);
        if(row && col) {const j=row*5+col;indices.push(j-6,j-5,j,j-6,j,j-1);}
      }
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
    add(g,color,pose);
  }

  const restingFlower=v(-.3,1.66,.15);
  const plants=[
    {top:restingFlower,r:.22,poppy:true}, {top:v(-1.06,1.27,.02),r:.16,poppy:true},
    {top:v(.61,1.89,-.22),r:.19,poppy:true}, {top:v(1.0,.93,.22),r:.12,poppy:true},
    {top:v(.16,1.19,.36),r:.115,poppy:false}, {top:v(-.78,.81,.34),r:.12,poppy:false},
    {top:v(.92,1.36,-.06),r:.102,poppy:false},{top:v(-1.32,.89,-.12),r:.09,poppy:false},
    {top:v(.37,.69,.45),r:.115,poppy:false},
  ];
  const greens=[0x566333,0x717843,0x38492d,0x81904e,0x596f46];
  for(const {top,r,poppy} of plants) {
    const root=v(top.x*.79,-.025,top.z*.6);
    const middle=root.clone().lerp(top,.54);middle.x+=random()*.28-.14;
    stem([root,middle,top],poppy?.012:.008,0x697b43);
    for(let i=0;i<4;i++) {
      const base=root.clone().lerp(middle,.2+i*.24);
      const side=i%2?-1:1;
      blade(base,base.clone().add(v(side*(.19+random()*.12),.15+random()*.22,.14)),.049,.07,
        greens[i],v(0,1,.25));
    }
    const pose=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-.60-random()*.55,random()*.8-.4,random()*.7));
    pose.setPosition(top);
    const count=poppy?6:15;
    for(let i=0;i<count;i++) {
      const a=i/count*Math.PI*2+(poppy?.11*random():0);
      const ray=v(Math.cos(a),Math.sin(a),0);
      const side=v(-ray.y,ray.x,0);
      const length=r*(.89+random()*.2);
      const tip=ray.clone().multiplyScalar(length);
      tip.z=poppy?.045:-.025;
      const color=poppy?[0xd8391d,0xf05227,0xf7743d,0xc8291d,0xe94926,0xf76a35][i]:(i%3?0xfff1d1:0xe2d9ad);
      blade(ray.clone().multiplyScalar(.013),tip,poppy?r*.50:r*.12,poppy?.060:-.03,color,side,pose,true);
    }
    const center=v(0,0,.031).applyMatrix4(pose);
    oval(center,v(r*.22,r*.17,r*.21),poppy?0x392c21:0xbe8522);
    for(let i=0;i<(poppy?24:10);i++) {
      const a=i*2.39996,rad=r*.25*Math.sqrt((i+.5)/(poppy?24:10));
      const pos=v(Math.cos(a)*rad,Math.sin(a)*rad,.047+random()*.014).applyMatrix4(pose);
      oval(pos,v(.005,.008,.006),poppy?0x583e22:0xeab94c);
    }
  }

  // Taper the planting outwards with fine grasses, taller seed heads and gravel.
  for(let i=0;i<110;i++) {
    const a=random()*Math.PI*2, radius=Math.sqrt(random());
    const root=v(Math.cos(a)*radius*1.49,0,Math.sin(a)*radius*.39);
    const h=.15+random()*(i%8===0?1.15:.51);
    const tip=root.clone().add(v((random()-.49)*.51,h,(random()-.5)*.24));
    blade(root,tip,.012+random()*.018,.035,greens[i%5],v(1,0,.35));
    if(i%8===0) {
      for(let j=0;j<6;j++) {
        const pos=root.clone().lerp(tip,.68+j*.05);
        const ear=pos.clone().add(v((j%2?1:-1)*.07,.10,.015));
        blade(pos,ear,.017,.004,0xb8a36c,v(1,0,.2));
      }
    }
  }
  for(let i=0;i<150;i++) {
    const a=random()*Math.PI*2,r=Math.sqrt(random()),size=.024+random()*.053;
    oval(v(Math.cos(a)*r*1.54,-.045+random()*.042,Math.sin(a)*r*.44),
      v(size*1.5,size*.48,size),[0x7c7356,0x9a9072,0x666849,0xb7ad92,0x606447][i%5]);
  }
  const geometry=mergeGeometries(pieces)!;
  pieces.forEach(g=>g.dispose());
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,side:THREE.DoubleSide});
  const breeze={value:0};
  material.onBeforeCompile=shader=>{
    shader.uniforms.uBreeze=breeze;
    shader.vertexShader="uniform float uBreeze;\n"+shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\ntransformed.x += uBreeze * pow(max(0.0,position.y),2.0);");
  };
  const mesh=new THREE.Mesh(geometry,material);
  const flower=restingFlower.clone().add(v(0,.038,.065));
  return {
    mesh,
    update(time:number){breeze.value=.011*Math.sin(time*1.7)+.006*Math.sin(time*2.4+.8);},
    flowerPosition(out=new THREE.Vector3()){
      out.copy(flower);
      out.x+=breeze.value*flower.y*flower.y;
      return mesh.localToWorld(out);
    },
    dispose(){geometry.dispose();material.dispose();},
  };
}
