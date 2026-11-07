"use client";
import { useEffect } from "react";

// Intersection events drive navigation; scroll work never scans section geometry.
export default function ExperienceMotion() {
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => { document.documentElement.dataset.motion = motion.matches ? "reduced" : "full"; };
    updateMotion(); motion.addEventListener("change", updateMotion);
    const links = [...document.querySelectorAll<HTMLAnchorElement>(".desktop-nav a, .mobile-navigation a")];
    const observer = new IntersectionObserver((entries) => {
      const active = entries.find((entry) => entry.isIntersecting);
      if (!active) return;
      links.forEach((link) => { if (link.hash === `#${active.target.id}`) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); });
    }, { rootMargin: "-15% 0px -65% 0px" });
    document.querySelectorAll("#packages, #business-websites, #selected-work, #process").forEach((section) => observer.observe(section));
    return () => { motion.removeEventListener("change", updateMotion); observer.disconnect(); };
  }, []);
  return null;
}
