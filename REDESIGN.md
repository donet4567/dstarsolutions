# Sales-focused website update

The existing studio identity now leads with business websites from ₹8,000, clear package differences, business examples and a direct WhatsApp enquiry journey. The original brand, typography, pastel bloom, five palettes, selected projects and Donet Joseph’s founder section are retained.

## What changed

- The homepage order is hero → benefits → packages → business examples → studio → compact selected work → custom applications → four steps → FAQs → enquiry → founder → footer.
- Packages start at ₹8,000 / ₹15,000 / ₹25,000. Page limits, revision rounds, inherited inclusions, supplied translations and additional costs follow the supplied brief. Each package opens WhatsApp with its name, starting price and hosting/domain exclusion.
- `/small-business-websites` shares the package, example, process, FAQ and enquiry components, with its own headline, metadata and canonical URL. It is included in the sitemap.
- Six local `/website-demos/[slug]` concept pages provide working demo destinations. Their brands are explicitly fictional, and the pages are marked `noindex`. Their enquiries contact D Star. No invented client claims, testimonials or external demo URLs were added.
- Desktop/mobile preview controls have icons, clear labels, generous hit areas and pressed states. The previews use local CSS artwork with responsive type scaling.
- The enquiry collects customer name, business name, category, package and a short requirement. Custom application enquiries retain their project type. Messages are URL encoded and opened for the customer to review and send; no database was introduced.
- The floating WhatsApp link uses the shared business number and temporarily steps aside if it would cover another page control. It is hidden while a modal is open.
- The hero scrolls naturally instead of pinning the marketing message. The original bloom renderer, pause/rotation controls, reduced-motion support and WebGL fallback remain.
- Long digital storytelling and the task dashboard are no longer mounted on the sales pages. The original `DigitalJourney`, `ServiceShowcase` and `ProcessJourney` source components remain available for reuse. Technical stack badges were removed from the homepage. The development process is presented once, in four readable steps.
- New sections use the existing theme tokens, with stronger muted-text contrast. Below-fold project imagery remains deferred. No dependencies were added.

## Files

New components and content:

- `src/components/website-content.ts`: package data, exclusions, FAQs and business concepts.
- `src/components/WebsiteSales.tsx`: benefits, pricing, studio, custom applications, process, FAQ, enquiry section and shared footer.
- `src/components/BusinessShowcase.tsx`: six concept previews and desktop/mobile switching.
- `src/components/FloatingWhatsApp.tsx`: floating contact control and obstruction avoidance.

New routes and styles:

- `src/app/small-business-websites/page.tsx`
- `src/app/website-demos/[slug]/page.tsx`
- `src/app/sales.css`

Updated existing files:

- `src/components/DStarExperience.tsx`: homepage composition.
- `src/components/CinematicHero.tsx` and `.module.css`: clear hero content and unpinned responsive layout.
- `src/components/ProjectBrief.tsx`: enquiry fields, validation, package selection and message preparation.
- `src/components/SiteHeader.tsx` and `ExperienceMotion.tsx`: package/example navigation and active-section tracking.
- `src/components/SelectedWork.tsx` and `.module.css`: compact portfolio presentation with existing detail dialogs.
- `src/components/site.ts`: shared phone formatting and WhatsApp URL encoder.
- `src/app/layout.tsx` and `sitemap.ts`: metadata, stylesheet import, shared telephone and landing-page discovery.
- `src/app/rendering.css`: deferred-section size estimates updated for the shorter benefits, process and portfolio layouts.
- `README.md`: current structure, package configuration, demo disclosures and verification instructions.

Browser coverage:

- Added `tests/sales.spec.ts` for pricing, package messages, enquiry validation/encoding, demo routes, responsive layouts and floating-control obstruction.
- Updated `tests/site.spec.ts`, `experience.spec.ts`, `dimension.spec.ts`, `improvements.spec.ts` and `motion-regressions.spec.ts` for the new customer journey while retaining relevant existing regressions.
- Left `tests/rendering.spec.ts` intact for the original worker and compatibility bloom renderers.

## Verification

- Production build, ESLint and native TypeScript checks pass.
- The full desktop/mobile Chromium suite completed with **63 passed and 1 expected skip**. The skip is the desktop instance of the phone-only touch gesture test; the mobile instance passes.
- Follow-up checks pass for all five palettes, text contrast, theme persistence, responsive navigation and founder/enquiry behavior on desktop and mobile.
- The final sales/navigation regression run completed with **16 passed**, including package messages, Unicode enquiries, six demo routes, 320–1440px layouts, floating-control obstruction, refresh behavior and the 320×568px hero with the package button visible without scrolling.
- Browser visual inspection covered the homepage, pricing, mobile hero, tablet landing page and examples, dark mode and mobile enquiry dialog.
- The checks use installed Chrome through `TEST_CHROME_PATH`; no new browser or package dependency was installed. WhatsApp tests inspect prepared URLs without sending messages.

This is a local source update. It does not deploy changes to the live domain. Run `npm run dev` to review locally, or `npm run build` followed by `npm start` to run the production build.

Final screenshots are saved under `.dstar-backups/sales-redesign-20261106/` as `homepage-desktop.png` and `small-phone.png`.
