"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { WorldController } from "./studio-world";

function subscribeMotion(callback:()=>void) { const media=matchMedia("(prefers-reduced-motion: reduce)"); media.addEventListener("change",callback); return ()=>media.removeEventListener("change",callback); }
function subscribeWidth(callback:()=>void) { const media=matchMedia("(max-width:768px)"); media.addEventListener("change",callback); return ()=>media.removeEventListener("change",callback); }
const fallbackCubes=Array.from({length:18},(_,index)=>({x:(index%3-1)*76+Math.sin(index*2)*22,y:(Math.floor(index/3)%3-1)*70+Math.cos(index)*20,z:(Math.floor(index/9)-.5)*75,rotation:index*23%70-35}));

export default function StudioWorld() {
  const host=useRef<HTMLDivElement>(null);
  const world=useRef<WorldController|undefined>(undefined);
  const current=useRef({dispersed:false,paused:false});
  const [dispersed,setDispersed]=useState(false),[paused,setPaused]=useState(false);
  const reduced=useSyncExternalStore(subscribeMotion,()=>matchMedia("(prefers-reduced-motion: reduce)").matches,()=>false);
  const compact=useSyncExternalStore(subscribeWidth,()=>matchMedia("(max-width:768px)").matches,()=>false);
  useEffect(()=>{
    const element=host.current,story=element?.closest<HTMLElement>(".orbit-story");
    if(!element||!story||reduced) return;
    let disposed=false,frame=0,idle:number|undefined,progress=0;
    const update=()=>{frame=0;progress=Math.min(1,Math.max(0,-story.getBoundingClientRect().top/(innerHeight*1.15)));world.current?.setProgress(progress);};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const load=()=>{import("./studio-world").then(({mountStudioWorld})=>{
      if(disposed)return;
      world.current=mountStudioWorld(element,story);world.current?.setProgress(progress);world.current?.setDispersed(current.current.dispersed);world.current?.setPaused(current.current.paused);
    }).catch(()=>{/* The locally rendered scene remains visible if WebGL is unavailable. */});};
    // Paint readable content and the static world before compiling the 3D renderer.
    const timer=window.setTimeout(()=>{if("requestIdleCallback" in window)idle=requestIdleCallback(load,{timeout:1200});else load();},300);
    addEventListener("scroll",schedule,{passive:true});addEventListener("resize",schedule,{passive:true});update();
    return()=>{disposed=true;clearTimeout(timer);if(idle!==undefined)cancelIdleCallback(idle);cancelAnimationFrame(frame);removeEventListener("scroll",schedule);removeEventListener("resize",schedule);world.current?.dispose();world.current=undefined;};
  },[reduced,compact]);
  return <div className="studio-world" data-dispersed={dispersed} style={{"--world-dispersed":dispersed?1:0} as CSSProperties}>
    <div className="world-layer" aria-hidden="true"><div ref={host} className="world-viewport"><div className="world-fallback"><div className="world-fallback-stars"/><div className="world-fallback-planet"/><div className="world-fallback-ground"/><div className="world-fallback-cluster">{fallbackCubes.map((cube,index)=><div className="world-fallback-cube" key={index} style={{"--cx":`${cube.x.toFixed(3)}px`,"--cy":`${cube.y.toFixed(3)}px`,"--cz":`${cube.z}px`,"--cr":`${cube.rotation}deg`} as CSSProperties}><i/><i/><i/></div>)}</div></div></div></div>
    <div className="world-controls"><p><span aria-hidden="true">◇</span> Click the scene to send a ripple.<br/><span aria-hidden="true">↗</span> Hold to release the forms.</p><div><button type="button" aria-pressed={dispersed} onClick={()=>{const next=!dispersed;current.current.dispersed=next;setDispersed(next);world.current?.setDispersed(next);}}><span aria-hidden="true">{dispersed?"▦":"◇"}</span>{dispersed?"Gather forms":"Release forms"}</button><button type="button" aria-label="Pause scene motion" aria-pressed={paused||reduced} disabled={reduced} onClick={()=>{const next=!paused;current.current.paused=next;setPaused(next);world.current?.setPaused(next);}}><span aria-hidden="true">{paused||reduced?"▷":"Ⅱ"}</span>{reduced?"Static scene":paused?"Resume motion":"Pause motion"}</button></div><span className="world-status" role="status">{dispersed?"Forms released":"Forms gathered"}</span></div>
  </div>;
}
