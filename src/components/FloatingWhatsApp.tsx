"use client";

import { useEffect, useRef } from "react";
import { defaultWhatsApp } from "./site";

export default function FloatingWhatsApp() {
  const link = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const element = link.current;
    if (!element) return;
    const controls = Array.from(document.querySelectorAll<HTMLElement>("main a, main button, main summary, footer a"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const floating = element.getBoundingClientRect();
      const obstructing = controls.some((control) => {
        if (control.checkVisibility && !control.checkVisibility({ contentVisibilityAuto: true })) return false;
        const box = control.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && box.left < floating.right + 8 && box.right > floating.left - 8 && box.top < floating.bottom + 8 && box.bottom > floating.top - 8;
      });
      // Step aside while a page control occupies this corner; never block a CTA.
      element.dataset.obstructing = String(obstructing);
      element.tabIndex = obstructing ? -1 : 0;
      element.setAttribute("aria-hidden", String(obstructing));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, []);
  return <a ref={link} className="floating-whatsapp" href={defaultWhatsApp} target="_blank" rel="noreferrer" aria-label="Chat with D Star on WhatsApp"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 11.5a9 9 0 0 1-13.3 7.9L3 21l1.6-4.7A9 9 0 1 1 21 11.5Z" /><path d="M8.2 7.5c-.9 1.3.2 3.7 2 5.5 1.8 1.8 4.2 2.9 5.5 2l.8-1.3-2.5-1.2-.9 1c-1.5-.5-2.6-1.6-3.1-3.1l1-.9L9.5 7Z" /></svg><span>Let’s talk</span></a>;
}
