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
    let disposed=false,loading=false,visible=false,activated=false;
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
    const activate=()=>{
      activated=true;
      if(visible) void load();
    };
    const activateNearButterfly=(event:PointerEvent)=>{
      const proof=element.querySelector<HTMLElement>(".world-proof");
      const bounds=proof?.getBoundingClientRect();
      if(bounds && event.clientX>=bounds.left && event.clientX<=bounds.right &&
        event.clientY>=bounds.top && event.clientY<=bounds.bottom) activate();
    };
    const activateOnFirstTouch=()=>activate();
    document.addEventListener("touchstart",activateOnFirstTouch,{passive:true,once:true});
    const observer=new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      if(visible && activated) void load();
    });
    stage.addEventListener("pointermove",activateNearButterfly,{passive:true});
    stage.addEventListener("pointerdown",activateNearButterfly,{passive:true});
    const canvasReady=new MutationObserver(()=>{
      if(element.dataset.ready==="true") {setReady(true);canvasReady.disconnect();}
    });
    canvasReady.observe(element,{attributes:true,attributeFilter:["data-ready"]});
    observer.observe(stage);
    return ()=>{
      disposed=true;observer.disconnect();canvasReady.disconnect();
      stage.removeEventListener("pointermove",activateNearButterfly);
      stage.removeEventListener("pointerdown",activateNearButterfly);
      document.removeEventListener("touchstart",activateOnFirstTouch);
      world.current?.dispose();world.current=undefined;setReady(false);
    };
  },[reduced]);
  return <div className="studio-world">
    <div className="world-layer" aria-hidden="true"><div ref={host} className="world-viewport"><div className="world-fallback"><div className="world-proof"/></div></div></div>
    <div className="world-controls">
      <p>Touch the screen or approach the butterfly to see it fly. <a className="wing-credit" href="/models/monarch/CREDITS.txt" aria-label="Butterfly photograph credit">Image credit</a></p>
      <div>{ready&&!reduced&&<button type="button" disabled={paused} onClick={()=>world.current?.takeFlight()}>Take flight <span aria-hidden="true">↗</span></button>}
      {!reduced&&<button type="button" aria-label="Pause scene motion" aria-pressed={paused} disabled={!ready} onClick={()=>{
        const next=!paused;pausePreference.current=next;setPaused(next);world.current?.setPaused(next);
      }}>{paused?"Resume motion":"Pause motion"}</button>}</div>
    </div>
  </div>;
}
