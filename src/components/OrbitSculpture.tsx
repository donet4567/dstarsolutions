"use client";
import { useEffect, useRef } from "react";

export default function OrbitSculpture() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 769px)");
    let dispose: (() => void) | undefined;
    let cancelled = false, interacted = false, version = 0;
    const load = () => {
      const current = ++version;
      dispose?.(); dispose = undefined;
      if (interacted && !motion.matches && desktop.matches) {
        import("./orbit-renderer").then(({ mountOrbit }) => {
          if (!cancelled && current === version && !motion.matches && desktop.matches) dispose = mountOrbit(element);
        }).catch(() => { /* The local SVG remains visible without WebGL. */ });
      }
    };
    // Expensive shader compilation begins only when the visitor interacts.
    const activate = () => { if (!interacted) { interacted = true; load(); } };
    addEventListener("pointermove", activate, { passive: true, once: true });
    addEventListener("scroll", activate, { passive: true, once: true });
    motion.addEventListener("change", load); desktop.addEventListener("change", load);
    return () => { cancelled = true; version++; dispose?.(); removeEventListener("pointermove", activate); removeEventListener("scroll", activate); motion.removeEventListener("change", load); desktop.removeEventListener("change", load); };
  }, []);
  return <div ref={host} className="orbit-sculpture" aria-hidden="true"><svg className="orbit-fallback" viewBox="0 0 600 600" fill="none"><defs><linearGradient id="starGold" x1="100" y1="80" x2="470" y2="510" gradientUnits="userSpaceOnUse"><stop stopColor="#fff4bf"/><stop offset=".25" stopColor="#d9b660"/><stop offset=".5" stopColor="#806024"/><stop offset=".65" stopColor="#f5db8f"/><stop offset="1" stopColor="#a07932"/></linearGradient></defs><path d="m300 55 68 164 177 19-135 116 41 176-151-94-151 94 41-176L55 238l177-19Z" fill="url(#starGold)"/><path d="m300 55 0 258 245-75-177-19Z" fill="#ffe9a4" opacity=".45"/><path d="m300 313 151 217-41-176 135-116Z" fill="#77521f" opacity=".5"/><path d="m300 313-151 217 151-94 151 94Z" fill="#e6c477" opacity=".65"/></svg><div className="orbit-ring"/><span className="orbit-object-label">FIG. 01 / THE D STAR OBJECT<br />DESIGNED TO TAKE A DIFFERENT SHAPE</span></div>;
}
