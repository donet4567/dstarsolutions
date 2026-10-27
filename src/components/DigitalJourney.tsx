"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { DimensionInput } from "./DimensionCanvas";
import styles from "./DigitalJourney.module.css";

const DimensionCanvas = dynamic(() => import("./DimensionCanvas"), { ssr: false });
const chapters = [
  { name: "Imagine", title: "It starts with a possibility.", detail: "A fresh perspective. A challenge worth solving. A little idea with somewhere extraordinary to go." },
  { name: "Shape", title: "Give the idea a point of view.", detail: "We turn that spark into a distinctive digital presence. Every proportion, interaction, and detail works together." },
  { name: "Connect", title: "Make every part work together.", detail: "From a first impression to an everyday workflow. A connected experience, thoughtfully built around your business." },
];

class WorldBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function DigitalJourney() {
  const root = useRef<HTMLElement>(null);
  const input = useRef<DimensionInput>({ progress: 0 });
  const current = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [available, setAvailable] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const short = matchMedia("(max-height: 600px)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      const p = motion.matches || short.matches ? .5 : Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - innerHeight)));
      input.current.progress = p;
      element.style.setProperty("--story-progress", String(p));
      const next = p < .32 ? 0 : p < .7 ? 1 : 2;
      if (next !== current.current) { current.current = next; setChapter(next); }
    };
    const preferences = () => { setEnhanced(!motion.matches && !short.matches); update(); };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting && !document.hidden);
      if (entry.isIntersecting) setAvailable(true);
    }, { rootMargin: "150px" });
    const visibility = () => {
      const bounds = element.getBoundingClientRect();
      setVisible(!document.hidden && bounds.top < innerHeight && bounds.bottom > 0);
    };
    observer.observe(element);
    preferences();
    motion.addEventListener("change", preferences);
    short.addEventListener("change", preferences);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      motion.removeEventListener("change", preferences); short.removeEventListener("change", preferences);
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  const explore = (index: number) => {
    const element = root.current;
    if (!element) return;
    if (!enhanced) {
      input.current.progress = index / 2;
      current.current = index; setChapter(index);
      return;
    }
    const offset = element.getBoundingClientRect().top + scrollY;
    const p = [.02, .5, .94][index];
    window.scrollTo({ top: offset + (element.offsetHeight - innerHeight) * p, behavior: "smooth" });
  };

  return <section ref={root} className={styles.world} id="digital-journey" aria-labelledby="dimension-title"
    data-enhanced={enhanced} data-ready={ready || undefined} data-chapter={chapter}>
    <div className={styles.stage}>
      <div className={styles.topline}><span>01 / AN IDEA TAKING SHAPE</span><span>SCROLL TO CHANGE YOUR PERSPECTIVE ↘</span></div>
      <div className={styles.copy}><h2 id="dimension-title">A little idea.<br />A whole new<br /> <em>world.</em></h2>
        <div className={styles.chapter} aria-live="polite" aria-atomic="true"><span>0{chapter + 1} / {chapters[chapter].name.toUpperCase()}</span><h3>{chapters[chapter].title}</h3><p>{chapters[chapter].detail}</p></div>
      </div>
      <div className={styles.scene} role="img" aria-label="A three-dimensional idea transforms into an ordered website and connected mobile application">
        <div className={styles.fallback} aria-hidden="true"><div className={styles.fallbackScreen}><span>yourbrand®</span><strong>Make an<br /><em>impression.</em></strong><i /></div><div className={styles.plinth} /></div>
        {available && <WorldBoundary><DimensionCanvas input={input} animate={visible && enhanced} chapter={chapter} onReady={onReady} /></WorldBoundary>}
      </div>
      <nav className={styles.navigation} aria-label="Digital journey chapters">{chapters.map((item, index) => <button type="button" key={item.name} aria-current={chapter === index ? "step" : undefined} onClick={() => explore(index)}><span>0{index + 1}</span>{item.name}<i /></button>)}</nav>
      <span className={styles.annotation}>A CONCEPT IN MOTION. A PRODUCT WITH PURPOSE.</span>
      <div className={styles.progress} aria-hidden="true"><span /></div>
    </div>
  </section>;
}
