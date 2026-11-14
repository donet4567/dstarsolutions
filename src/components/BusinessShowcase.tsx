"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { notifyShowroomQuery, useShowroomQuery } from "./useShowroomQuery";
import { Arrow } from "./Brand";
import { businessExamples, type BusinessExample } from "./website-content";
import { whatsappUrl } from "./site";

export function ConceptImage({ example, eager = false }: { example: BusinessExample; eager?: boolean }) {
  return <picture><source type="image/avif" srcSet={`/gallery/${example.tone}-640.avif 640w, /gallery/${example.tone}-1280.avif 1280w`} sizes="(max-width:600px) 90vw, (max-width:1000px) 90vw, 55vw" /><img src={`/gallery/${example.tone}-1280.webp`} srcSet={`/gallery/${example.tone}-640.webp 640w, /gallery/${example.tone}-1280.webp 1280w`} sizes="(max-width:600px) 90vw, (max-width:1000px) 90vw, 55vw" width={1536} height={1024} loading={eager ? "eager" : "lazy"} decoding="async" alt={`${example.brand}: an original ${example.category.toLowerCase()} website design concept`} /></picture>;
}

const categories = ["Café", "Salon", "Architecture", "Boutique", "Hospitality", "Professional"];

function GalleryCard({ example, index, source, category }: { example: BusinessExample; index: number; source: string; category: string | null }) {
  const [detail, setDetail] = useState(false);
  const demoUrl = `/website-demos/${example.slug}?from=${source}${category && category !== "all" ? `&category=${category}` : ""}`;
  return <article className="business-card">
    <div className="gallery-image-stage" data-detail={detail}><Link href={demoUrl} aria-label={`View ${example.brand} demo`}><ConceptImage example={example} /></Link><span className="gallery-image-index">D STAR STUDIES / 0{index + 1}</span></div>
    <div className="image-view-controls" role="group" aria-label={`${example.brand} image composition`}><button type="button" aria-pressed={!detail} onClick={() => setDetail(false)}>Full composition</button><button type="button" aria-pressed={detail} onClick={() => setDetail(true)}>Detail crop</button></div>
    <div className="business-card-copy"><p className="demo-label">FICTIONAL BRAND · ORIGINAL DESIGN STUDY</p><h3>{example.brand}<span className="gallery-category">{example.category}</span></h3><p>{example.description}</p><div className="business-card-actions"><Link href={demoUrl} className="text-link">View Demo <Arrow diagonal /></Link><a href={whatsappUrl(`Hello D Star, I’m interested in a ${example.category.toLowerCase()} website similar to your ${example.brand} demo concept. Please help me with a quote.`)} target="_blank" rel="noreferrer" className="text-link">Enquire for Similar Website <Arrow diagonal /></a></div></div>
  </article>;
}

