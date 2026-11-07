"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Arrow, Brand } from "./Brand";
import styles from "./Navigation.module.css";

const navigation = [
  ["#selected-work", "Work"],
  ["#business-websites", "Website examples"],
  ["#packages", "Packages"],
  ["#process", "Our process"],
] as const;

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
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", closeOnDesktop);
    return () => { document.removeEventListener("keydown", onKey); desktop.removeEventListener("change", closeOnDesktop); };
  }, [menuOpen]);

  return <header className={`topbar ${styles.header} ${scrolled ? "is-scrolled" : ""}`}>
    <div className={`topbar-inner ${styles.inner}`}>
      <Link className={`brand-link ${styles.brand}`} href="/" title="Home" onClick={() => setMenuOpen(false)}><Brand /></Link>
      <nav className={`desktop-nav ${styles.desktop}`} aria-label="Main navigation">{navigation.map(([href, label]) => <a key={href} href={href}>{label}</a>)}</nav>
      <div className={`topbar-end ${styles.end}`}><button className={styles.cta} type="button" data-open-brief="" onClick={() => setMenuOpen(false)}>Let’s talk <Arrow diagonal /></button><button ref={menuRef} className={`menu-trigger ${styles.menu} ${menuOpen ? "is-open" : ""}`} type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button></div>
    </div>
    <nav id="mobile-navigation" className={`mobile-navigation ${styles.mobile}`} aria-label="Mobile navigation" hidden={!menuOpen}>
      {navigation.map(([href, label], index) => <a key={href} href={href} onClick={() => setMenuOpen(false)}><span><small>0{index + 1}</small>{label}</span><Arrow diagonal /></a>)}
      <button type="button" data-open-brief="" onClick={() => setMenuOpen(false)}>Start a project <Arrow diagonal /></button>
    </nav>
  </header>;
}
