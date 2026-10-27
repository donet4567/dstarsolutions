"use client";

import { useEffect } from "react";

// Progressive enhancement: section content stays readable without JavaScript.
export default function ExperienceMotion() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      document.documentElement.dataset.motion = motion.matches ? "reduced" : "full";
    };
    updateMotion();
    motion.addEventListener("change", updateMotion);
    const process = document.querySelector<HTMLElement>(".process-section");
    const manifesto = document.querySelector<HTMLElement>(".studio-manifesto");
    let frame = 0;
    const update = () => {
      frame = 0;
      const total = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty("--page-progress", String(total > 0 ? scrollY / total : 0));
      if (motion.matches) return;
      if (process) {
        const bounds = process.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (innerHeight * 0.7 - bounds.top) / bounds.height));
        process.style.setProperty("--process-progress", String(progress));
        process.querySelectorAll<HTMLElement>(".process-step").forEach((step, index) => {
          step.dataset.current = String(progress >= index / 4);
        });
      }
      if (manifesto) {
        const bounds = manifesto.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (innerHeight * 0.85 - bounds.top) / Math.max(1, bounds.height * 0.7)));
        manifesto.style.setProperty("--manifesto-progress", String(progress));
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", updateMotion);
      cancelAnimationFrame(frame);
      delete document.documentElement.dataset.motion;
    };
  }, []);
  return null;
}
