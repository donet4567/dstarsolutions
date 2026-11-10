"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { WorldController } from "./studio-world";

function subscribeMotion(callback:()=>void) { const media=matchMedia("(prefers-reduced-motion: reduce)"); media.addEventListener("change",callback); return ()=>media.removeEventListener("change",callback); }
function subscribeWidth(callback:()=>void) { const media=matchMedia("(max-width:768px)"); media.addEventListener("change",callback); return ()=>media.removeEventListener("change",callback); }
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
    let disposed=false,frame=0,idle:number|undefined,progress=0,visible=false,loading=false;
    const update=()=>{frame=0;progress=Math.min(1,Math.max(0,-story.getBoundingClientRect().top/(innerHeight*1.15)));world.current?.setProgress(progress);};
    const schedule=()=>{if(visible&&!frame)frame=requestAnimationFrame(update);};
    const load=()=>{if(disposed||!visible||loading)return;loading=true;import("./studio-world").then(({mountStudioWorld})=>{
      if(disposed)return;
      world.current=mountStudioWorld(element,story);world.current?.setProgress(progress);world.current?.setDispersed(current.current.dispersed);world.current?.setPaused(current.current.paused);
    }).catch(()=>{/* The locally rendered scene remains visible if WebGL is unavailable. */});};
    // Paint readable content and the static world before compiling the 3D renderer.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) return;
      schedule();
      if (!loading) {
        if ("requestIdleCallback" in window) idle = requestIdleCallback(load, { timeout: 1000 });
        else load();
      }
    });
    observer.observe(story);
    addEventListener("scroll",schedule,{passive:true});addEventListener("resize",schedule,{passive:true});update();
    return()=>{disposed=true;observer.disconnect();if(idle!==undefined)cancelIdleCallback(idle);cancelAnimationFrame(frame);removeEventListener("scroll",schedule);removeEventListener("resize",schedule);world.current?.dispose();world.current=undefined;};
  },[reduced,compact]);
  return <div className="studio-world" data-dispersed={dispersed}>
    <div className="world-layer" aria-hidden="true"><div ref={host} className="world-viewport"><div className="world-fallback"><div className="world-proof"><i/><i/><i/><b/></div></div></div></div>
    <div className="world-controls"><p><span aria-hidden="true">◇</span> Tap to separate the bearings.<br/><span aria-hidden="true">↗</span> Hold for the exploded view.</p><div><button type="button" aria-pressed={dispersed} onClick={()=>{const next=!dispersed;current.current.dispersed=next;setDispersed(next);world.current?.setDispersed(next);}}><span aria-hidden="true">{dispersed?"▦":"◇"}</span>{dispersed?"Gather forms":"Release forms"}</button><button type="button" aria-label="Pause scene motion" aria-pressed={paused||reduced} disabled={reduced} onClick={()=>{const next=!paused;current.current.paused=next;setPaused(next);world.current?.setPaused(next);}}><span aria-hidden="true">{paused||reduced?"▷":"Ⅱ"}</span>{reduced?"Static scene":paused?"Resume motion":"Pause motion"}</button></div><span className="world-status" role="status">{dispersed?"Forms released":"Forms gathered"}</span></div>
  </div>;
}
