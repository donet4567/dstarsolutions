"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";

const PHONE = "917558920076";
const DEFAULT_MESSAGE =
  "Hello D Star, I would like to discuss a website or web application project.";

const services = [
  {
    no: "01",
    title: "Website Development",
    statement: "Turn attention into trust.",
    detail:
      "Distinctive business websites with sharp art direction, responsive engineering, strong information hierarchy and performance designed in from the start.",
    meta: "Art direction / UX / Front-end / SEO foundation / Launch",
  },
  {
    no: "02",
    title: "Web App Development",
    statement: "Turn workflow into software.",
    detail:
      "Custom operational tools, booking systems, portals, dashboards and internal platforms shaped around how your business actually works—not around a generic template.",
    meta: "Product flow / Database / Access control / APIs / Reports / Deployment",
  },
];

const process = [
  ["01", "Decode", "We reduce the requirement to the real business problem, the users and the outcome that matters."],
  ["02", "Design", "We shape the information, interactions and visual language before complexity gets expensive."],
  ["03", "Develop", "We engineer the product with a modern typed stack, responsive behaviour and maintainable structure."],
  ["04", "Deploy", "We test the real workflow, ship to production and tighten the details after the product meets real use."],
];

const stack = ["Next.js 16", "React 19", "TypeScript", "PostgreSQL", "API integrations", "Cloud deployment"];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={diagonal ? "M7 17 17 7M9 7h8v8" : "M5 12h14M14 7l5 5-5 5"} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

