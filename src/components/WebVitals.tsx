"use client";

import { useReportWebVitals } from "next/web-vitals";

// A stable callback avoids registering new observers on a component update.
const report: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  if (process.env.NODE_ENV !== "production") return;
  // Send only performance measurements: no cookies, URLs, or identifying data.
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
  });
  if (!navigator.sendBeacon?.("/api/vitals", body)) {
    void fetch("/api/vitals", {
      method: "POST", body, keepalive: true, credentials: "omit",
    }).catch(() => { /* Reporting must never interrupt the page. */ });
  }
};

export default function WebVitals() {
  useReportWebVitals(report);
  return null;
}
