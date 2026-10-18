"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import SelectedWork from "./SelectedWork";

const PHONE = "917558920076";
const DEFAULT_MESSAGE = "Hello D Star, I would like to discuss a website or web application project.";
const steps = [
  ["Discover", "Every great build starts with a conversation. We get to know your business, your people, and your ambition.", "Clarity before anything."],
  ["Design", "We turn the idea into an intuitive experience, with thoughtful layouts and a visual language that feels like you.", "Purpose in every pixel."],
  ["Develop", "We bring the design to life with responsive, reliable code and the integrations your business needs.", "Built to work beautifully."],
  ["Deliver", "We test the details, launch with care, and help your product find its feet in the real world.", "Ready for what’s next."],
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h16m-6-6 6 6-6 6"} /></svg>;
}
function Star({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="m16 0 3.8 12.2L32 16l-12.2 3.8L16 32l-3.8-12.2L0 16l12.2-3.8Z" /></svg>;
}
function ServiceIcon({ app = false }: { app?: boolean }) {
  return <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">{app ? <><rect x="3" y="3" width="9" height="9" rx="2" /><rect x="16" y="3" width="9" height="9" rx="2" /><rect x="3" y="16" width="9" height="9" rx="2" /><path d="M16 20.5h9m-4.5-4.5v9" /></> : <><rect x="2" y="4" width="24" height="20" rx="3" /><path d="M2 10h24M6 7h.1M10 7h.1m1 8-3 3 3 3m6-6 3 3-3 3" /></>}</svg>;
}
function Brand() {
  return <span className="brand"><span className="brand-symbol"><Image src="/dstar-mark-v2.png" alt="" width={56} height={47} unoptimized /></span><span>D Star IT Solutions<small>DIGITAL PRODUCT STUDIO</small></span></span>;
}

function HeroPreview() {
 return <div className="hero-art premium-art" aria-label="A soft sculptural bloom representing ideas coming to life">
 <div className="art-grid" aria-hidden="true" />
 <div className="orbit-label"><span className="status-dot" /> DESIGN MEETS ENGINEERING</div>
 <div className="bloom-sculpture" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <span className={`bloom-petal petal-${index}`} key={index} />)}<span className="bloom-center" /></div><div className="idea-chip"><span /> A little idea. Endless possibility.</div>
 <div className="art-spec"><span>THOUGHTFULLY SHAPED</span><span>MADE FOR YOU ↗</span></div>
 <div className="floating-note"><span className="note-icon"><ServiceIcon app /></span><div><strong>Made to feel right.</strong><span>In every little detail.</span></div><Arrow diagonal /></div>
 </div>;
}

