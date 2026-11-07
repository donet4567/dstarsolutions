import Image from "next/image";
// Supplied logo, pre-encoded at the sizes used by the site.

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h16m-6-6 6 6-6 6"} /></svg>;
}
export function Star({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="m16 0 3.8 12.2L32 16l-12.2 3.8L16 32l-3.8-12.2L0 16l12.2-3.8Z" /></svg>;
}
export function ServiceIcon({ app = false }: { app?: boolean }) {
  return <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">{app ? <><rect x="3" y="3" width="9" height="9" rx="2" /><rect x="16" y="3" width="9" height="9" rx="2" /><rect x="3" y="16" width="9" height="9" rx="2" /><path d="M16 20.5h9m-4.5-4.5v9" /></> : <><rect x="2" y="4" width="24" height="20" rx="3" /><path d="M2 10h24M6 7h.1M10 7h.1m1 8-3 3 3 3m6-6 3 3-3 3" /></>}</svg>;
}
export function Brand({ footer = false }: { footer?: boolean }) {
  if (footer) return <span className="brand brand--footer"><Image unoptimized className="brand-lockup" src="/brand/dstar-lockup.webp" alt="D Star IT Solutions" width={640} height={597} loading="lazy" decoding="async" /></span>;
  return <span className="brand"><span className="brand-symbol"><Image unoptimized src="/brand/dstar-monogram-square.webp" loading="eager" alt="" width={256} height={256} decoding="async" /></span><span className="brand-wordmark"><strong>D Star</strong><span>IT Solutions</span></span></span>;
}
