# D Star 2.0 — A star in orbit

Implemented in the existing Next.js 16 application. This iteration supersedes the earlier sales refresh notes in REDESIGN.md.

## Art direction

Midnight plum, near-black, silver lavender and metallic gold. Oversized sans-serif headlines alternate with italic editorial serif accents. Each chapter uses its own composition: sculptural hero, spatial manifesto, asymmetrical real-project gallery, staggered fictional design studies, stepped pricing, signed founder note and a full gold closing invitation.

References reviewed: Lil-Boxes (typographic energy and storytelling), Growon (restrained space and objects), VIV MGMT (monumental identity and asymmetrical image composition). No source assets or layouts were copied.

## Preserved behavior

- Original D Star logo, business name, phone, location and Donet Joseph’s founder text.
- All three existing project entries, responsive artwork and keyboard-accessible project dialogs.
- Complete ₹8,000 / ₹15,000 / ₹25,000 package data and exclusions, unchanged.
- Package WhatsApp links and validated, URL-encoded project-brief form.
- All six original demo routes remain addressable and retain their noindex metadata. Gallery demo links were removed at the user's later request.
- Sitemap, robots, structured business data, canonical metadata, FAQ disclosures, theme persistence, active navigation and enquiry controls.

## Motion and rendering

Custom beveled star geometry, local procedural studio environment and metallic material. Three.js is dynamically imported after the first pointer or scroll input, only for desktop visitors without reduced motion. Frames render only on pointer movement, scroll, resize or re-entry; no perpetual animation loop. Geometry, environment and renderer are disposed on teardown. Phones and reduced-motion visitors get an inline sculpted SVG without WebGL downloads.

Desktop choreography loads near the manifesto; phones skip GSAP entirely. GSAP ScrollTrigger connects headline translation to scrolling. The gallery, package and service entries use restrained entrance translations. Reduced motion disables these effects. Core content is server rendered and visible without JavaScript.

Gallery images are lazy-loaded with reserved 3:2 dimensions and 640/1280px AVIF and WebP sources. Offscreen chapters use content-visibility with intrinsic size hints and browser scroll anchoring; image geometry is reserved before loading.

## Original gallery assets

Generated with the built-in image-generation tool, one separate prompt per asset. Originals and complete prompts: `artifacts/gallery-source/`. Responsive production files: `public/gallery/`. Combined visual review: `artifacts/gallery-review.png`.

- Fern & Flour: olive café, warm walnut, coffee and pastry photography.
- Studio Aura: blush plaster, burgundy mirror, chrome and calla lily.
- Form & Field: tropical concrete residence in deep forest.
- Thread & Story: silk, tailoring, travertine and a red fashion accent.
- Stillwater: Kerala backwaters, a lakeside villa and misty dawn.
- Northline: sculptural brushed silver, blue glass and Swiss typography.

The images are explicitly identified as fictional design studies. They are not claimed as client projects or working website screenshots. Full composition and detail crop controls change the actual image presentation.

## Verification

Responsive inspection covers 360, 390, 768, 1024 and 1440px, plus the existing 320px regression. Browser tests use installed Chrome through `TEST_CHROME_PATH` because bundled Playwright Chromium is absent. Build, lint, native TypeScript and production browser suite results are reported in the completion message. Lighthouse reports are retained under `.dstar-backups/performance/`; scores describe local lab runs only.


## Supplied logo
The user's supplied gold D-orbit logo is preserved at public/brand/dstar-supplied-original.png. Optimized monogram and full-lockup crops are used in the header, footer, favicon and social metadata. The earlier logo files remain intact.


The appearance button remains disabled until hydration makes its handler ready. Footer layout is kept eager for stable touch targets; other offscreen chapters use deferred rendering.

## Final validation — 7 November 2026

Build, ESLint (zero warnings) and TypeScript pass. The full 46-case desktop/mobile suite completed with 45 passing and one theme-startup failure. After gating the appearance button until hydration and keeping footer layout eager, the theme regression passed all six repeat runs (three desktop, three mobile). The final desktop-only choreography observer adjustment also builds and lints cleanly.

| Local Lighthouse | Desktop | Mobile |
| --- | ---: | ---: |
| Performance | 90 | 72 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| LCP | 0.9 s | 1.1 s |
| TBT | 250 ms | 2,060 ms |
| CLS | 0.005 | 0 |

Mobile startup blocking remains unresolved, so the high mobile Lighthouse target is not met. These are local lab measurements, not public-site PageSpeed scores. The mobile code path is unchanged by the final desktop observer threshold adjustment. Full reports remain in .dstar-backups/performance; artifacts/validation-summary.json records exact report paths.

For this Windows environment, run browser tests after setting TEST_CHROME_PATH to C:/Program Files/Google/Chrome/Application/chrome.exe. Run npm run dev to preview the local implementation.
