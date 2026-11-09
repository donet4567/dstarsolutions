"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { notifyShowroomQuery, useShowroomQuery } from "./useShowroomQuery";
import { Arrow } from "./Brand";
import { ConceptImage } from "./BusinessShowcase";
import ThemeSwitcher from "./ThemeSwitcher";
import StudioMotion from "./StudioMotion";
import { businessExamples, type BusinessExample } from "./website-content";
import { whatsappUrl } from "./site";

const directions = {
  cafe: { eyebrow: "THE ART OF TAKING YOUR TIME", title: "At the table.", intro: "A little seasonal, a little familiar. A café story told through texture, considered type and space to linger.", details: ["A seasonal menu presentation, with room for ingredients and the story behind each plate.", "An inviting coffee section, made for describing your favourite roasts and slow afternoons.", "A bakery edit for daily specials, craft and the things made with care."], note: "Sample menu direction · no food orders or table reservations" },
  salon: { eyebrow: "A MOMENT, BEAUTIFULLY YOURS", title: "The ritual of care.", intro: "Soft curves, unhurried transitions and a service story that gives every detail a little room to breathe.", details: ["A consultation-led presentation for cuts, finishes and personal style.", "A considered way to explain colour techniques and aftercare.", "A quiet editorial space for signature treatments and your approach to wellbeing."], note: "Illustrative service presentation · no appointments available" },
  construction: { eyebrow: "FORM. MATERIAL. PURPOSE.", title: "Built on intention.", intro: "An architectural study in clear grids, generous proportions and spaces shaped around the people who use them.", details: ["A residential project narrative: the brief, the material palette and the thinking behind the space.", "A structured showcase for commercial environments and functional design decisions.", "A before-and-after story told through existing spaces and thoughtful interventions."], note: "Project story directions · no completed buildings or client claims" },
  boutique: { eyebrow: "AN EDIT OF EVERYDAY BEAUTY", title: "The considered edit.", intro: "An editorial collection experience. Tactile colour, expressive typography and details worth a closer look.", details: ["A capsule collection direction for pieces chosen to become everyday favourites.", "An occasion edit with space for styling notes and product photography supplied by your shop.", "A close-up story for materials, finishing and the details behind your collection."], note: "Fictional collection directions · no inventory, prices or checkout" },
  travel: { eyebrow: "LESS HURRY. MORE HERE.", title: "Make room for quiet.", intro: "A hospitality story that unfolds gently: the spaces, the surroundings and the feeling of being somewhere new.", details: ["An accommodation story with room for your own photographs and honest descriptions of each space.", "An atmospheric guide to the landscape, nearby places and experiences around a stay.", "A helpful visit-planning section for directions and direct enquiries to your real business."], note: "Hospitality design concept · no real stay or availability calendar" },
  professional: { eyebrow: "A CLEARER WAY FORWARD", title: "Clarity, by design.", intro: "Purposeful structure and confident typography. A professional presence that makes complex expertise easy to understand.", details: ["A clear introduction to your expertise, the businesses you help and the questions you can address.", "A practical presentation of your approach, from the first conversation to a defined plan.", "A direct contact journey that makes the next step clear, without unnecessary forms or friction."], note: "Illustrative practice · no advisory service is offered by Northline" },
} as const;

function DeviceIcon({ mobile }: { mobile?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">{mobile ? <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></> : <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" /></>}</svg>;
}

function ConceptSections({ example }: { example: BusinessExample }) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const direction = directions[example.tone];
  const interactive = ["cafe", "boutique", "travel"].includes(example.tone);
  return <section className="concept-chapter" id="demo-services">
    <div className="chapter-heading"><p className="concept-overline">02 / {example.tone === "construction" ? "PROJECT NARRATIVES" : "EXPLORE THE CONCEPT"}</p><h2>{direction.title}</h2><p>{direction.intro}</p></div>
    {interactive ? <div className="chapter-interaction">
      <div className="chapter-tabs" role="tablist" aria-label={`${example.brand} ${example.tone === "cafe" ? "menu" : example.tone === "boutique" ? "collection" : "stay"} directions`}>{example.items.map((item, index) => <button type="button" role="tab" id={`${id}-tab-${index}`} aria-selected={selected === index} aria-controls={`${id}-panel-${index}`} tabIndex={selected === index ? 0 : -1} key={item} onClick={() => setSelected(index)} onKeyDown={(event) => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % example.items.length;
        else if (event.key === "ArrowLeft") next = (index + example.items.length - 1) % example.items.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = example.items.length - 1;
        else return;
        event.preventDefault(); setSelected(next); document.getElementById(`${id}-tab-${next}`)?.focus();
      }}><span>0{index + 1}</span>{item}</button>)}</div>
      {example.items.map((item, index) => <div className="chapter-panel" role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={selected !== index} tabIndex={0} key={item}><span className="chapter-mark" aria-hidden="true">{example.mark}</span><div><p className="concept-overline">AN ILLUSTRATIVE DIRECTION / 0{index + 1}</p><h3>{item}</h3><p>{direction.details[index]}</p><a href="#demo-contact">Imagine this for your business <Arrow diagonal /></a></div></div>)}
    </div> : example.tone === "salon" ? <div className="ritual-list">{example.items.map((item, index) => <details key={item} open={index === 0}><summary><span>0{index + 1}</span>{item}<span aria-hidden="true">+</span></summary><p>{direction.details[index]}</p></details>)}</div> : <div className={`narrative-grid narrative-${example.tone}`}>{example.items.map((item, index) => <article key={item}><span className="narrative-number">0{index + 1}</span><h3>{item}</h3><p>{direction.details[index]}</p><span className="narrative-rule" aria-hidden="true" /></article>)}</div>}
    <p className="concept-truth">{direction.note}</p>
  </section>;
}

