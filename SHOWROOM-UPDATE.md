# D Star showroom update — 9 November 2026

The homepage and website guide now share an accessible category selector and six equally sized design-study cards. Each card opens its working demo and offers a contextual WhatsApp enquiry. Full composition / Detail crop controls belong to the individual image; they are separate from the demo's Desktop / Mobile viewport controls.

The six fictional concepts retain their original AVIF/WebP assets. Fern & Flour has keyboard-operated menu directions; Studio Aura has service accordions; Form & Field has a stepped architectural project grid; Thread & Story has an editorial collection selector; Stillwater has calm hospitality chapters; Northline uses structured professional-services storytelling. Every demo states its fictional status, credits D Star, and directs enquiries to D Star. No booking, checkout, inventory or advisory backend was added.

Demo navigation preserves the originating homepage or guide, gallery filter and selected viewport. Previous/next navigation wraps across all six concepts. Native links and browser history remain available. Desktop previews fit the available browser width; Mobile constrains the live layout to a maximum of 390px. Container queries reflow the actual page content rather than substituting a cropped screenshot.

The existing GSAP stack now drives section entrances, staggered cards, founder/contact entrances and Discover / Design / Develop / Launch progress. CSS handles hero typography, category transitions, gallery hover/focus treatments, service accordions, buttons and navigation transitions. Reduced-motion users receive the complete static layout; observers, listeners and animation contexts are cleaned up on unmount or preference changes. No dependency was added.

The decorative artwork beside “Beyond a website. Built around you.” was removed at the user's request. The section now uses a text layout and retains its separate custom-application quote action.

Package prices, limits, exclusions, phone number, enquiry form, WhatsApp messages, selected client-work previews, appearance storage, canonical URLs and existing metadata remain intact. No files under `public/` were changed.

## Files

- `src/components/BusinessShowcase.tsx`: shared gallery, original responsive imagery and per-image controls.
- `src/components/DemoShowroom.tsx`: six concept compositions, interactive chapters, viewport controls and demo navigation.
- `src/components/useShowroomQuery.ts`: hydration-safe URL state and browser-history subscriptions.
- `src/components/StudioMotion.tsx`: lazy GSAP entrances and progress, with reduced-motion cleanup.
- `src/components/Navigation.module.css`: menu entrance/exit and staggered link transitions.
- `src/components/WebsiteSales.tsx`: text-only custom applications section and process labels.
- `src/app/showroom.css`: gallery, concept layouts, container queries, focus states and motion.
- `src/app/layout.tsx`: loads showroom styles.
- `src/app/small-business-websites/page.tsx`: gallery origin context and shared motion.
- `src/app/website-demos/[slug]/page.tsx`: preserves static generation and metadata while mounting the new viewer.
- `tests/experience.spec.ts`, `tests/sales.spec.ts`, `tests/showroom.spec.ts`: updated gallery expectations and added history, viewport, keyboard, image, theme and responsive checks.

## Verification

- Lint, TypeScript and production build passed.
- The complete Playwright suite passed: 52/52 on desktop and Pixel 7 emulation.
- After final spacing, menu and gallery-history refinements, all 10 focused production checks passed again. These include returning to both a filtered gallery and all studies, keyboard controls, image loading and console errors, viewport switching, navigation and responsive geometry.
- Visual review covered all six concepts, the gallery and the text-only custom application section.
- Responsive checks covered 360, 390, 768, 1024 and 1440px, with existing sales tests also covering 320px.
- The suite verifies package contents, WhatsApp context, enquiry validation, mobile menus, theme persistence, reduced motion, client-work dialogs, metadata and missing-demo 404s.

Local screenshots are in `artifacts/showroom-gallery.png`, `artifacts/showroom-mobile.png`, `artifacts/custom-applications-mobile.png` and `artifacts/demo-review-contact-sheet.png`. Full intermediate visual captures are kept under the ignored `.dstar-backups/showroom-review/` directory. Existing untracked backup and experimental files were left untouched.

Lighthouse measurements are local laboratory measurements; field Core Web Vitals and the hosting deployment require post-release observation.

The final mobile Lighthouse run scored 69 performance, 100 accessibility, 100 best practices and 100 SEO. LCP was 2.1s, total blocking time 1,710ms and CLS 0. An earlier run scored 72 performance with LCP 1.0s. The prior recorded baseline was 72 mobile performance with 2,060ms blocking time. These runs do not establish a performance improvement: mobile main-thread blocking remains a limitation. The contrast issue found during the first audit was corrected by keeping gallery-card entrance text at full opacity.

The final desktop run scored 87 performance, 100 accessibility, 100 best practices and 100 SEO, with LCP 0.5s and total blocking time 310ms. The previous recorded desktop performance score was 90. A performance improvement across both devices has therefore not been established. Machine-readable results are saved in `artifacts/showroom-validation.json`; full audit reports remain in the ignored `.dstar-backups/performance/` directory.
