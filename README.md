# D Star IT Solutions

Production source for [D Star IT Solutions](https://www.dstarsolutions.in).

## Run locally

```powershell
nvm use
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Production

```powershell
npm run build
npm start
```

Use Node 24.22.0 (pinned in `.nvmrc` and `.node-version`) locally and in hosting settings. On Windows, select that version with your Node version manager before running npm.

The site uses Next.js 16.4, React 19.3 and the default Turbopack production builder. Static page sections are Server Components; navigation, the enquiry form, theme controls, business preview switching and the project gallery use small client boundaries. Project artwork loads as the compact gallery approaches the viewport; project dialogs retain keyboard navigation. The hero lazy-loads the existing locally sculpted Three.js bloom, with no external models or HDR downloads. Rendering pauses offscreen, on hidden tabs and through the visible pause control. Reduced-motion preferences disable autonomous motion; the server-rendered CSS bloom remains available without JavaScript or WebGL.

The homepage presents business website benefits, three packages, six business demo concepts, the studio, selected work, custom applications, four development steps, FAQs, enquiries and Donet Joseph’s founder section. The longer digital journey, task dashboard and pinned process components remain in source for future reuse but are no longer mounted on the sales pages. The original five palettes, including Midnight Navy, remain available and persist before paint.

## Website packages and enquiries

`/small-business-websites` is the dedicated package landing page. `src/components/website-content.ts` is the shared source for the ₹8,000 Essential, ₹15,000 Growth and ₹25,000 Premium packages, exclusions, FAQs and six demo concepts. Changes here update both sales pages. Prices are starting one-time development fees; domain, hosting, renewals and the other stated exclusions cost extra. Static packages include no database, login, admin dashboard or online checkout.

`src/components/site.ts` owns the business number and URL encoder used by package, demo, floating contact and enquiry links. The enquiry dialog collects a name, business name, category, package and short requirement, and opens a WhatsApp draft for review. It stores no enquiry in a database and does not send messages automatically. The floating WhatsApp control steps aside when it would obstruct another link or button.

`/website-demos/[slug]` contains six real local concept pages. Their brands are fictional and explicitly labelled. They use local CSS artwork, require no remote images, and route enquiries to D Star. These pages are marked `noindex` to avoid presenting fictional businesses as search results. Mecardee and HireVify remain in the selected-work gallery, with the original illustrative-artwork disclosure.

## TypeScript compatibility

`npm run typecheck` uses the native TypeScript 7 compiler. The `typescript` package is intentionally aliased to Microsoft's TypeScript 6 compatibility package: Next.js and ESLint still consume the JavaScript compiler API, which TypeScript 7 does not yet provide. Both compilers check the same source during CI. Update this arrangement when those integrations support the native API.

## Quality checks

```powershell
npm run lint
npm run build
npm run typecheck
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev
```

The browser suite runs against a production server on port 3100 in desktop and mobile Chromium. It covers the bloom, pause controls, reduced motion, WebGL fallback, desktop/mobile business previews, 320–1440px layouts, five palettes, gallery keyboard controls, package prices and WhatsApp messages, enquiry validation and Unicode encoding, local demo routes, mobile navigation, refresh-to-top behavior, server-rendered content, SEO routes and performance reporting. It never sends a WhatsApp message. If the Playwright browser is not installed, set `TEST_CHROME_PATH` to an installed Chrome executable before running the suite.

GitHub Actions runs these checks on pushes to `main` and pull requests. Dependabot opens weekly npm update PRs and monthly GitHub Actions update PRs, grouping framework and React packages together.

The production dependency audit is clean as of 20 October 2026. The full audit still reports the unpatched [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) through the ESLint dependency chain (five affected tooling packages). It is a development dependency and is not included in the site runtime. npm's suggested forced fix downgrades the Next.js ESLint configuration to version 14; keep the matching version 16 configuration and update when the upstream patch arrives. ESLint stays on the latest compatible 9.x line because the React plugin does not yet support ESLint 10.

## Search and sharing

The canonical URL, full business name, Open Graph/Twitter metadata and LocalBusiness JSON-LD are defined in `src/app/layout.tsx`. The public metadata routes are `/sitemap.xml`, `/robots.txt` and `/manifest.webmanifest`. Update the shared URL in `src/components/site.ts` if the production domain changes. The business address and telephone use the supplied contact details.

## Real-user performance

Production visits report CLS, FCP, INP, LCP and TTFB through Next.js `useReportWebVitals` to the first-party `/api/vitals` endpoint. Development sends no measurements. The endpoint validates and bounds the body, rejects foreign origins and emits one structured JSON log with `event: "web-vital"`, `name`, `value`, `rating` and `id`. It does not store cookies, full URLs, IP addresses or enquiry text.

In your hosting runtime logs, filter for `web-vital`. For each metric, deduplicate by `id` and use the latest value, then compare the 75th percentile across equivalent date ranges. CLS is unitless; other values are milliseconds. Good Core Web Vitals targets are LCP ≤ 2500 ms, INP ≤ 200 ms and CLS ≤ 0.1. Treat synthetic test measurements separately from visitor data.

Export a date range as JSONL and run `npm run vitals:summary -- path/to/runtime-logs.jsonl` for a deduplicated p75 summary against the good thresholds. It accepts plain JSON lines, prefixed JSON lines, or JSON entries with a JSON `message` field. Measurements aggregate visits across the site without recording page URLs.

Collection works without an external analytics account. Retention follows your hosting log settings; a persistent dashboard or automated performance alerts require connecting those logs to your chosen monitoring service. No external dashboard is provisioned by this repository.