export default function DStarExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [projectType, setProjectType] = useState("Website");
  const [brief, setBrief] = useState("");

  const defaultWhatsApp = `https://wa.me/${PHONE}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(pointer: coarse)").matches) return;

    let frame = 0;
    const move = (event: PointerEvent) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth) * 100;
        const y = (event.clientY / window.innerHeight) * 100;
        root.style.setProperty("--pointer-x", `${x}%`);
        root.style.setProperty("--pointer-y", `${y}%`);
        root.style.setProperty("--pointer-nx", `${(event.clientX / window.innerWidth - 0.5) * 1.0}`);
        root.style.setProperty("--pointer-ny", `${(event.clientY / window.innerHeight - 0.5) * 1.0}`);
      });
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", menuOpen);
    return () => document.body.classList.remove("menu-is-open");
  }, [menuOpen]);

  const openBrief = () => {
    setMenuOpen(false);
    dialogRef.current?.showModal();
  };

  const closeBrief = () => dialogRef.current?.close();

  const sendBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = [
      "Hello D Star, I would like to discuss a project.",
      "",
      `Project type: ${projectType}`,
      brief.trim() ? `Requirement: ${brief.trim()}` : "Requirement: I will explain it on WhatsApp.",
    ].join("\n");
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="experience" ref={rootRef}>
      <div className="scroll-meter" aria-hidden="true" />

      <header className={`topbar ${scrolled ? "is-scrolled" : ""}`}>
        <a className="mark" href="#top" aria-label="D Star home" onClick={() => setMenuOpen(false)}>
          <Image src="/dstar-mark-v2.png" alt="D Star" width={420} height={353} priority />
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#services">Services</a>
          <a href="#process">Process</a>
          <a href="#engineering">Engineering</a>
        </nav>

        <div className="topbar-end">
          <button className="project-trigger" type="button" onClick={openBrief}>
            Start a project <Arrow diagonal />
          </button>
          <button
            className={`menu-trigger ${menuOpen ? "is-open" : ""}`}
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`mobile-navigation ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mobile-nav-inner">
          <p>D STAR / DIGITAL PRODUCT STUDIO</p>
          <nav>
            <a href="#services" onClick={() => setMenuOpen(false)}><span>01</span>Services<Arrow diagonal /></a>
            <a href="#process" onClick={() => setMenuOpen(false)}><span>02</span>Process<Arrow diagonal /></a>
            <a href="#engineering" onClick={() => setMenuOpen(false)}><span>03</span>Engineering<Arrow diagonal /></a>
          </nav>
          <button type="button" onClick={openBrief}>Start a project <Arrow diagonal /></button>
        </div>
      </div>

      <section className="hero" id="top">
        <div className="hero-field" aria-hidden="true">
          <span className="field-line field-line-a" />
          <span className="field-line field-line-b" />
          <span className="field-line field-line-c" />
          <span className="field-dot field-dot-a" />
          <span className="field-dot field-dot-b" />
          <span className="field-dot field-dot-c" />
          <div className="hero-mark-wrap">
            <Image className="hero-mark" src="/dstar-mark-v2.png" alt="" width={420} height={353} priority />
          </div>
        </div>

        <div className="hero-shell">
          <div className="hero-meta" data-reveal>
            <p>D STAR / DIGITAL PRODUCT STUDIO</p>
            <p className="live-note"><i /> PALA · KERALA · INDIA</p>
          </div>

          <div className="hero-copy">
            <h1 data-reveal>
              <span>WEBSITES</span>
              <em>/</em>
              <span className="outline-word">WEB APPS.</span>
            </h1>
            <div className="hero-sub" data-reveal>
              <p className="hero-thesis">Unexpected by design.<br />Uncomplicated in use.</p>
              <p>
                We turn business ideas and manual workflows into distinctive websites and practical web applications—designed, engineered and launched as one product.
              </p>
            </div>
          </div>

          <div className="hero-foot" data-reveal>
            <button type="button" className="primary-action magnetic" onClick={openBrief}>
              <span>Build with D Star</span><Arrow diagonal />
            </button>
            <a className="quiet-link" href="#services">See what we build <Arrow /></a>
            <p>Focused on two disciplines.<br />Nothing else.</p>
          </div>
        </div>
      </section>

      <section className="manifesto" aria-label="Studio statement">
        <div className="manifesto-shell">
          <p className="section-code" data-reveal>01 / FOCUS</p>
          <h2 data-reveal>
            NOT A LIST OF<br />
            <span>SERVICES.</span><br />
            A FOCUSED STUDIO.
          </h2>
          <p className="manifesto-note" data-reveal>
            We deliberately do less. That lets us care more about the idea, the interface, the engineering and the way the finished product feels in real hands.
          </p>
        </div>
      </section>

      <section className="services" id="services">
        <div className="section-heading" data-reveal>
          <p>02 / WHAT WE BUILD</p>
          <h2>Two disciplines.<br />One standard.</h2>
        </div>

        <div className="service-lines">
          {services.map((service) => (
            <article className="service-line" key={service.no} data-reveal>
              <span className="service-no">{service.no}</span>
              <div className="service-title">
                <h3>{service.title}</h3>
                <p>{service.meta}</p>
              </div>
              <div className="service-body">
                <h4>{service.statement}</h4>
                <p>{service.detail}</p>
              </div>
              <button type="button" onClick={openBrief} aria-label={`Discuss ${service.title}`}><Arrow diagonal /></button>
            </article>
          ))}
        </div>
      </section>

      <section className="interlude" aria-label="Design statement">
        <div className="interlude-line" aria-hidden="true" />
        <div className="interlude-shell">
          <p data-reveal>A GOOD DIGITAL PRODUCT</p>
          <h2 data-reveal>
            SHOULD NOT HAVE TO<br />
            <span>SAY IT IS MODERN.</span>
          </h2>
          <p className="interlude-end" data-reveal>YOU SHOULD FEEL IT<br />BEFORE YOU READ IT.</p>
        </div>
      </section>

      <section className="process" id="process">
        <div className="process-shell">
          <aside className="process-side" data-reveal>
            <p>03 / PROCESS</p>
            <p>FOUR MOVES.<br />NO THEATRE.</p>
          </aside>
          <div className="process-list">
            {process.map(([no, title, detail]) => (
              <article className="process-row" key={no} data-reveal>
                <span>{no}</span>
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="engineering" id="engineering">
        <div className="engineering-shell">
          <div className="engineering-head" data-reveal>
            <p>04 / ENGINEERING</p>
            <h2>Current web.<br /><span>Without the hype.</span></h2>
          </div>
          <div className="engineering-copy" data-reveal>
            <p>
              Modern technology matters only when it makes the product faster, more reliable, easier to maintain or capable of doing something genuinely useful. That is where we use it.
            </p>
          </div>
        </div>
        <div className="stack-track" aria-label="Technology stack">
          <div className="stack-runner">
            {[...stack, ...stack].map((item, index) => (
              <span key={`${item}-${index}`}>{item}<i>✦</i></span>
            ))}
          </div>
        </div>
        <div className="native-features" data-reveal>
          <span>Responsive by default</span>
          <span>Typed application code</span>
          <span>Production databases</span>
          <span>Accessible interaction</span>
          <span>Reduced-motion fallback</span>
          <span>Performance-first delivery</span>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-shell">
          <div className="contact-top" data-reveal>
            <p>05 / NEXT PROJECT</p>
            <p>BHARANGANAM · PALA · KERALA</p>
          </div>
          <h2 data-reveal>
            HAVE AN IDEA<br />
            <span>WORTH BUILDING?</span>
          </h2>
          <div className="contact-bottom" data-reveal>
            <p>You do not need a technical specification. A rough idea, a broken workflow or a business problem is enough to begin.</p>
            <div>
              <button type="button" onClick={openBrief}>Start a project <Arrow diagonal /></button>
              <a href={defaultWhatsApp} target="_blank" rel="noreferrer">WhatsApp directly <Arrow diagonal /></a>
              <a href="tel:+917558920076">+91 75589 20076 <Arrow /></a>
            </div>
          </div>
          <div className="contact-mark" aria-hidden="true">
            <Image src="/dstar-mark-v2.png" alt="" width={420} height={353} />
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} D STAR</p>
        <p>WEBSITE + WEB APP DEVELOPMENT</p>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>

      <dialog className="brief-dialog" ref={dialogRef} onClick={(event) => {
        if (event.target === dialogRef.current) closeBrief();
      }}>
        <form method="dialog" className="brief-close-form">
          <button type="submit" aria-label="Close project brief"><CloseIcon /></button>
        </form>
        <form className="brief-form" onSubmit={sendBrief}>
          <div className="brief-brand">
            <Image src="/dstar-mark-v2.png" alt="D Star" width={420} height={353} />
            <p>PROJECT BRIEF / 01</p>
          </div>
          <div className="brief-title">
            <p>Start with the rough version.</p>
            <h2>What are we<br />building?</h2>
          </div>
          <fieldset>
            <legend>Project type</legend>
            <div className="type-options">
              {["Website", "Web application", "Not sure yet"].map((type) => (
                <label key={type}>
                  <input type="radio" name="projectType" value={type} checked={projectType === type} onChange={() => setProjectType(type)} />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="brief-input">
            <span>Tell us the idea, requirement or current problem</span>
            <textarea value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="A few lines are enough…" rows={5} />
          </label>
          <button className="brief-submit" type="submit">
            Continue on WhatsApp <Arrow diagonal />
          </button>
        </form>
      </dialog>
    </main>
  );
}
