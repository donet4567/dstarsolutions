import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  metadataBase: new URL("https://www.dstarsolutions.in"),
  title: "D Star | Website & Web App Development",
  description:
    "D Star is a focused digital product studio in Pala, Kerala, designing modern websites and custom web applications for real business use.",
  keywords: [
    "website development Kerala",
    "web app development Kerala",
    "website development Pala",
    "custom web applications",
    "D Star",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "D Star | Website & Web App Development",
    description: "Focused website and web app design, engineering and launch.",
    type: "website",
    url: "/",
    siteName: "D Star",
    images: [{ url: "/dstar-mark-v2.png", width: 420, height: 353, alt: "D Star" }],
  },
  icons: {
    icon: "/dstar-mark-v2.png",
    apple: "/dstar-mark-v2.png",
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
      <body>{children}</body>
    </html>
  );
}



