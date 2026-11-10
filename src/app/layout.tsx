import type { Metadata, Viewport } from "next";
import WebVitals from "@/components/WebVitals";
import { PHONE, SITE_NAME, SITE_URL } from "@/components/site";
import "./foundation.css";
import "./rendering.css";
import "./themes.css";
import "./sales.css";
import "./orbit.css";
import "./showroom.css";
import "./perspective.css";
import "./chapters.css";
import "./work-deck.css";

// Run before the page is parsed so a refresh cannot restore a lower section.
// Normal section links and back/forward navigation keep their usual behavior.
const resetScrollOnReload = `(() => { const motion = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => document.documentElement.dataset.motion = motion.matches ? 'reduced' : 'full'; update(); motion.addEventListener('change', update); })();
(() => {
  if (performance.getEntriesByType('navigation')[0]?.type !== 'reload') return;
  const previousRestoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  addEventListener('pageshow', () => {
    scrollTo({ top: 0, left: 0, behavior: 'instant' });
    requestAnimationFrame(() => {
      scrollTo({ top: 0, left: 0, behavior: 'instant' });
      history.scrollRestoration = previousRestoration;
    });
  }, { once: true });
})();`;

// Synchronous and inline: restore the palette before any body content can paint.
const restoreTheme = `(() => { let theme = 'midnight'; try { const saved = localStorage.getItem('dstar-appearance-v1'); if (saved === 'ivory' || saved === 'midnight') theme = saved; } catch {} document.documentElement.dataset.theme = theme; })();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Business Websites from ₹8,000 in Kerala | D Star IT Solutions",
  description:
    "Beautiful, mobile-friendly business websites from ₹8,000. D Star IT Solutions in Bharananganam, Pala serves Kottayam, Kerala and beyond. Domain and hosting extra.",
  applicationName: SITE_NAME,
  keywords: [
    "website development Kerala",
    "web app development Kerala",
    "website development Pala",
    "small business websites Kerala",
    "affordable website design Kottayam",
    "custom web applications",
    SITE_NAME,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Beautiful Business Websites from ₹8,000 | D Star IT Solutions",
    description: "Professional business websites for shops, startups and growing businesses in Kerala and beyond. One-time development fee; domain and hosting extra.",
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_IN",
    images: [{ url: "/brand/dstar-lockup.webp", width: 640, height: 597, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: "Beautiful Business Websites from ₹8,000 | D Star IT Solutions",
    description: "Mobile-friendly business websites from Pala, Kerala. Starting development fee ₹8,000; domain and hosting extra.",
    images: ["/brand/dstar-lockup.webp"],
  },
  icons: {
    icon: "/brand/dstar-icon-256.png",
    apple: "/brand/dstar-icon-256.png",
  },
};

const business = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#business`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/dstar-lockup.webp`,
  image: `${SITE_URL}/brand/dstar-lockup.webp`,
  telephone: `+${PHONE}`,
  description: "Website design, development and custom web applications.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bharananganam, Pala",
    addressRegion: "Kerala",
    addressCountry: "IN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#100d15",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script id="restore-theme" dangerouslySetInnerHTML={{ __html: restoreTheme }} /><script id="reload-scroll-reset" dangerouslySetInnerHTML={{ __html: resetScrollOnReload }} /></head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business).replace(/</g, "\\u003c") }} />
        {children}
        <WebVitals />
      </body>
    </html>
  );
}