export default function DStarExperience() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [projectType, setProjectType] = useState("Website");
  const [brief, setBrief] = useState("");
  const defaultWhatsApp = `https://wa.me/${PHONE}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add("will-reveal");
        observer.observe(element);
      }
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); menuRef.current?.focus(); }
    };
    const desktop = window.matchMedia("(min-width: 761px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", closeOnDesktop);
    return () => { document.removeEventListener("keydown", onKey); desktop.removeEventListener("change", closeOnDesktop); };
  }, [menuOpen]);

  const openBrief = (type?: string) => {
    lastTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (type) setProjectType(type);
    setMenuOpen(false);
    dialogRef.current?.showModal();
  };
  const closeBrief = () => dialogRef.current?.close();
  const sendBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = ["Hello D Star, I would like to discuss a project.", "", `Project type: ${projectType}`, brief.trim() ? `Requirement: ${brief.trim()}` : "Requirement: I will explain it on WhatsApp."].join("\n");
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="experience">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className={`topbar ${scrolled ? "is-scrolled" : ""}`}>
        <div className="topbar-inner">
          <a href="#top" aria-label="D Star IT Solutions home" onClick={() => setMenuOpen(false)}><Brand /></a>
          <nav className="desktop-nav" aria-label="Main navigation"><a href="#services">What we do</a><a href="#process">Our process</a><a href="#engineering">The studio</a></nav>
          <div className="topbar-end"><button className="nav-cta" type="button" onClick={() => openBrief()}>Let’s talk <Arrow diagonal /></button><button ref={menuRef} className={`menu-trigger ${menuOpen ? "is-open" : ""}`} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button></div>
        </div>
        <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation" hidden={!menuOpen}>
          <a href="#services" onClick={() => setMenuOpen(false)}>What we do <Arrow diagonal /></a><a href="#process" onClick={() => setMenuOpen(false)}>Our process <Arrow diagonal /></a><a href="#engineering" onClick={() => setMenuOpen(false)}>The studio <Arrow diagonal /></a><button type="button" onClick={() => openBrief()}>Start a project <Arrow diagonal /></button>
        </nav>
      </header>
      <main id="main">
        <section className="hero container" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span className="status-dot" /> INDEPENDENT DIGITAL STUDIO · KERALA</p>
            <h1 id="hero-title">Your next<br />big thing.<br /><em>Built different.</em></h1>
            <p className="hero-description">We turn ambitious ideas into distinctive websites and powerful web apps. Thoughtfully designed. Precisely engineered. Entirely yours.</p>
            <div className="hero-actions"><button className="button button-gold" type="button" onClick={() => openBrief()}>Start your project <Arrow diagonal /></button><a className="text-link" href="#services">Discover our expertise <Arrow /></a></div>
          </div>
          <HeroPreview />
          <div className="hero-bottom"><span><i className="location-dot" /> ROOTED IN KERALA. BUILT FOR EVERYWHERE.</span><a href="#services">SCROLL TO EXPLORE <span>↓</span></a></div>
        </section>
        <div className="discipline-strip" aria-label="Our disciplines"><div className="container"><span>Thoughtful design</span><Star /><span>Purposeful engineering</span><Star /><span>Seamless experiences</span><Star /><span>Lasting impact</span><Star /></div></div>
        <section className="services section-space container" id="services" aria-labelledby="services-title">
          <div className="section-heading" data-reveal><div><p className="eyebrow"><span className="section-dash" /> 01 / WHAT WE DO</p><h2 id="services-title">Digital experiences.<br /><span className="muted">Real-world impact.</span></h2></div><p className="section-intro">We keep our focus sharp, so every detail gets the attention it deserves. From your first impression to your everyday operations.</p></div>
          <div className="service-grid">
            <article className="service-card" data-reveal>
              <div className="service-card-top"><span className="service-icon"><ServiceIcon /></span><span className="card-number">01 — WEBSITES</span></div><h3>A presence that<br />feels like <em>you.</em></h3><p>Beautiful, fast, intuitive websites that tell your story and turn a first visit into a lasting connection.</p><div className="service-tags"><span>Business websites</span><span>Landing pages</span><span>Portfolios</span></div>
              <div className="website-preview" aria-hidden="true"><div className="preview-browser"><span><i /><i /><i /></span><small>your next chapter</small><span>↗</span></div><div className="preview-website"><div className="preview-site-nav"><strong>yourbrand<span>®</span></strong><span>About &nbsp; Work &nbsp; Contact</span></div><div className="preview-site-content"><small>EXCEPTIONAL BY DESIGN</small><strong>Make an<br /><em>impression.</em></strong><span className="preview-site-button">Discover something different <span>↗</span></span></div><Star className="preview-site-star" /></div></div>
              <button className="service-link" type="button" onClick={() => openBrief("Website")}><span>Let’s build your website</span><span className="circle-arrow"><Arrow diagonal /></span></button>
            </article>
            <article className="service-card app-card" data-reveal>
              <div className="service-card-top"><span className="service-icon"><ServiceIcon app /></span><span className="card-number">02 — WEB APPLICATIONS</span></div><h3>Less busywork.<br />More <em>possibility.</em></h3><p>Custom web applications that simplify the complex and work the way your business actually works.</p><div className="service-tags"><span>Dashboards</span><span>Booking systems</span><span>Custom platforms</span></div>
              <div className="app-preview" aria-hidden="true"><div className="app-sidebar"><span className="app-logo"><Star /> workspace</span><span className="app-sidebar-active">◫ &nbsp; Overview</span><span>▤ &nbsp; Projects</span><span>◷ &nbsp; Schedule</span><span>⚙ &nbsp; Settings</span><small>BUILT AROUND YOU</small></div><div className="app-window"><div className="app-window-top"><strong>Everything, in flow.</strong><span className="app-avatar">Y</span></div><small>A little clarity. A lot more possibility.</small><div className="app-metrics"><div><span>Plan</span><strong>Stay focused <i>↗</i></strong></div><div><span>Progress</span><strong>Keep moving <i>↗</i></strong></div></div><div className="app-tasks"><span>YOUR WORK, CONNECTED <i>•••</i></span><div><b className="task-check">✓</b><span>One clear overview</span><small>Complete</small></div><div><b className="task-check">✓</b><span>A smoother workflow</span><small>Complete</small></div><div><b className="task-current" /><span>Your next big thing</span><small className="task-progress">In progress</small></div></div></div></div>
              <button className="service-link" type="button" onClick={() => openBrief("Web application")}><span>Let’s simplify your workflow</span><span className="circle-arrow"><Arrow diagonal /></span></button>
            </article>
          </div><p className="services-note"><Star /> From the first sketch to the final launch. One team, every detail.</p>
        </section>
        <SelectedWork />
        <section className="studio-section" id="engineering" aria-labelledby="studio-title"><div className="container studio-grid">
          <div className="studio-copy" data-reveal><p className="eyebrow"><span className="section-dash" /> 02 / THE D STAR DIFFERENCE</p><h2 id="studio-title">Small by choice.<br />Exceptional<br /><em>by intention.</em></h2><p>You work directly with the people building your product. No layers, no lost-in-translation moments. Just a focused studio that cares about your business as much as the build.</p><a className="text-link" href="#process">Get to know our approach <Arrow /></a></div>
          <div className="principles" data-reveal><article><span className="principle-number">01</span><div><h3>Design with a purpose.</h3><p>Every layout, interaction, and detail works towards a clearer, more enjoyable experience.</p></div><Star /></article><article><span className="principle-number">02</span><div><h3>Beauty, backed by substance.</h3><p>Responsive interfaces, accessible interactions, and maintainable code. A strong foundation beneath the surface.</p></div><Star /></article><article><span className="principle-number">03</span><div><h3>Your ambition. Our attention.</h3><p>A considered process, honest conversations, and care that carries through to launch.</p></div><Star /></article><div className="stack-block"><p>MODERN TOOLS. MEANINGFUL OUTCOMES.</p><div>{["Next.js", "React", "TypeScript", "PostgreSQL"].map((item, i) => <span key={item}><b>{["N", "⚛", "TS", "P"][i]}</b>{item}</span>)}</div></div></div>
        </div></section>
        <section className="process-section section-space container" id="process" aria-labelledby="process-title"><div className="section-heading" data-reveal><div><p className="eyebrow"><span className="section-dash" /> 03 / HOW WE GET THERE</p><h2 id="process-title">A clear path from<br />idea to <em>impact.</em></h2></div><p className="section-intro">Good things don’t happen by accident.<br />Here’s how we make them happen, together.</p></div><div className="process-grid">{steps.map(([title, detail, caption], index) => <article className="process-step" key={title} data-reveal><div className="process-step-top"><span>0{index + 1}</span><Arrow /></div><h3>{title}</h3><p>{detail}</p><small>{caption}</small></article>)}</div></section>
        <section className="contact-section container" id="contact" aria-labelledby="contact-title"><div className="contact-panel" data-reveal><div className="contact-panel-top"><p className="eyebrow"><span className="status-dot" /> YOUR NEXT CHAPTER STARTS HERE</p><Star /></div><div className="contact-content"><h2 id="contact-title">Have a good idea?<br />Let’s make it <em>great.</em></h2><div><p>A rough idea. A fresh start. A problem worth solving.<br />Whatever it is, we’d love to hear it.</p><button className="button button-dark" type="button" onClick={() => openBrief()}>Start a conversation <Arrow diagonal /></button></div></div><div className="contact-panel-bottom"><span>GOOD WORK BEGINS WITH A HELLO.</span><a href={defaultWhatsApp} target="_blank" rel="noreferrer">Say hello on WhatsApp <Arrow diagonal /></a></div></div></section>
      </main>
      <footer className="footer container">
        <div className="footer-top"><p>Thoughtfully designed.<br />Beautifully engineered. From Kerala.</p><a className="footer-phone" href="tel:+917558920076">+91 75589 20076 <Arrow diagonal /></a></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} D Star. Made with intention.</span><span>BHARANANGANAM · PALA · KERALA</span><a href="#top">Back to top ↑</a></div>
        <div className="footer-brand"><a href="#top" aria-label="D Star IT Solutions home"><Brand /></a></div>
      </footer>
      <dialog className="brief-dialog" ref={dialogRef} aria-labelledby="brief-title" aria-describedby="brief-description" onClose={() => { if (lastTrigger.current?.getClientRects().length) lastTrigger.current.focus(); else menuRef.current?.focus(); }} onClick={(event) => { if (event.target === dialogRef.current) { const box = dialogRef.current.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeBrief(); } }}>
        <button className="brief-close" type="button" aria-label="Close project brief" onClick={closeBrief}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
        <form className="brief-form" onSubmit={sendBrief}><p className="eyebrow"><Star /> LET’S MAKE SOMETHING MATTER</p><h2 id="brief-title">It starts with<br /><em>your idea.</em></h2><p id="brief-description">Tell us a little about what you have in mind. We’ll take it from there, together.</p><fieldset><legend>What are we building?</legend><div className="type-options">{["Website", "Web application", "Not sure yet"].map((type) => <label key={type}><input type="radio" name="projectType" value={type} checked={projectType === type} onChange={() => setProjectType(type)} /><span>{type}</span></label>)}</div></fieldset><label className="brief-input"><span>A little about your idea</span><textarea value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="The big idea, a challenge, or something you’d love to build…" rows={4} maxLength={4000} /></label><button className="button button-gold brief-submit" type="submit">Continue on WhatsApp <Arrow diagonal /></button><p className="brief-footnote">Opens WhatsApp with your brief, ready for you to send.</p></form>
      </dialog>
    </div>
  );
}

