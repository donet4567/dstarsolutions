"use client";

import { useSyncExternalStore } from "react";

const themes = [
  ["ivory", "Ivory + Lavender"],
  ["sand", "Warm Sand + Plum"],
  ["sage", "Soft Sage + Bronze/Gold"],
  ["mist", "Mist Blue + Slate"],
  ["midnight", "Midnight Navy"],
] as const;

const key = "dstar-theme";
function subscribe(update: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== key && event.key !== null) return;
    document.documentElement.dataset.theme = themes.some(([id]) => id === event.newValue) ? event.newValue! : "ivory";
    update();
  };
  window.addEventListener("dstar-theme-change", update);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("dstar-theme-change", update);
    window.removeEventListener("storage", onStorage);
  };
}
const snapshot = () => document.documentElement.dataset.theme || "ivory";

export default function ThemeSwitcher() {
  const selected = useSyncExternalStore(subscribe, snapshot, () => "ivory");
  return <div className="theme-switcher">
    <div className="theme-options" role="group" aria-label="Website color theme">
      {themes.map(([id, label]) => <button
        className="theme-option" type="button" key={id} data-palette={id}
        aria-label={label} title={label} aria-pressed={selected === id}
        onClick={() => {
          document.documentElement.dataset.theme = id;
          window.dispatchEvent(new Event("dstar-theme-change"));
          try { localStorage.setItem(key, id); } catch { /* The theme still works when storage is unavailable. */ }
        }}
      ><span aria-hidden="true" /></button>)}
    </div>
  </div>;
}
