"use client";

import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { BloomInput } from "./BloomCanvas";
import { Arrow } from "./Brand";
import styles from "./CinematicHero.module.css";
import BloomCanvas from "./BloomScene";
import { whatsappUrl } from "./site";

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function BloomFallback() {
  return <div className={styles.fallback} aria-hidden="true">
    {Array.from({ length: 8 }, (_, index) => <i key={index} style={{ "--petal": index } as CSSProperties} />)}
    <b />
  </div>;
}

export default function CinematicHero() {
  const section = useRef<HTMLElement>(null);
  const sculpture = useRef<HTMLDivElement>(null);
  const input = useRef<BloomInput>({ progress: 0, pointerX: 0, pointerY: 0, rotation: 0 });
  const drag = useRef<{ x: number; y: number; rotating: boolean } | null>(null);
  const [available, setAvailable] = useState(false);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 760px)");
    const updateMotion = () => setReduced(motion.matches);
    updateMotion();
    motion.addEventListener("change", updateMotion);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setAvailable(true);
    }, { rootMargin: "120px" });
    observer.observe(element);
    const viewObserver = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && !document.hidden));
    if (sculpture.current) viewObserver.observe(sculpture.current);
    const visibility = () => {
      const bounds = sculpture.current?.getBoundingClientRect();
      setVisible(!document.hidden && !!bounds && bounds.bottom > 0 && bounds.top < innerHeight);
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      const p = motion.matches ? 0 : Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - innerHeight)));
      if (input.current.progress !== p) {
        input.current.progress = p;
        input.current.invalidate?.();
      }
      // Mobile keeps its readable, unpinned layout while the existing bloom
      // responds to scrolling through the hero, just as it does on desktop.
      element.style.setProperty("--journey", String(mobile.matches ? 0 : p));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      viewObserver.disconnect();
      motion.removeEventListener("change", updateMotion);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
      document.removeEventListener("visibilitychange", visibility);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <section ref={section} className={styles.journey} id="top" aria-labelledby="hero-title" data-ready={ready || undefined}>
    <div className={styles.stage}>
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.edition}><span><i /> INDEPENDENT DIGITAL STUDIO · KERALA</span><span>SMALL BUSINESS. BEAUTIFUL POSSIBILITIES.</span></div>
      <div className={styles.opening}>
        <h1 id="hero-title">Beautiful Websites.<br /><em>Built for Your Business.</em></h1>
        <p className={styles.description} data-testid="hero-description">Professional, mobile-friendly websites for shops, startups and growing businesses. Designed to impress your customers and make it easier for them to contact you.</p>
        <p className={styles.price}>Business Websites Starting at <strong>₹8,000</strong></p>
        <p className={styles.priceNote}>One-time development fee. Domain and hosting charges additional.</p>
        <div className={styles.actions}><a href="#packages" className="button sales-primary">Explore Website Packages <Arrow diagonal /></a><a href={whatsappUrl("Hello D Star, I would like a free quote for a business website starting at ₹8,000. Please help me choose a package.")} target="_blank" rel="noreferrer" className={styles.quote}>Get a Free Quote on WhatsApp <Arrow diagonal /></a></div>
      </div>
      <div ref={sculpture} className={styles.sculpture} data-testid="hero-sculpture" role="img" aria-label="An interactive pastel bloom with curved, pearl-finished petals"
        onPointerDown={(event) => {
          if (event.button !== 0 || reduced || paused) return;
          drag.current = { x: event.clientX, y: event.clientY, rotating: event.pointerType === "mouse" };
          if (drag.current.rotating) event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (reduced || paused) return;
          if (drag.current && !drag.current.rotating) {
            const dx = event.clientX - drag.current.x;
            const dy = event.clientY - drag.current.y;
            if (Math.abs(dy) > 6 && Math.abs(dy) >= Math.abs(dx)) { drag.current = null; return; }
            if (Math.abs(dx) < 6) return;
            drag.current.rotating = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          if (event.pointerType !== "mouse" && !drag.current) return;
          const box = event.currentTarget.getBoundingClientRect();
          input.current.pointerX = (event.clientX - box.left) / box.width * 2 - 1;
          input.current.pointerY = (event.clientY - box.top) / box.height * 2 - 1;
          if (drag.current !== null) {
            input.current.rotation += (event.clientX - drag.current.x) * 0.008;
            drag.current.x = event.clientX;
          }
          input.current.invalidate?.();
        }}
        onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
        onPointerLeave={() => { input.current.pointerX = 0; input.current.pointerY = 0; input.current.invalidate?.(); }}>
        <div className={styles.halo} aria-hidden="true" />
        <BloomFallback />
        {available && <SceneBoundary><BloomCanvas input={input} animate={visible && !paused && !reduced} onReady={onReady} /></SceneBoundary>}
      </div>
      <div className={styles.controls} role="group" aria-label="Sculpture controls">
        <span>THE D STAR BLOOM</span>
        <button type="button" aria-label="Rotate bloom left" disabled={!ready || paused || reduced} onClick={() => { input.current.rotation -= Math.PI / 4; input.current.invalidate?.(); }}>←</button>
        <button type="button" aria-label="Rotate bloom right" disabled={!ready || paused || reduced} onClick={() => { input.current.rotation += Math.PI / 4; input.current.invalidate?.(); }}>→</button>
        <button type="button" className={styles.pause} aria-label={paused ? "Resume animation" : "Pause animation"} aria-pressed={paused} disabled={reduced || !ready} onClick={() => setPaused((value) => !value)}>{paused ? "▶" : "Ⅱ"}</button>
      </div>
      <div className={styles.bottomLine}><span>ROOTED IN PALA, KERALA. BUILT FOR YOUR BUSINESS.</span><a href="#business-websites">SEE WEBSITE EXAMPLES <span>↗</span></a></div>
    </div>
  </section>;
}
