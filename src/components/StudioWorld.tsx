"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { WorldController } from "./studio-world";

const preference = "(prefers-reduced-motion: reduce)";
function subscribe(callback: () => void) {
  const media=matchMedia(preference);
  media.addEventListener("change",callback);
  return ()=>media.removeEventListener("change",callback);
}

export default function StudioWorld() {
  const host=useRef<HTMLDivElement>(null);
  const world=useRef<WorldController|undefined>(undefined);
  const [paused,setPaused]=useState(false);
  const [ready,setReady]=useState(false);
  const pausePreference=useRef(false);
  const reduced=useSyncExternalStore(subscribe,()=>matchMedia(preference).matches,()=>false);
  useEffect(()=>{
    const element=host.current,stage=element?.closest<HTMLElement>(".flight-stage");
    if (!element || !stage || reduced) return;
    let disposed=false,loading=false,visible=false,idle:number|undefined;
    const load=async()=>{
      if(disposed || loading || !visible) return;
      loading=true;
      try {
        const {mountStudioWorld}=await import("./studio-world");
        if(disposed) return;
        world.current=mountStudioWorld(element,stage);
        world.current?.setPaused(pausePreference.current);
      } catch { /* The still render remains on screen. */ }
    };
    const observer=new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      if(!visible || loading) return;
      if("requestIdleCallback" in window) idle=requestIdleCallback(load,{timeout:900});
      else void load();
    });
    const canvasReady=new MutationObserver(()=>{
      if(element.dataset.ready==="true") {setReady(true);canvasReady.disconnect();}
    });
    canvasReady.observe(element,{attributes:true,attributeFilter:["data-ready"]});
    observer.observe(stage);
    return ()=>{
      disposed=true;observer.disconnect();canvasReady.disconnect();
      if(idle!==undefined) cancelIdleCallback(idle);
      world.current?.dispose();world.current=undefined;setReady(false);
    };
  },[reduced]);
  const isStatic=reduced||!ready;
  return <div className="studio-world">
    <div className="world-layer" aria-hidden="true"><div ref={host} className="world-viewport"><div className="world-fallback"><div className="world-proof"/></div></div></div>
    <div className="world-controls">
      <p>Approach the butterfly to see it fly. <a className="wing-credit" href="/models/monarch/CREDITS.txt" aria-label="Butterfly photograph credit">Image credit</a></p>
      <div><button type="button" disabled={isStatic||paused} onClick={()=>world.current?.takeFlight()}>Take flight <span aria-hidden="true">↗</span></button>
      <button type="button" aria-label="Pause scene motion" aria-pressed={paused||reduced} disabled={isStatic} onClick={()=>{
        const next=!paused;pausePreference.current=next;setPaused(next);world.current?.setPaused(next);
      }}>{reduced?"Static scene":paused?"Resume motion":"Pause motion"}</button></div>
    </div>
  </div>;
}
