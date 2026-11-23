"use client";
import { useEffect } from "react";

// Intersection events drive navigation; scroll work never scans section geometry.
export default function ExperienceMotion() {
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => { document.documentElement.dataset.motion = motion.matches ? "reduced" : "full"; };
    updateMotion(); motion.addEventListener("change", updateMotion);

    const heroTitle = document.getElementById("hero-title");
    heroTitle?.classList.add("title-in-view");

    let disposed = false, cleanupObservers: (() => void) | undefined;
    const startObservers = () => {
      if (disposed || cleanupObservers) return;
      const links = [...document.querySelectorAll<HTMLAnchorElement>('.desktop-nav a[href^="#"], .mobile-navigation a[href^="#"]')];
      const observer = new IntersectionObserver((entries) => {
        const active = entries.find((entry) => entry.isIntersecting);
        if (!active) return;
        links.forEach((link) => { if (link.hash === `#${active.target.id}`) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); });
      }, { rootMargin: "-15% 0px -65% 0px" });
      document.querySelectorAll("#packages, #business-websites, #selected-work, #process").forEach((section) => observer.observe(section));
      const titles = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("title-in-view");
          titles.unobserve(entry.target);
        }
      }, { threshold: .15 });
      document.querySelectorAll("[data-title-motion]").forEach((title) => {
        if (title !== heroTitle) titles.observe(title);
      });
      cleanupObservers = () => { titles.disconnect(); observer.disconnect(); };
    };

    const isHomepage = Boolean(document.querySelector(".orbit-story"));
    if (isHomepage) window.addEventListener("scroll", startObservers, { passive: true, once: true });
    else startObservers();

    return () => {
      disposed = true;
      window.removeEventListener("scroll", startObservers);
      motion.removeEventListener("change", updateMotion);
      cleanupObservers?.();
    };
  }, []);
  return null;
}