export default function BusinessShowcase({ source = "home" }: { source?: "home" | "guide" }) {
  const journey = useRef<HTMLDivElement>(null);
  const studies = useRef<HTMLDivElement>(null);
  const selector = useRef<HTMLDivElement>(null);
  const value = useShowroomQuery().get("category");
  const category = businessExamples.some((item) => item.slug === value) ? value : "all";
  useEffect(() => {
    const rail=selector.current;
    const selected=rail?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!rail || !selected) return;
    rail.scrollTo({
      left:selected.offsetLeft-rail.offsetLeft-(rail.clientWidth-selected.clientWidth)/2,
      behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",
    });
  },[category]);
  useEffect(() => {
    const runway=journey.current,rail=studies.current;
    if (!runway || !rail) return;
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0;
    const update=()=>{
      frame=0;
      if(motion.matches) return;
      const distance=rail.scrollWidth-rail.clientWidth;
      rail.scrollLeft=Math.min(distance,Math.max(0,110-runway.getBoundingClientRect().top));
    };
    const schedule=()=>{if(!frame) frame=requestAnimationFrame(update);};
    const measure=()=>{
      const distance=rail.scrollWidth-rail.clientWidth;
      runway.dataset.pinned=String(!motion.matches && distance>1);
      runway.style.height=!motion.matches && distance>1 ? (rail.offsetHeight+distance)+"px" : "";
      schedule();
    };
    const observer=new ResizeObserver(measure);
    observer.observe(rail);
    rail.querySelectorAll("img").forEach(img=>observer.observe(img));
    addEventListener("scroll",schedule,{passive:true});
    motion.addEventListener("change",measure);
    measure();
    return()=>{observer.disconnect();cancelAnimationFrame(frame);removeEventListener("scroll",schedule);motion.removeEventListener("change",measure);};
  },[category]);
  const scrollTabs = (direction:number) => {
    const rail=selector.current;
    rail?.scrollBy({left:direction*rail.clientWidth*.65,
      behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  };
  const scrollStudies = (direction:number) => {
    const rail=studies.current;
    const card=rail?.querySelector<HTMLElement>(".business-card");
    if (!rail || !card) return;
    if(journey.current?.dataset.pinned==="true") {
      const top=scrollY+journey.current.getBoundingClientRect().top-110;
      window.scrollTo({top:top+Math.min(rail.scrollWidth-rail.clientWidth,Math.max(0,rail.scrollLeft+direction*(card.offsetWidth+28))),behavior:"smooth"});
      return;
    }
    rail.scrollBy({left:direction*(card.offsetWidth+28),
      behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  };
  const select = (value: string) => {
    const url = new URL(location.href);
    if (value === "all") url.searchParams.delete("category"); else url.searchParams.set("category", value);
    history.pushState(history.state, "", url.pathname + url.search + "#business-websites");
    notifyShowroomQuery();
  };
  return <section className="sales-section container business-showcase" id="business-websites" aria-labelledby="business-websites-title">
    <div className="sales-heading"><div><p className="eyebrow"><span className="section-dash" /> 03 / THE POSSIBILITY GALLERY</p><h2 id="business-websites-title" data-title-motion="shutter">Website<br /><em>directions.</em></h2></div><p>Six fictional businesses. Six distinct directions.<br />Open a demo. Find a starting point.</p></div>
    <div className="gallery-tabs"><button className="gallery-scroll" type="button" aria-label="Previous website categories" onClick={()=>scrollTabs(-1)}>←</button><div ref={selector} className="gallery-selector" role="group" aria-label="Filter website examples"><button type="button" aria-pressed={category === "all"} onClick={() => select("all")}>All studies <span>06</span></button>{businessExamples.map((example, index) => <button type="button" key={example.slug} aria-pressed={category === example.slug} onClick={() => select(example.slug)}>{categories[index]}</button>)}</div><button className="gallery-scroll" type="button" aria-label="Next website categories" onClick={()=>scrollTabs(1)}>→</button></div>
    <div className="showcase-toolbar"><p>Original imagery. Interactive website concepts.<br />Image composition controls sit below each study.</p><span role="status" aria-live="polite">{category === "all" ? "06 studies" : "01 study"} / Swipe to explore →</span></div>
    <div className="study-navigation" role="group" aria-label="Scroll website demos"><button type="button" className="gallery-scroll" aria-label="Previous website demo" onClick={()=>scrollStudies(-1)}>←</button><button type="button" className="gallery-scroll" aria-label="Next website demo" onClick={()=>scrollStudies(1)}>→</button></div>
    <div ref={journey} className="study-journey"><div className="study-pin"><div ref={studies} className="business-grid" key={category} tabIndex={0} role="region" aria-label="Website demo images">{businessExamples.map((example, index) => category === "all" || category === example.slug ? <GalleryCard key={example.slug} example={example} index={index} source={source} category={category} /> : null)}</div></div></div>
    <p className="showcase-note">These fictional brands and generated design studies illustrate visual possibilities, not client projects or finished website screenshots. Final design and features are agreed with your package.</p>
  </section>;
}
