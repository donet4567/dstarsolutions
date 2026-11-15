"use client";
import { useEffect, useRef, useState } from "react";

/** A lightweight, original motion study. No project screenshots or video download. */
export default function SelectedWorkVideoCard() {
  const canvas=useRef<HTMLCanvasElement>(null);
  const figure=useRef<HTMLElement>(null);
  const pausedRef=useRef(false);
  const [paused,setPaused]=useState(false);
  const [reduced,setReduced]=useState(false);
  const [fullscreen,setFullscreen]=useState(false);
  useEffect(()=>{
    const element=canvas.current;if(!element)return;
    const ctx=element.getContext("2d",{alpha:false});if(!ctx)return;
    const preference=matchMedia("(prefers-reduced-motion: reduce)");
    let visible=false,frame=0,last=0,time=0,width=0,height=0;
    const render=()=>{
      const w=width,h=height;if(!w||!h)return;
      const t=time/1000;
      ctx.fillStyle="#071110";ctx.fillRect(0,0,w,h);
      // Continuous movement and smooth colour changes, without flashing cuts.
      const phase=(Math.sin(t*.65)+1)/2;
      const pink=[241,98,164],lime=[195,217,74];
      const ink=`rgb(${pink.map((a,i)=>Math.round(a+(lime[i]-a)*phase)).join(',')})`;
      const unit=Math.min(w,h);
      ctx.save();ctx.translate(w*.5,h*.45);ctx.rotate(t*.65);
      for(let i=0;i<7;i++){
        ctx.save();ctx.rotate(i*Math.PI/3.5);
        ctx.fillStyle=i%2?"#fff":ink;
        ctx.beginPath();ctx.roundRect(unit*.05,-unit*.065,unit*(.25+Math.sin(t*1.8+i)*.055),unit*.13,unit*.065);ctx.fill();ctx.restore();
      }
      ctx.restore();
      // Large moving letterforms are part of the artwork, not interface copy.
      ctx.save();ctx.translate(w*.5,h*.74);ctx.rotate(-.09);
      ctx.fillStyle=ink;ctx.fillRect(-w,-h*.075,w*2,h*.15);
      ctx.fillStyle="#071110";ctx.font=`900 ${Math.round(unit*.18)}px Arial`;ctx.textBaseline="middle";
      const label="MAKE IT MOVE. ",run=ctx.measureText(label).width,offset=(t*unit*.38)%run;
      for(let x=-w-offset;x<w;x+=run)ctx.fillText(label,x,0);
      ctx.restore();
      ctx.strokeStyle=ink;ctx.lineWidth=2;
      for(let i=0;i<5;i++){
        const x=((i*.24+t*.055)%1.25-.12)*w;
        const y=h*.12+Math.sin(t*1.5+i)*h*.035;
        ctx.strokeRect(x,y,unit*.055,unit*.055);
      }
      ctx.fillStyle="#fff";ctx.font=`700 ${Math.max(18,unit*.055)}px Arial`;ctx.textAlign="left";
      ctx.fillText("D STAR / MOTION STUDY",w*.07,h*.93);
    };
    const tick=(now:number)=>{
      frame=0;
      if(!visible||document.hidden||pausedRef.current||preference.matches)return;
      if(!last)last=now;
      const elapsed=now-last;
      if(elapsed>=1000/30){time+=Math.min(elapsed,70);last=now;render();}
      frame=requestAnimationFrame(tick);
    };
    const update=()=>{
      cancelAnimationFrame(frame);frame=0;last=0;
      element.dataset.running=String(visible&&!document.hidden&&!pausedRef.current&&!preference.matches);
      if(visible&&!document.hidden&&!pausedRef.current&&!preference.matches)frame=requestAnimationFrame(tick);
      else render();
    };
    const resize=new ResizeObserver(()=>{
      const rect=element.getBoundingClientRect();width=rect.width;height=rect.height;
      const dpr=Math.min(devicePixelRatio||1,1.5);
      element.width=Math.round(width*dpr);element.height=Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);render();
    });resize.observe(element);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:.1});observer.observe(element);
    const motionChange=()=>{setReduced(preference.matches);update();};motionChange();
    const fullChange=()=>setFullscreen(document.fullscreenElement===figure.current);
    preference.addEventListener("change",motionChange);document.addEventListener("visibilitychange",update);document.addEventListener("fullscreenchange",fullChange);element.addEventListener("preview-toggle",update);
    return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();preference.removeEventListener("change",motionChange);document.removeEventListener("visibilitychange",update);document.removeEventListener("fullscreenchange",fullChange);element.removeEventListener("preview-toggle",update);};
  },[]);
  return <aside className="selected-work-media" aria-label="Original motion study">
    <figure ref={figure} className="selected-work-video motion-reel">
      <canvas ref={canvas} role="img" aria-label="Abstract rotating ribbons and moving typography, an original D Star motion study" />
      <figcaption className="motion-reel-controls"><span>Ideas in motion.</span><div>{!reduced&&<button type="button" aria-pressed={paused} onClick={()=>{pausedRef.current=!paused;setPaused(!paused);canvas.current?.dispatchEvent(new Event("preview-toggle"));}}>{paused?"Play reel":"Pause reel"}</button>}<button type="button" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});else void figure.current?.requestFullscreen?.().catch(()=>{});}}>{fullscreen?"Exit full screen":"Full screen"}</button></div></figcaption>
    </figure>
  </aside>;
}
