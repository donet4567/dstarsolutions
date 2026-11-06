"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow, Brand } from "./Brand";
import ThemeSwitcher from "./ThemeSwitcher";
import Link from "next/link";

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
          <Link className="brand-link" href="/" title="Home" onClick={() => setMenuOpen(false)}><Brand /></Link>
          <nav className="desktop-nav" aria-label="Main navigation"><a href="#packages">Packages</a><a href="#business-websites">Examples</a><a href="#selected-work">Selected work</a><a href="#process">Process</a></nav>
          <div className="topbar-end"><ThemeSwitcher /><button className="nav-cta" type="button" data-open-brief="" onClick={() => setMenuOpen(false)}>Let’s talk <Arrow diagonal /></button><button ref={menuRef} className={`menu-trigger ${menuOpen ? "is-open" : ""}`} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button></div>
        </div>
        <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation" hidden={!menuOpen}>
          <a href="#packages" onClick={() => setMenuOpen(false)}>Website packages <Arrow diagonal /></a><a href="#business-websites" onClick={() => setMenuOpen(false)}>Website examples <Arrow diagonal /></a><a href="#selected-work" onClick={() => setMenuOpen(false)}>Selected work <Arrow diagonal /></a><a href="#process" onClick={() => setMenuOpen(false)}>Our process <Arrow diagonal /></a><button type="button" data-open-brief="" onClick={() => setMenuOpen(false)}>Start a project <Arrow diagonal /></button>
        </nav>
      </header>
  );
}
