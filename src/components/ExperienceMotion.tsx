"use client";

import { useEffect } from "react";

// Progressive enhancement: section content stays readable without JavaScript.
export default function ExperienceMotion() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      const value = motion.matches ? "reduced" : "full";
      if (document.documentElement.dataset.motion !== value) document.documentElement.dataset.motion = value;
    };
    updateMotion();
    motion.addEventListener("change", updateMotion);
    const process = document.querySelector<HTMLElement>(".process-section");
    const steps = Array.from(process?.querySelectorAll<HTMLElement>(".process-step") ?? []);
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-depth-card], [data-depth-section]"));
    const sections = Array.from(document.querySelectorAll<HTMLElement>("#services, #selected-work, #engineering, #process"));
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".desktop-nav a, .mobile-navigation a"));
    const pinned = window.matchMedia("(min-width: 761px) and (min-height: 650px)");
    const header = document.querySelector<HTMLElement>(".topbar");
    let frame = 0;
    const update = () => {
      frame = 0;
      // Read geometry together, before changing inherited CSS variables. Mixing
      // reads and writes forces the browser to lay out the page repeatedly.
      const total = document.documentElement.scrollHeight - innerHeight;
      const sectionBounds = sections.map((element) => ({ element, bounds: element.getBoundingClientRect() }));
      const processBounds = !motion.matches ? process?.getBoundingClientRect() : undefined;
      const depthBounds = !motion.matches ? elements.filter((element) => !element.checkVisibility || element.checkVisibility({ contentVisibilityAuto: true }))
        .map((element) => ({ element, bounds: element.getBoundingClientRect() })) : [];
      header?.style.setProperty("--page-progress", String(total > 0 ? scrollY / total : 0));
      const active = sectionBounds.find(({ bounds }) => bounds.top <= innerHeight * .4 && bounds.bottom > innerHeight * .4)?.element;
      links.forEach((link) => { if (active && link.hash === `#${active.id}`) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); });
      if (motion.matches) return;
      if (process && processBounds) {
        const bounds = processBounds;
        const progress = Math.max(0, Math.min(1, pinned.matches ? -bounds.top / Math.max(1, bounds.height - innerHeight) : (innerHeight * .7 - bounds.top) / bounds.height));
        process.style.setProperty("--process-progress", String(progress));
        steps.forEach((step, index) => {
          step.dataset.current = String(Math.min(3, Math.floor(progress * 4)) === index);
        });
      }
      depthBounds.forEach(({ element, bounds }) => {
        if (bounds.top > innerHeight + 200 || bounds.bottom < -200) return;
        const entry = Math.max(0, Math.min(1, (innerHeight - bounds.top) / (innerHeight * .65)));
        const travel = Math.max(-1, Math.min(1, (innerHeight * .5 - bounds.top - bounds.height * .5) / (innerHeight * .5 + bounds.height * .5)));
        element.style.setProperty("--depth-progress", String(entry));
        element.style.setProperty("--depth-travel", String(travel));
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const buttons = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic], .nav-cta, .button-dark"));
    const magnet = (event: PointerEvent) => {
      if (motion.matches || !fine.matches || !(event.currentTarget instanceof HTMLElement)) return;
      const element = event.currentTarget;
      const bounds = element.getBoundingClientRect();
      const x = Math.max(-5, Math.min(5, (event.clientX - bounds.left - bounds.width / 2) * .1));
      const y = Math.max(-4, Math.min(4, (event.clientY - bounds.top - bounds.height / 2) * .1));
      element.style.translate = `${x}px ${y}px`;
    };
    const reset = (event: PointerEvent) => {
      if (event.currentTarget instanceof HTMLElement) event.currentTarget.style.translate = "0px 0px";
    };
    buttons.forEach((button) => { button.addEventListener("pointermove", magnet); button.addEventListener("pointerleave", reset); });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", updateMotion);
      buttons.forEach((button) => { button.removeEventListener("pointermove", magnet); button.removeEventListener("pointerleave", reset); button.style.removeProperty("translate"); });
      cancelAnimationFrame(frame);
      delete document.documentElement.dataset.motion;
    };
  }, []);
  return null;
}
