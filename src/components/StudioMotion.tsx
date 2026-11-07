"use client";
import { useEffect } from "react";

export default function StudioMotion() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce), (max-width: 768px)").matches) return;
    let cleanup: (() => void) | undefined;
    let stopped = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
        if (stopped) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference) and (min-width: 769px)", () => {
          gsap.utils.toArray<HTMLElement>(".orbit-manifesto h2, .sales-heading h2, #selected-work h2").forEach((element) => {
            gsap.fromTo(element, { y: 32 }, { y: 0, ease: "none", scrollTrigger: { trigger: element, start: "top 95%", end: "top 55%", scrub: .6 } });
          });
          gsap.utils.toArray<HTMLElement>(".price-card, .business-card, .benefit-grid article").forEach((element) => {
            gsap.from(element, { y: 28, duration: .8, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 94%", once: true } });
          });
        });
        cleanup = () => media.revert();
      });
    }, { rootMargin: "0px", threshold: .08 });
    const story = document.querySelector(".orbit-manifesto");
    if (story) observer.observe(story);
    return () => { stopped = true; observer.disconnect(); cleanup?.(); };
  }, []);
  return null;
}
