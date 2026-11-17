"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShowroomQuery } from "./useShowroomQuery";
import { Arrow } from "./Brand";
import { businessExamples, type BusinessExample } from "./website-content";
import { whatsappUrl } from "./site";

export function ConceptImage({ example, eager = false }: { example: BusinessExample; eager?: boolean }) {
  return <picture><source type="image/avif" srcSet={`/gallery/${example.tone}-640.avif 640w, /gallery/${example.tone}-1280.avif 1280w`} sizes="(max-width:600px) 90vw, (max-width:1000px) 90vw, 55vw" /><img src={`/gallery/${example.tone}-1280.webp`} srcSet={`/gallery/${example.tone}-640.webp 640w, /gallery/${example.tone}-1280.webp 1280w`} sizes="(max-width:600px) 90vw, (max-width:1000px) 90vw, 55vw" width={1536} height={1024} loading={eager ? "eager" : "lazy"} decoding="async" alt={`${example.brand}: an original ${example.category.toLowerCase()} website design concept`} /></picture>;
}

const categories = ["Cafe", "Salon", "Architecture", "Boutique", "Hospitality", "Professional"];

function GalleryCard({ example, index, source, category }: { example: BusinessExample; index: number; source: string; category: string | null }) {
  const [detail, setDetail] = useState(false);
  const demoUrl = `/website-demos/${example.slug}?from=${source}${category && category !== "all" ? `&category=${category}` : ""}`;
  return <article className="business-card">
    <div className="gallery-image-stage" data-detail={detail}><Link href={demoUrl} aria-label={`View ${example.brand} demo`}><ConceptImage example={example} /></Link><span className="gallery-image-index">D STAR STUDIES / 0{index + 1}</span></div>
    <div className="image-view-controls" role="group" aria-label={`${example.brand} image composition`}><button type="button" aria-pressed={!detail} onClick={() => setDetail(false)}>Full composition</button><button type="button" aria-pressed={detail} onClick={() => setDetail(true)}>Detail crop</button></div>
    <div className="business-card-copy"><h3>{example.brand}<span className="gallery-category">{example.category}</span></h3><p>{example.description}</p><div className="business-card-actions"><Link href={demoUrl} className="text-link">View Demo <Arrow diagonal /></Link><a href={whatsappUrl(`Hello D Star, I’m interested in a ${example.category.toLowerCase()} website similar to your ${example.brand} demo concept. Please help me with a quote.`)} target="_blank" rel="noreferrer" className="text-link">Enquire for Similar Website <Arrow diagonal /></a></div></div>
  </article>;
}

