"use client";
import { useEffect } from "react";

export default function StudioMotion({ motionKey = "studio" }: { motionKey?: string }) {
  useEffect(() => {
    let disposed = false;
    let stopAnimations: (() => void) | undefined;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const start = () => {
      stopAnimations?.();
      if (preference.matches) return;
      const targets = document.querySelectorAll<HTMLElement>(".sales-heading, .orbit-manifesto h2, #selected-work h2, .benefit-grid, .business-grid, .simple-process-grid, .pricing-grid, [data-reveal], .contact-content, .concept-site-hero, .chapter-heading, .narrative-grid, .concept-enquiry");
      let observer: IntersectionObserver | undefined;
      let active = true;
      const contexts: { revert: () => void }[] = [];
      stopAnimations = () => { active = false; observer?.disconnect(); contexts.forEach((context) => context.revert()); };
      observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) return;
        visible.forEach((entry) => observer?.unobserve(entry.target));
        import("gsap").then(({ gsap }) => {
          if (disposed || !active || preference.matches) return;
          visible.forEach(({ target }) => {
            const element = target as HTMLElement;
            const compact = matchMedia("(max-width: 768px)").matches;
            const context = gsap.context(() => {
              if (element.matches(".business-grid, .pricing-grid, .benefit-grid, .simple-process-grid, .narrative-grid")) {
                gsap.fromTo(element.children, { y: compact ? 12 : 26, opacity: .45 }, { y: 0, opacity: 1, duration: compact ? .45 : .8, stagger: compact ? .05 : .12, ease: "power3.out", clearProps: "transform,opacity" });
                if (element.matches(".simple-process-grid")) gsap.to(element.children, { "--step-progress": 1, duration: .65, stagger: .18, ease: "power2.inOut" });
              } else if (element.matches(".concept-site-hero")) {
                gsap.fromTo(element.children, { y: 18, opacity: .4 }, { y: 0, opacity: 1, duration: .9, stagger: .14, ease: "power3.out", clearProps: "transform,opacity" });
              } else {
                gsap.fromTo(element, { y: compact ? 10 : 24, opacity: .5 }, { y: 0, opacity: 1, duration: element.matches("[data-reveal]") ? 1.1 : .8, ease: "power3.out", clearProps: "transform,opacity" });
              }
            }, element);
            contexts.push(context);
          });
        }).catch(() => { /* All content stays visible if motion cannot load. */ });
      }, { threshold: .06 });
      targets.forEach((target) => observer!.observe(target));
    };
    start(); preference.addEventListener("change", start);
    return () => { disposed = true; stopAnimations?.(); preference.removeEventListener("change", start); };
  }, [motionKey]);
  return null;
}
