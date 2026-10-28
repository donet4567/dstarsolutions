"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Arrow, Star } from "./Brand";
import { PHONE } from "./site";

// Server-rendered sections pass through as children; only the dialog hydrates here.
export default function ProjectBrief({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const [projectType, setProjectType] = useState("Website");
  const [brief, setBrief] = useState("");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    // These reveal targets are all below the hero. Observing them avoids
    // forcing layout inside sections the browser has deferred offscreen.
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        element.classList.add("will-reveal");
        observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  const closeBrief = () => dialogRef.current?.close();
  const sendBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = ["Hello D Star, I would like to discuss a project.", "", `Project type: ${projectType}`, brief.trim() ? `Requirement: ${brief.trim()}` : "Requirement: I will explain it on WhatsApp."].join("\n");
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return <div className="experience" onClick={(event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>("button[data-open-brief]");
    if (!button) return;
    lastTrigger.current = button;
    if (button.dataset.openBrief) setProjectType(button.dataset.openBrief);
    dialogRef.current?.showModal();
  }}>
    {children}
      <dialog className="brief-dialog" ref={dialogRef} aria-labelledby="brief-title" aria-describedby="brief-description" onClose={() => { if (lastTrigger.current?.getClientRects().length) lastTrigger.current.focus(); else document.querySelector<HTMLButtonElement>(".menu-trigger")?.focus(); }} onClick={(event) => { if (event.target === dialogRef.current) { const box = dialogRef.current.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeBrief(); } }}>
        <button className="brief-close" type="button" aria-label="Close project brief" onClick={closeBrief}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
        <form className="brief-form" onSubmit={sendBrief}><p className="eyebrow"><Star /> LET’S MAKE SOMETHING MATTER</p><h2 id="brief-title">It starts with<br /><em>your idea.</em></h2><p id="brief-description">Tell us a little about what you have in mind. We’ll take it from there, together.</p><fieldset><legend>What are we building?</legend><div className="type-options">{["Website", "Web application", "Not sure yet"].map((type) => <label key={type}><input type="radio" name="projectType" value={type} checked={projectType === type} onChange={() => setProjectType(type)} /><span>{type}</span></label>)}</div></fieldset><label className="brief-input"><span>A little about your idea</span><textarea value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="The big idea, a challenge, or something you’d love to build…" rows={4} maxLength={4000} /></label><button className="button button-gold brief-submit" type="submit">Continue on WhatsApp <Arrow diagonal /></button><p className="brief-footnote">Opens WhatsApp with your brief, ready for you to send.</p></form>
      </dialog>
  </div>;
}
