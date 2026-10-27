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

The site uses Next.js 16.4, React 19.3 and the default Turbopack production builder. Static page sections are Server Components; the navigation, enquiry form and project gallery are small client boundaries. Project artwork loads only after interaction. Motion uses native CSS and IntersectionObserver.

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

The browser suite runs against a production server on port 3100 in desktop and mobile Chromium. It covers the gallery and keyboard controls, enquiry preparation, mobile navigation, refresh-to-top behavior, server-rendered content, SEO routes and performance reporting. It never sends a WhatsApp message.

GitHub Actions runs these checks on pushes to `main` and pull requests. Dependabot opens weekly npm update PRs and monthly GitHub Actions update PRs, grouping framework and React packages together.

The production dependency audit is clean as of 20 October 2026. The full audit still reports the unpatched [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) through the ESLint dependency chain (five affected tooling packages). It is a development dependency and is not included in the site runtime. npm's suggested forced fix downgrades the Next.js ESLint configuration to version 14; keep the matching version 16 configuration and update when the upstream patch arrives. ESLint stays on the latest compatible 9.x line because the React plugin does not yet support ESLint 10.

## Search and sharing

The canonical URL, full business name, Open Graph/Twitter metadata and LocalBusiness JSON-LD are defined in `src/app/layout.tsx`. The public metadata routes are `/sitemap.xml`, `/robots.txt` and `/manifest.webmanifest`. Update the shared URL in `src/components/site.ts` if the production domain changes. The business address and telephone use the supplied contact details.

## Real-user performance

Production visits report CLS, FCP, INP, LCP and TTFB through Next.js `useReportWebVitals` to the first-party `/api/vitals` endpoint. Development sends no measurements. The endpoint validates and bounds the body, rejects foreign origins and emits one structured JSON log with `event: "web-vital"`, `name`, `value`, `rating` and `id`. It does not store cookies, full URLs, IP addresses or enquiry text.

In your hosting runtime logs, filter for `web-vital`. For each metric, deduplicate by `id` and use the latest value, then compare the 75th percentile across equivalent date ranges. CLS is unitless; other values are milliseconds. Good Core Web Vitals targets are LCP ≤ 2500 ms, INP ≤ 200 ms and CLS ≤ 0.1. Treat synthetic test measurements separately from visitor data.

Export a date range as JSONL and run `npm run vitals:summary -- path/to/runtime-logs.jsonl` for a deduplicated p75 summary against the good thresholds. It accepts plain JSON lines, prefixed JSON lines, or JSON entries with a JSON `message` field. This summary is intended for the current single-page site.

Collection works without an external analytics account. Retention follows your hosting log settings; a persistent dashboard or automated performance alerts require connecting those logs to your chosen monitoring service. No external dashboard is provisioned by this repository.
