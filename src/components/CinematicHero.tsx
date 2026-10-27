"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { BloomInput } from "./BloomCanvas";
import { Arrow } from "./Brand";
import styles from "./CinematicHero.module.css";

const BloomCanvas = dynamic(() => import("./BloomCanvas"), { ssr: false });

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
  const input = useRef<BloomInput>({ progress: 0, pointerX: 0, pointerY: 0, rotation: 0 });
  const drag = useRef<number | null>(null);
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
      setVisible(entry.isIntersecting && !document.hidden);
      if (entry.isIntersecting) setAvailable(true);
    }, { rootMargin: "120px" });
    observer.observe(element);
    const visibility = () => setVisible(!document.hidden && element.getBoundingClientRect().bottom > 0 && element.getBoundingClientRect().top < innerHeight);
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      const p = motion.matches || mobile.matches ? 0 : Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - innerHeight)));
      input.current.progress = p;
      element.style.setProperty("--journey", String(p));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", updateMotion);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", visibility);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <section ref={section} className={styles.journey} id="top" aria-labelledby="hero-title" data-ready={ready || undefined}>
    <div className={styles.stage}>
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.edition}><span><i /> INDEPENDENT DIGITAL STUDIO · KERALA</span><span>DESIGN WITH FEELING. BUILD WITH PURPOSE.</span></div>
      <div className={styles.opening}>
        <h1 id="hero-title">Your next big thing.<br /><em>Built different.</em></h1>
        <span className={styles.titleNote}>A LITTLE IDEA. ENDLESS POSSIBILITY.</span>
      </div>
      <div className={styles.sculpture} data-testid="hero-sculpture" role="img" aria-label="An interactive pastel bloom with curved, pearl-finished petals"
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0 || reduced || paused) return;
          drag.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (reduced || paused) return;
          const box = event.currentTarget.getBoundingClientRect();
          input.current.pointerX = (event.clientX - box.left) / box.width * 2 - 1;
          input.current.pointerY = (event.clientY - box.top) / box.height * 2 - 1;
          if (drag.current !== null) {
            input.current.rotation += (event.clientX - drag.current) * 0.008;
            drag.current = event.clientX;
          }
        }}
        onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
        onPointerLeave={() => { input.current.pointerX = 0; input.current.pointerY = 0; }}>
        <div className={styles.halo} aria-hidden="true" />
        <BloomFallback />
        {available && <SceneBoundary><BloomCanvas input={input} animate={visible && !paused && !reduced} onReady={onReady} /></SceneBoundary>}
      </div>
      <div className={styles.orbitLabel} aria-hidden="true"><span>01 / THE SPARK</span><span>THOUGHTFULLY SHAPED ↗</span></div>
      <div className={styles.chapter} aria-hidden="true"><span>02 / THE POSSIBILITIES</span><p>From a spark.<br />To something <em>real.</em></p></div>
      <div className={styles.bottomCopy}><p data-testid="hero-description">We turn ambitious ideas into distinctive websites and powerful web apps. Thoughtfully designed. Entirely yours.</p><button className={styles.cta} data-magnetic="" type="button" data-open-brief="">Start your project <Arrow diagonal /></button></div>
      <div className={styles.controls} role="group" aria-label="Sculpture controls">
        <span>EXPLORE THE FORM</span>
        <button type="button" aria-label="Rotate bloom left" disabled={!ready || paused || reduced} onClick={() => { input.current.rotation -= Math.PI / 4; }}>←</button>
        <button type="button" aria-label="Rotate bloom right" disabled={!ready || paused || reduced} onClick={() => { input.current.rotation += Math.PI / 4; }}>→</button>
        <button type="button" className={styles.pause} aria-label={paused ? "Resume animation" : "Pause animation"} aria-pressed={paused} disabled={reduced || !ready} onClick={() => setPaused((value) => !value)}>{paused ? "▶" : "Ⅱ"}</button>
      </div>
      <div className={styles.bottomLine}><span>ROOTED IN KERALA. BUILT FOR EVERYWHERE.</span><a href="#services">SCROLL TO DISCOVER <span>↓</span></a></div>
      <div className={styles.progress} aria-hidden="true"><span /></div>
    </div>
  </section>;
}