export default function BusinessShowcase({ source = "home" }: { source?: "home" | "guide" | "work" }) {
  const journey = useRef<HTMLDivElement>(null);
  const studies = useRef<HTMLDivElement>(null);
  const [studyIndex, setStudyIndex] = useState(0);
  const attachStudies=useCallback((node:HTMLDivElement|null)=>{
    studies.current=node;
    if(node) setStudyIndex(0);
  },[]);
  const value = useShowroomQuery().get("category");
  const category = businessExamples.some((item) => item.slug === value) ? value : "all";
  useEffect(() => {
    const runway=journey.current,rail=studies.current;
    if (!runway || !rail) return;
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0, distance=0, start=0, pinned=false;
    const imageStage=rail.querySelector<HTMLElement>(".gallery-image-stage");
    const update=()=>{
      frame=0;
      if(!pinned)return;
      // A single reversible scroll coordinate: no independent easing or scroll lock.
      const top=parseFloat(runway.style.getPropertyValue("--study-pin-top"))||100;
      rail.scrollLeft=Math.min(distance,Math.max(0,top-runway.getBoundingClientRect().top));
    };
    const schedule=()=>{if(pinned && !frame) frame=requestAnimationFrame(update);};
    const measure=()=>{
      distance=Math.max(0,rail.scrollWidth-rail.clientWidth);
      const top=(document.querySelector("header")?.getBoundingClientRect().height??88)+12;
      const contentHeight=rail.parentElement?.offsetHeight??rail.offsetHeight;
      const imageHeight=imageStage?.offsetHeight??0;
      const fixedContent=contentHeight-imageHeight;
      const available=innerHeight-top-12-fixedContent;
      const smallScreen=innerWidth<=760;
      const preferredHeight=smallScreen
        ? Math.min(320,Math.max(220,innerHeight*.36))
        : Math.min(470,Math.max(300,innerHeight*.42));
      const minimumHeight=smallScreen?160:240;
      pinned=!motion.matches && available>=minimumHeight && distance>1;
      if(imageStage) {
        if(pinned) imageStage.style.setProperty("--study-image-fit",`${Math.min(preferredHeight,available)}px`);
        else imageStage.style.removeProperty("--study-image-fit");
      }
      runway.dataset.pinned=String(pinned);
      runway.style.setProperty("--study-pin-top",`${top}px`);
      runway.style.height=pinned ? `${(rail.parentElement?.offsetHeight??rail.offsetHeight)+distance}px` : "";
      start=runway.getBoundingClientRect().top+window.scrollY-top;

      schedule();
    };
    const focusStudy=(event:FocusEvent)=>{
      if(!pinned || !(event.target instanceof Element)) return;
      const card=event.target.closest<HTMLElement>(".business-card");
      if(card) {
        start=runway.getBoundingClientRect().top+scrollY-(parseFloat(runway.style.getPropertyValue("--study-pin-top"))||100);
        window.scrollTo({top:start+Math.min(distance,card.offsetLeft-rail.offsetLeft),behavior:"smooth"});
      }
    };
    const observer=new ResizeObserver(measure);
    observer.observe(rail);
    rail.querySelectorAll(".business-card").forEach(card=>observer.observe(card));
    addEventListener("scroll",schedule,{passive:true});
    addEventListener("resize",measure,{passive:true});
    rail.addEventListener("focusin",focusStudy);
    motion.addEventListener("change",measure);
    measure();
    void document.fonts.ready.then(()=>{if(runway.isConnected) measure();});
    return()=>{observer.disconnect();cancelAnimationFrame(frame);removeEventListener("scroll",schedule);removeEventListener("resize",measure);rail.removeEventListener("focusin",focusStudy);motion.removeEventListener("change",measure);runway.style.height="";};
  },[category]);
  const visibleExamples=businessExamples.filter(example=>category==="all" || category===example.slug);
  const currentStudy=Math.min(studyIndex,visibleExamples.length-1);
  const moveStudy=(index:number)=>{
    const rail=studies.current,runway=journey.current;
    const card=rail?.querySelectorAll<HTMLElement>(".business-card")[index];
    if(!rail || !runway || !card) return;
    const left=Math.min(rail.scrollWidth-rail.clientWidth,card.offsetLeft-rail.offsetLeft);
    const behavior=matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth";
    if(runway.dataset.pinned==="true") {
      const top=parseFloat(runway.style.getPropertyValue("--study-pin-top"))||110;
      window.scrollTo({top:runway.getBoundingClientRect().top+scrollY-top+left,behavior});
    } else rail.scrollTo({left,behavior});
  };
  return <section className="sales-section container business-showcase" id="business-websites" aria-labelledby="business-websites-title">
    <div className="sales-heading"><div><p className="eyebrow"><span className="section-dash" /> 03 / THE POSSIBILITY GALLERY</p><h2 id="business-websites-title" data-title-motion="shutter">Website<br /><em>directions.</em></h2></div></div>
    <div ref={journey} className="study-journey"><div className="study-pin">
    <div className="gallery-tabs"><div className="gallery-selector" role="group" aria-label="Website studio categories"><span className="gallery-category-label gallery-category-all">All studies <span>06</span></span>{businessExamples.map((example, index) => <span className="gallery-category-label" key={example.slug}>{categories[index]}</span>)}</div></div>
    <div className="showcase-toolbar"><span role="status" aria-live="polite">{category === "all" ? "06 studies" : "01 study"} / Scroll to explore</span></div>
    <div ref={attachStudies} className="business-grid" key={category} tabIndex={0} role="region" aria-label="Website demo images" onScroll={()=>{
      const rail=studies.current,first=rail?.querySelector<HTMLElement>(".business-card");
      if(rail && first) setStudyIndex(Math.round(rail.scrollLeft/(first.offsetWidth+parseFloat(getComputedStyle(rail).columnGap))));
    }}>{businessExamples.map((example, index) => category === "all" || category === example.slug ? <GalleryCard key={example.slug} example={example} index={index} source={source} category={category} /> : null)}</div><div className="study-navigation" aria-label="Browse website studies"><span>{String(currentStudy+1).padStart(2,"0")} / {String(visibleExamples.length).padStart(2,"0")}</span><button type="button" disabled={currentStudy===0} onClick={()=>moveStudy(currentStudy-1)}>Previous study</button><button type="button" disabled={currentStudy===visibleExamples.length-1} onClick={()=>moveStudy(currentStudy+1)}>Next study</button></div></div></div>
  </section>;
}