export default function DemoShowroom({ example }: { example: BusinessExample }) {
  const params = useShowroomQuery();
  const mobile = params.get("view") === "mobile";
  const source = params.get("from") === "home" ? "home" : "guide";
  const value = params.get("category");
  const category = businessExamples.some((item) => item.slug === value) ? value : "";
  const index = businessExamples.findIndex((item) => item.slug === example.slug);
  const previous = businessExamples[(index + 5) % 6];
  const next = businessExamples[(index + 1) % 6];
  const context = `from=${source}${category ? `&category=${category}` : ""}${mobile ? "&view=mobile" : ""}`;
  const changeView = (value: boolean) => {
    const url = new URL(location.href); if (value) url.searchParams.set("view", "mobile"); else url.searchParams.delete("view");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
    notifyShowroomQuery();
  };
  const enquiry = whatsappUrl(`Hello D Star, I would like a ${example.category.toLowerCase()} website inspired by your ${example.brand} demo concept. Please help me with a quote.`);
  return <main className="showroom-page">
    <StudioMotion motionKey={example.slug} />
    <a href="#demo-content" className="skip-link">Skip to demo</a>
    <header className="showroom-toolbar"><Link href={`${source === "home" ? "/" : "/small-business-websites"}${category ? `?category=${category}` : ""}#business-websites`}>← Back to Examples</Link><p><span>0{index + 1} / 06</span><strong>{example.brand}</strong></p><div className="showroom-tools"><div className="device-toggle" role="group" aria-label="Demo preview viewport"><button type="button" aria-pressed={!mobile} onClick={() => changeView(false)}><DeviceIcon />Desktop</button><button type="button" aria-pressed={mobile} onClick={() => changeView(true)}><DeviceIcon mobile />Mobile</button></div><ThemeSwitcher /></div></header>
    <div className="showroom-caption container"><p>DEMO CONCEPT · FICTIONAL BUSINESS</p><span>Interactive direction by D Star IT Solutions · {mobile ? "Mobile layout" : "Desktop layout · fits your screen"}</span></div>
    <div className="showroom-stage" data-viewport={mobile ? "mobile" : "desktop"}>
      <div className={`concept-site concept-site-${example.tone}`} id="demo-content">
        <nav className="concept-site-nav" aria-label={`${example.brand} concept navigation`}><a href="#demo-content" className="concept-wordmark">{example.brand}<span aria-hidden="true">{example.mark}</span></a><a href="#demo-services">Explore</a><a href="#demo-contact">About this design ↗</a></nav>
        <section className="concept-site-hero"><div className="concept-hero-copy"><p className="concept-overline">{directions[example.tone].eyebrow}</p><h1>{example.line}</h1><p>{example.detail}</p><a className="concept-action" href="#demo-services">{example.action} <Arrow diagonal /></a><span className="concept-hero-footnote">A FICTIONAL {example.tone === "travel" ? "HOSPITALITY" : example.tone.toUpperCase()} DESIGN STUDY / D STAR</span></div><figure><ConceptImage example={example} eager /><figcaption>01 / Original {example.brand} design study</figcaption></figure></section>
        <ConceptSections key={example.slug} example={example} />
        <section className="concept-enquiry" id="demo-contact"><p className="concept-overline">YOUR BUSINESS. YOUR OWN STORY.</p><h2>Picture your<br /><em>business here.</em></h2><div><p>{example.brand} is a fictional design demonstration by D Star, not a client business. Like this direction? Packages start at ₹8,000; domain and hosting are additional.</p><a className="concept-action" href={enquiry} target="_blank" rel="noreferrer">Enquire for a Similar Website <Arrow diagonal /></a></div><small>Design concept only. No real menu, product inventory, appointment service or booking system is provided.</small></section>
        <footer className="concept-site-footer"><span>{example.brand} / FICTIONAL CONCEPT</span><Link href="/">Designed & developed by D Star ↗</Link></footer>
      </div>
    </div>
    <nav className="showroom-pagination container" aria-label="Browse demo concepts"><Link href={`/website-demos/${previous.slug}?${context}`}><span>← Previous Demo</span><strong>{previous.brand}</strong></Link><p>Find your direction.<br /><span>Every study is a starting point.</span></p><Link href={`/website-demos/${next.slug}?${context}`}><span>Next Demo →</span><strong>{next.brand}</strong></Link></nav>
  </main>;
}
