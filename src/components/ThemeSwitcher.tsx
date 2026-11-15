"use client";

import { useSyncExternalStore } from "react";
import styles from "./Navigation.module.css";

const key = "dstar-appearance-v1";
const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
function subscribe(update: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== key && event.key !== null) return;
    document.documentElement.dataset.theme = event.newValue === "ivory" ? "ivory" : "midnight";
    update();
  };
  window.addEventListener("dstar-theme-change", update);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("dstar-theme-change", update);
    window.removeEventListener("storage", onStorage);
  };
}
const snapshot = () => document.documentElement.dataset.theme === "ivory" ? "ivory" : "midnight";

export default function ThemeSwitcher() {
  const selected = useSyncExternalStore(subscribe, snapshot, () => "midnight");
  const dark = selected === "midnight";
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  return <div className="theme-switcher"><button disabled={!ready} className={styles.themeControl} type="button" aria-label={`Switch to ${dark ? "light" : "dark"} theme`} onClick={() => {
    const next = dark ? "ivory" : "midnight";
    document.documentElement.dataset.theme = next;
    window.dispatchEvent(new Event("dstar-theme-change"));
    try { localStorage.setItem(key, next); } catch { /* Appearance still works when browser storage is unavailable. */ }
  }}><span>{dark ? "Light appearance" : "Dark appearance"}</span></button></div>;
}
