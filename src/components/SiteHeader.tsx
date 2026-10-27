"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow, Brand } from "./Brand";

export default function SiteHeader() {
  const menuRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); menuRef.current?.focus(); }
    };
    const desktop = window.matchMedia("(min-width: 761px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", closeOnDesktop);
    return () => { document.removeEventListener("keydown", onKey); desktop.removeEventListener("change", closeOnDesktop); };
  }, [menuOpen]);

  return (
      <header className={`topbar ${scrolled ? "is-scrolled" : ""}`}>
        <div className="topbar-inner">
          <a className="brand-link" href="#top" aria-label="D Star IT Solutions home" onClick={() => setMenuOpen(false)}><Brand /></a>
          <nav className="desktop-nav" aria-label="Main navigation"><a href="#services">What we do</a><a href="#selected-work">Selected work</a><a href="#engineering">The studio</a><a href="#process">Our process</a></nav>
          <div className="topbar-end"><button className="nav-cta" type="button" data-open-brief="" onClick={() => setMenuOpen(false)}>Let’s talk <Arrow diagonal /></button><button ref={menuRef} className={`menu-trigger ${menuOpen ? "is-open" : ""}`} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button></div>
        </div>
        <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation" hidden={!menuOpen}>
          <a href="#services" onClick={() => setMenuOpen(false)}>What we do <Arrow diagonal /></a><a href="#selected-work" onClick={() => setMenuOpen(false)}>Selected work <Arrow diagonal /></a><a href="#engineering" onClick={() => setMenuOpen(false)}>The studio <Arrow diagonal /></a><a href="#process" onClick={() => setMenuOpen(false)}>Our process <Arrow diagonal /></a><button type="button" data-open-brief="" onClick={() => setMenuOpen(false)}>Start a project <Arrow diagonal /></button>
        </nav>
      </header>
  );
}
