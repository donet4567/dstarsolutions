import type { Metadata, Viewport } from "next";
import WebVitals from "@/components/WebVitals";
import { SITE_NAME, SITE_URL } from "@/components/site";
import "./globals.css";
import "./cinematic.css";
import "./depth.css";

// Run before the page is parsed so a refresh cannot restore a lower section.
// Normal section links and back/forward navigation keep their usual behavior.
const resetScrollOnReload = `(() => {
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "D Star IT Solutions | Websites & Web Apps in Kerala",
  description:
    "D Star IT Solutions in Bharananganam, Pala, Kerala designs and develops modern websites and custom web applications for your business.",
  applicationName: SITE_NAME,
  keywords: [
    "website development Kerala",
    "web app development Kerala",
    "website development Pala",
    "custom web applications",
    SITE_NAME,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "D Star IT Solutions | Websites & Web Apps in Kerala",
    description: "Focused website and web app design, engineering and launch.",
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_IN",
    images: [{ url: "/dstar-mark-v2.png", width: 854, height: 718, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: "D Star IT Solutions | Websites & Web Apps in Kerala",
    description: "Thoughtfully designed websites and custom web apps. Based in Bharananganam, Pala, Kerala.",
    images: ["/dstar-mark-v2.png"],
  },
  icons: {
    icon: "/dstar-mark-v2.png",
    apple: "/dstar-mark-v2.png",
  },
};

const business = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#business`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/dstar-mark-v2.png`,
  image: `${SITE_URL}/dstar-mark-v2.png`,
  telephone: "+917558920076",
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
  themeColor: "#fffefd",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head><script id="reload-scroll-reset" dangerouslySetInnerHTML={{ __html: resetScrollOnReload }} /></head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business).replace(/</g, "\\u003c") }} />
        {children}
        <WebVitals />
      </body>
    </html>
  );
}



