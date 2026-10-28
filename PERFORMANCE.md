# Performance and readability audit — 28 October 2026

The desktop performance target is met in the final local production audit.
The mobile 95–100 target is **not yet met**. No deployment or push was performed.

## Production Lighthouse results

Lighthouse 13.6.0, installed Chrome 156, headless, against
`http://127.0.0.1:3100`. Mobile uses Lighthouse's default simulated mobile
throttling; desktop uses its desktop preset. Scores are local lab measurements,
not PageSpeed Insights results from the public deployment.

| Metric | Mobile baseline | Mobile final | Desktop baseline | Desktop final |
| --- | ---: | ---: | ---: | ---: |
| Performance | 50 | **76** | 63 | **95** |
| Accessibility | 96 | **100** | 96 | **100** |
| Best practices | 100 | **100** | 100 | **100** |
| SEO | 100 | **100** | 100 | **100** |
| First contentful paint | 2.5 s | **1.2 s** | 0.7 s | **0.3 s** |
| Largest contentful paint | 3.6 s | **1.2 s** | 0.9 s | **0.3 s** |
| Total blocking time | 7,995 ms | **1,040 ms** | 1,860 ms | **160 ms** |
| Main-thread work | 19.9 s | **3.7 s** | 5.7 s | **0.9 s** |
| Speed index | 7.1 s | **3.9 s** | 2.4 s | **1.3 s** |
| Cumulative layout shift | 0 | **0** | 0 | **0** |

Mobile blocking time fell approximately 87%; main-thread work fell 81%.
Long tasks fell from 19 to 13. Machine load and CPU benchmarking varied between
runs, so these snapshots should not be interpreted as guaranteed field scores.
The user's earlier public-site score of 68 / 34,970 ms TBT used different test
conditions and is not the controlled local baseline in this table.

The remaining mobile load-time tasks are concentrated in the Next/React
bootstrap and initial browser layout. The largest final simulated tasks were
542 ms in a framework chunk and 527 ms attributed to the document. The bloom's
shader initialization now runs in its worker, outside the main thread. Further
work is still needed before claiming the mobile target has been restored.

## Root causes and changes

- The initial bloom compiled physical-material shaders, created its environment
  and rendered on the page's main thread. It now uses an OffscreenCanvas worker
  where supported, with the original React Three Fiber renderer as a fallback.
- The scroll-controlled digital scene rendered continuously while stationary.
  It now requests frames only for changed input and while its existing damping
  transition settles. The animation formulas and timing constants are retained.
- Environment JSX changed on control/chapter updates, causing unnecessary
  cube-environment captures. The environment elements are now stable.
- Shader compilation is prepared asynchronously before the first draw in the
  compatibility and digital-scene renderers. Readiness is reported after a draw.
- The bloom stops its animation loop when its actual canvas is outside the
  viewport, paused, or the page is hidden. Worker and observer resources are
  released on unmount.
- Scroll effects batch geometry reads before style writes. Header progress is
  scoped to the header instead of changing an inherited variable on the entire
  document. Reveal observers no longer force offscreen layout on startup.
- Motion preferences are initialized before first paint, avoiding a late
  switch to the pinned layouts. JavaScript-disabled pages retain static content.
- Below-fold sections use native content visibility with intrinsic size
  estimates; the browser retains measured sizes after a section is rendered.
- Existing CSS is inlined using Next's `experimental.inlineCss` option. This
  option was verified with the installed, pinned Next 16.4.2 production build.
- Pre-encoded gallery pictures no longer load the unnecessary Next image client
  component. AVIF/WebP source sets, dimensions, loading behavior, and callbacks
  remain. A lossless WebP logo is 30,320 bytes versus the original PNG's 56,845
  bytes, with zero differences in visible pixel channels. PNG remains a fallback.

## Visual and accessibility preservation

The bloom geometry and motion formulas are shared by both renderers. Its
materials, light positions, environment lightformers, shadows, camera, DPR
range, and animation speeds are retained. A 1440×900 reduced-motion comparison
of the worker and compatibility renderers produced **zero pixel differences**.
That comparison preceded the subsequently authorized text-contrast changes.
The other 3D model, scroll chapters, gallery, interactive demos and enquiry flow
are retained.

Following explicit authorization to change colors, interface text uses darker
plum and green tones. Page backgrounds and 3D artwork retain their colors.
Small labels, body copy, footer links, chapter controls, demo text, hover/focus
states and dialog text were checked. The small demo CTA also uses a darker fill.
Accessible names now include their visible text rather than replacing it with
incomplete labels.

## Verification

- Production build, native TypeScript check and ESLint passed.
- All **36 Playwright checks** passed across desktop and Pixel 7 profiles:
  chapters, reduced motion, rotation/pause/resume, worker/fallback rendering,
  missing WebGL, gallery keyboard navigation, enquiries, refresh behavior,
  responsive layouts, metadata and performance reporting.
- Layout coverage includes 320, 390, 768 and 1440 px widths.
- Axe A/AA checks found **zero violations** in the full page, enquiry dialog and
  project gallery at 1440 and 390 px. For this check, offscreen sections were
  explicitly rendered so deferred/reveal content could not hide failures.
- Final Lighthouse accessibility, best practices and SEO are 100 on both modes.

## Reports and reproduction

Reports, traces and local screenshots are saved under the Git-ignored directory
`.dstar-backups/performance/`:

- `baseline-mobile.report.html` / `baseline-desktop.report.html`
- `optimized-mobile.report.html` / `optimized-desktop.report.html`
- Corresponding `.report.json`, `-0.trace.json` and `-0.devtoolslog.json` files
- `accessibility-check.json`, `final-1440.png`, `final-390.png`
- `bloom-worker.png` / `bloom-main.png` for renderer parity

Build and start production in one terminal:

```powershell
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

In a separate terminal, run the two audits sequentially with other tests idle:

```powershell
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run audit:lighthouse -- mobile
npm run audit:lighthouse -- desktop
```

The audit script pins Lighthouse 13.6.0 through npm exec and saves uniquely
dated reports and traces. It does not build, publish or deploy the site.
For browser checks, stop the manually started production server first; the
Playwright configuration starts and stops its own server on port 3100.

```powershell
$env:TEST_CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run test:e2e
```
