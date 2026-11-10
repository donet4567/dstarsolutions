# Immersive 3D world — 10 November 2026

The homepage now opens into a full-screen spatial scene based on the composition and interaction direction of [Lorenzo Lottici's website](https://lorenzolottici.it/). The large hero star has been removed; D Star's existing logo remains in the navigation.

The scene contains 27 floating, textured cubes, a reflective ground plane, a rim-lit planet, an observer silhouette, sparse distant points and peripheral panes. As the visitor scrolls into the studio chapter, the camera moves through the scene and reveals a curved galaxy ribbon. Text, navigation and enquiries remain normal semantic HTML above the scene.

Clicking the scene sends a ripple through the forms. Holding releases them. The visible Release / Gather control provides the same main interaction through a native keyboard and touch button. A separate Pause control stops ambient motion. Reduced-motion visitors receive a static CSS scene with working gathering/release controls. A local static scene also remains available if WebGL cannot initialize.

The world starts after the initial content paint, uses the existing Three.js dependency, and loads no remote images, models, fonts or sound. Its geometry and textures are created locally. Desktop uses low-resolution planar reflection and a restrained film pass; mobile uses a wider camera, lower pixel ratio, fewer background elements and no reflection/postprocessing passes. Rendering pauses when the scene leaves the viewport or the document is hidden. Idle rendering is capped at 24fps on desktop and 20fps on mobile; interaction caps are 50fps and 30fps respectively. Resizing is debounced, and GPU targets, geometry, textures, observers, listeners and timers are disposed during route or motion-preference changes.

The reference's original textures, model and project were not supplied. This is a local reconstruction of its 3D composition and interactions, not a pixel-identical copy of its original assets. A pixel-identical result requires the original scene assets and camera/shader configuration.

## Files

- `src/components/StudioWorld.tsx`: scene lifecycle, accessible controls and static fallback.
- `src/components/studio-world.ts`: procedural geometry/textures, lighting, reflections, camera movement and interaction renderer.
- `src/app/perspective.css`: full-screen composition, responsive layout and static fallback.
- `src/components/CinematicHero.tsx`: mounts the world and connects the studio chapter.
- `src/components/SiteHeader.tsx`, `src/components/Navigation.module.css`: compact numbered chapter navigation.
- `src/components/StudioMotion.tsx`: individual gallery-frame entrances and varied heading/card movement without dimming card copy.
- `src/app/layout.tsx`: loads scene styles.
- `tests/rendering.spec.ts`, `tests/world.spec.ts`: static fallback, full-viewport rendering, release/gather, pause, reduced motion, viewport sizing and route cleanup.

The six business concepts, original gallery/client-work imagery, package prices and exclusions, WhatsApp context, enquiry form, contact details, metadata and appearance settings remain intact. No production dependency or existing `public/` asset changed. The text-only “Beyond a website” section remains text-only.

The opening was retained after user review. The middle was restyled with off-white service/process chapters, black editorial galleries, a vermilion custom-applications section and an orange contact surface. Existing content, prices and images remain intact.

The latest refinement focuses on Selected Work: three sticky desktop case files, an accessible project index, oversized numbering, per-project off-white/charcoal/red surfaces, scroll-linked image entrances and native keyboard-operated project dialogs. Mobile and reduced-motion layouts use a normal, non-overlapping reading flow. Styles are scoped in src/app/work-deck.css; other page sections were left unchanged during this final refinement.

Verification: lint and production build (including TypeScript) passed. The world implementation passed 56 desktop/mobile checks and 4 final scene rechecks. The middle-section revision passed all 24 targeted checks. All 8 final Selected Work checks passed on desktop and mobile, including project anchors, preview dialogs, image expansion, keyboard navigation and focus return.

No new Lighthouse measurements were collected for this 3D release; the earlier showroom performance scores do not describe the new scene. Real-time 3D remains more GPU-intensive than the previous static hero.

Visual artifacts: artifacts/selected-work-desktop.png and artifacts/selected-work-mobile.png. The local scene recording is artifacts/immersive-world.webm.
