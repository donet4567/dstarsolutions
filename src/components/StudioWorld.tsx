"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { WorldController } from "./studio-world";

const preference = "(prefers-reduced-motion: reduce)";
function subscribe(callback: () => void) {
  const media = matchMedia(preference);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export default function StudioWorld() {
  const host = useRef<HTMLDivElement>(null);
  const world = useRef<WorldController | undefined>(undefined);
  const activateRef = useRef<(() => void) | undefined>(undefined);
  const takeFlightQueued = useRef(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const pausePreference = useRef(false);
  const reduced = useSyncExternalStore(subscribe, () => matchMedia(preference).matches, () => false);

  useEffect(() => {
    const element = host.current, stage = element?.closest<HTMLElement>(".flight-stage");
    if (!element || !stage || reduced) return;
    let disposed = false, loading = false, visible = false, activated = false;

    const load = async () => {
      if (disposed || loading || !visible) return;
      loading = true;
      try {
        const { mountStudioWorld } = await import("./studio-world");
        if (disposed) return;
        world.current = mountStudioWorld(element, stage);
        world.current?.setPaused(pausePreference.current);
        if (takeFlightQueued.current && !pausePreference.current) {
          takeFlightQueued.current = false;
          world.current?.takeFlight();
        }
      } catch { /* Keep the clean hero if WebGL is unavailable. */ }
    };

    const cleanupTriggers = () => {
      stage.removeEventListener("pointermove", activateOnFirstInteraction);
      document.removeEventListener("pointerdown", activateOnFirstInteraction);
      document.removeEventListener("touchstart", activateOnFirstInteraction);
      window.removeEventListener("wheel", activateOnFirstInteraction);
      window.removeEventListener("scroll", activateOnFirstScroll);
    };

    const activate = () => {
      if (activated) return;
      activated = true;
      cleanupTriggers();
      if (visible) void load();
    };

    const activateOnFirstInteraction = () => activate();
    const activateOnFirstScroll = () => {
      if (window.scrollY > 2) activate();
    };
    activateRef.current = activate;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && activated) void load();
    });
    stage.addEventListener("pointermove", activateOnFirstInteraction, { passive: true, once: true });
    document.addEventListener("pointerdown", activateOnFirstInteraction, { passive: true, once: true });
    document.addEventListener("touchstart", activateOnFirstInteraction, { passive: true, once: true });
    window.addEventListener("wheel", activateOnFirstInteraction, { passive: true, once: true });
    window.addEventListener("scroll", activateOnFirstScroll, { passive: true });

    const canvasReady = new MutationObserver(() => {
      if (element.dataset.ready === "true") { setReady(true); canvasReady.disconnect(); }
    });
    canvasReady.observe(element, { attributes: true, attributeFilter: ["data-ready"] });
    observer.observe(stage);

    return () => {
      disposed = true; observer.disconnect(); canvasReady.disconnect();
      cleanupTriggers();
      activateRef.current = undefined;
      world.current?.dispose(); world.current = undefined; setReady(false);
    };
  }, [reduced]);

  return <div className="studio-world">
    <div className="world-layer" aria-hidden="true"><div ref={host} className="world-viewport"><div className="world-fallback" /></div></div>
    <div className="world-controls">
      <p>Scroll, touch, or approach the butterfly to see it fly. <a className="wing-credit" href="/models/monarch/CREDITS.txt" aria-label="Butterfly photograph credit">Image credit</a></p>
      <div>{!reduced && <button type="button" disabled={paused} onClick={() => {
        if (world.current) world.current.takeFlight();
        else { takeFlightQueued.current = true; activateRef.current?.(); }
      }}>Take flight <span aria-hidden="true">↗</span></button>}
        {!reduced && <button type="button" aria-label="Pause scene motion" aria-pressed={paused} disabled={!ready} onClick={() => {
          const next = !paused; pausePreference.current = next; setPaused(next); world.current?.setPaused(next);
        }}>{paused ? "Resume motion" : "Pause motion"}</button>}</div>
    </div>
  </div>;
}
