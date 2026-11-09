"use client";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener("showroom-query", callback);
  return () => { window.removeEventListener("popstate", callback); window.removeEventListener("showroom-query", callback); };
}

// A stable server snapshot keeps prerendered demos independent of query strings.
export function useShowroomQuery() {
  const search = useSyncExternalStore(subscribe, () => location.search, () => "");
  return new URLSearchParams(search);
}

export function notifyShowroomQuery() { window.dispatchEvent(new Event("showroom-query")); }
