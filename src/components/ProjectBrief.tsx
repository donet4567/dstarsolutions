"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Arrow, Star } from "./Brand";
import { whatsappUrl } from "./site";
import { businessExamples, packages } from "./website-content";

// Server-rendered sections pass through as children; only the dialog hydrates here.
export default function ProjectBrief({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const [projectType, setProjectType] = useState("Website");
  const [brief, setBrief] = useState("");
  const [packageInterest, setPackageInterest] = useState("Help me choose");
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
    const fields = new FormData(event.currentTarget);
    const text = ["Hello D Star, I would like a quote for my business.", "", `Customer name: ${String(fields.get("customerName")).trim()}`, `Business name: ${String(fields.get("businessName")).trim()}`, `Business category: ${fields.get("businessCategory")}`, `Project type: ${projectType}`, `Package of interest: ${packageInterest}`, `Requirement: ${brief.trim()}`].join("\n");
    window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
  };

  return <div className="experience" onClick={(event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>("button[data-open-brief]");
    if (!button) return;
    lastTrigger.current = button.closest("#mobile-navigation")
      ? document.querySelector<HTMLButtonElement>(".menu-trigger")
      : button;
    setProjectType(button.dataset.openBrief || "Website");
    setPackageInterest(button.dataset.package || (button.dataset.openBrief === "Web application" ? "Custom web application" : "Help me choose"));
    dialogRef.current?.showModal();
  }}>
    {children}
      <dialog className="brief-dialog" ref={dialogRef} aria-labelledby="brief-title" aria-describedby="brief-description" onClose={() => { if (lastTrigger.current?.getClientRects().length) lastTrigger.current.focus(); else document.querySelector<HTMLButtonElement>(".menu-trigger")?.focus(); }} onClick={(event) => { if (event.target === dialogRef.current) { const box = dialogRef.current.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeBrief(); } }}>
        <button className="brief-close" type="button" aria-label="Close project brief" onClick={closeBrief}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
        <form className="brief-form" onSubmit={sendBrief}><p className="eyebrow"><Star /> LET’S BUILD YOUR BUSINESS WEBSITE</p><h2 id="brief-title">Tell us about<br /><em>your business.</em></h2><p id="brief-description">A few details help us prepare a useful quote. You can review your enquiry in WhatsApp before sending.</p><fieldset><legend>What are we building?</legend><div className="type-options">{["Website", "Web application", "Not sure yet"].map((type) => <label key={type}><input type="radio" name="projectType" value={type} checked={projectType === type} onChange={() => { setProjectType(type); setPackageInterest(type === "Web application" ? "Custom web application" : "Help me choose"); }} /><span>{type}</span></label>)}</div></fieldset><div className="brief-fields"><label className="brief-input"><span>Your name</span><input name="customerName" autoComplete="name" required maxLength={100} pattern=".*\S.*" placeholder="Your name" /></label><label className="brief-input"><span>Business name</span><input name="businessName" autoComplete="organization" required maxLength={150} pattern=".*\S.*" placeholder="Your business or planned business" /></label><label className="brief-input"><span>Business category</span><select name="businessCategory" required defaultValue=""><option value="" disabled>Select a category</option>{businessExamples.map((example) => <option key={example.slug}>{example.category}</option>)}<option>Other business</option></select></label><label className="brief-input"><span>Package of interest</span><select name="packageInterest" value={packageInterest} onChange={(event) => { setPackageInterest(event.target.value); if (event.target.value === "Custom web application") setProjectType("Web application"); else if (event.target.value !== "Help me choose") setProjectType("Website"); }}><option>Help me choose</option>{packages.map((plan) => <option key={plan.id}>{plan.name} — {plan.price}</option>)}<option>Custom web application</option></select></label></div><label className="brief-input"><span>Short project requirement</span><textarea name="requirement" value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="What does your business do, and what would you like your website to include?" rows={3} required minLength={5} maxLength={4000} /></label><button className="button sales-primary brief-submit" type="submit">Continue on WhatsApp <Arrow diagonal /></button><p className="brief-footnote">Opens WhatsApp with your details, ready for you to review and send. This form does not store your enquiry.</p></form>
      </dialog>
  </div>;
}
