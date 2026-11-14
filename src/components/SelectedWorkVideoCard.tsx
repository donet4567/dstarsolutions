"use client";
import { useEffect, useRef, useState } from "react";

export default function SelectedWorkVideoCard() {
  const video=useRef<HTMLVideoElement>(null);
  const [paused,setPaused]=useState(false);
  const pausedRef=useRef(false);
  useEffect(()=>{
    const element=video.current;
    if(!element) return;
    const preference=matchMedia("(prefers-reduced-motion: reduce)");
    let visible=false,disposed=false;
    const update=()=>{
      if(preference.matches || !visible || document.hidden || pausedRef.current) {
        element.pause();
        if(preference.matches) {element.removeAttribute("src");element.load();}
        return;
      }
      if(!element.getAttribute("src")) element.src="/videos/selected-work-preview.webm";
      void element.play().then(()=>{if(disposed) element.pause();}).catch(()=>{});
    };
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:.1});
    observer.observe(element);
    preference.addEventListener("change",update);
    document.addEventListener("visibilitychange",update);
    element.addEventListener("preview-toggle",update);
    return()=>{disposed=true;observer.disconnect();preference.removeEventListener("change",update);document.removeEventListener("visibilitychange",update);element.removeEventListener("preview-toggle",update);element.pause();};
  },[]);
  return <aside className="selected-work-media" aria-label="Project motion preview">
    <figure className="selected-work-video">
      <video ref={video} autoPlay muted loop playsInline preload="none" poster="/images/selected-work-poster.jpg" aria-label="A gentle loop through the three selected project artworks" />
      <figcaption>A moving glimpse of our digital work.</figcaption>
      <button type="button" aria-pressed={paused} onClick={()=>{pausedRef.current=!paused;setPaused(!paused);video.current?.dispatchEvent(new Event("preview-toggle"));}}>{paused?"Play preview":"Pause preview"}</button>
    </figure>
  </aside>;
}
