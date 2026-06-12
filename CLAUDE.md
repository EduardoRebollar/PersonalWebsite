# Claude session handoff — Eduardo Rebollar's personal portfolio

This file is auto-loaded by Claude Code at the start of each session in this repo. Read it first.

## What this project is

A personal portfolio for Eduardo Rebollar — Computer Science & Economics student at Occidental College. Single-page site that opens with a full-bleed `SpiralSplash` intro, then an interactive Spline 3D scene rendered full-bleed behind the hero (gated on capable, non-reduced-motion devices). Sections, top to bottom: Hero → About → Journey → Skills → Projects → Contact.

- **Deployed**: `https://eduardorebollar.vercel.app/`
- **Repo**: `https://github.com/EduardoRebollar` (push to `main` → Vercel auto-deploys)
- **Original implementation plan**: `~/.claude/plans/i-want-to-build-lexical-sketch.md` (outside this repo)

## Stack — locked in

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16 (App Router, Turbopack) | Migrated from 15 mid-build; supporting `@next/*` packages all bumped to ^16.2.6 |
| Runtime / pkg mgr | bun 1.3+ | Installed via `npm install -g bun`. Vercel auto-detects the `bun.lock` |
| React | 19.2 | |
| Styling | Tailwind v4 (CSS-first) | `@theme` in `app/globals.css`; **no `tailwind.config.ts`** |
| 3D | `@splinetool/react-spline` 4 + `@splinetool/runtime` 1 | Lazy + Suspense in `components/ui/three/SplineScene.tsx`. **Spline is no longer on the homepage** — the only mount is `SkillsBackdrop` (`/spline/skills.splinecode`), which renders on the `/work/[slug]` case-study pages, gated on `initialized && hasWebGL2 && !isMobile && !reducedMotion` over a `gradient-dots` fallback. Self-hosted under `/public/spline/*.splinecode` (only `skills.splinecode`; the old `hero.splinecode` was removed once the homepage hero dropped Spline). Replaced the prior R3F terrain stack |
| UI motion | `motion` 12 (rebranded framer-motion) | `MotionConfig reducedMotion="user"` auto-skips on OS preference. Drives the splash-gated Hero entrance (`DiaTextReveal` name sweep + `TextEffect` per-char eyebrow/tagline + staggered CTA cascade + `ScrollHint`, all keyed off `splashDismissed`), cursor `Spotlight`, the `timeline` scroll beam, `FloatingDock`, `AppleCardsCarousel`, the `skill-marquee`, and the animated backgrounds (`BackgroundBeams`, `sparkles`, `StarfieldBackground`, `orbiting-skills`, `gradient-dots`). Several accents are pure-CSS keyframes in `globals.css` (`gradient-text`, `gradient-rotate`, plus `glow-pulse`/`.cta-glow` on the Hero's *Get in touch* link) that the global reduced-motion clamp freezes automatically |
| State | Zustand 5 | `stores/useSceneStore.ts` — single global store written by `DeviceDetector`; exposes `initialized`/`hasWebGL2`/`isMobile`/`reducedMotion` (gate motion-heavy surfaces) + `splashDismissed`/`dismissSplash` (set by `SpiralSplash` on Enter; lets the Hero defer its reveal). The dead R3F-era fields (`gpuTier`/`liteMode`/`activeSection`/`sectionProgress` + their setters and `selectShouldRenderScene`) were trimmed in Phase 11 |
| Content | TS data files + MDX case studies | `content/data/*.ts` + `content/projects/*.mdx` |
| Case-study viz | `@nivo/*` (bar/line/heatmap), `cytoscape` + `react-cytoscapejs`, `leaflet` + `react-leaflet` | Bundled lazily into the routes that use them (BiLSTM, Interactivity, LA History) |
| LA History AI | `ai` v6 + `@ai-sdk/react` v3 | Tutor + concept-map chat under `/work/la-history/play`; routes in `app/api/la-history/*` |
| Image opt | `sharp` (via Next 16) | Run-once compression in `scripts/optimize-images.mjs` |

## Folder map

```
app/                 Next.js App Router (routes, layouts, OG, sitemap, robots, icon)
mdx-components.tsx   Next.js convention — typography + MDX component map
components/
  sections/          One per page section: Hero, About, Journey, Skills,
                       Projects, Contact. (Education + Experience were merged
                       into Journey — a single chronological timeline.)
  ui/                Grouped into subfolders (all import via the
                       @/components/ui/<sub>/<Name> alias):
    primitives/        Container, Card, Pill, Heading, Eyebrow, Footer
    nav/               Nav (drives the dock), FloatingDock, ScrollHint
    cta/               RippleButton, RippleLink, ShinyButton (+ lib/useRipple)
    three/             SplineScene, Spotlight (3D / cursor)
    backgrounds/       SpiralSplash + spiral-animation, BackgroundBeams,
                       sparkles, StarfieldBackground, shooting-stars, stars-background,
                       gradient-dots (Spline-fallback backdrop)
    (ui/ root)         Section-specific widgets kept flat: timeline (Journey),
                       AppleCardsCarousel (Projects), orbiting-skills +
                       SkillPopover + skill-marquee + SkillHighlightCard +
                       animated-gradient-border (BorderRotate) +
                       animated-gradient-text (Skills),
                       dia-text-reveal + text-effect (Hero intro reveal), Lightbox
  a11y/              DeviceDetector, SkipToContent
  mdx/               Figure, Aside, TechStack, Lessons, RepoLink, DemoLink
  viz-bilstm/        BiLSTM case-study charts (Nivo) — bundled into /work/bilstm-vs-ffnn
  viz-interactivity/ Interactivity dashboard (Nivo + SVG) — bundled into /work/interactivity-…
  laHistory/         Native Next.js port of LA History: Leaflet map, Cytoscape concept map,
                       tutor + concept-map chat (AI SDK)
  seo/               JsonLd
content/
  data/              site, projects, experience, education, skills (typed TS)
  projects/          MDX case studies — registered in lib/mdx.ts
lib/                 cn, device, mdx, motion, seo, useOutsideClick, useInViewport
stores/              useSceneStore (Zustand) — feeds Hero's Spline gate + intro
                       reveal (splashDismissed / dismissSplash)
types/               content (Project, ExperienceItem, EducationItem,
                       MediaImage, SkillGroup, SkillCard/SkillCardGroup, …).
                       Journey cards take an optional `images?: MediaImage[]`
                       on Education/Experience items.
public/              photo.jpg, projects/<slug>/*, OG, favicon
scripts/             optimize-images.mjs (one-off sharp pipeline)
Personal Data/       GITIGNORED — source PDFs, papers, project code, headshot
```

## Architecture in 30 seconds

- **Intro splash**: `components/ui/backgrounds/SpiralSplash.tsx` (mounted first in `app/page.tsx`) overlays a full-bleed `spiral-animation` on first load, fading out to reveal the page. Dismissing it (Enter / Esc / click) fades the overlay **and** calls `dismissSplash()` (`useSceneStore`), flipping `splashDismissed` so the Hero's entrance plays *after* the intro clears, not behind it.
- **Hero background**: `components/sections/Hero.tsx` renders the animated copy (Eyebrow / display name / tagline / CTAs) over a full-bleed background — the page-wide starfield (`StarsBackground` + three `ShootingStars`) with an `OrbitalField` (imperative SVG ring orbit, IntersectionObserver-paused) layered in front. **No Spline scene** (the hero Spline was removed; `BackgroundBeams` lives only on the `/work` case-study pages now). The hero CTAs (`scrollToWork`/`scrollToContact`) mirror the dock's scroll targets (`#work-controls` row, page bottom) rather than jumping to anchor tops.
- **Hero entrance choreography**: gated on `splashDismissed`, the left-column copy animates in as a sequence — the display name reveals via `DiaTextReveal` (an indigo color-band clip-sweep, `respectReducedMotion={false}` so it plays for everyone), the eyebrow + tagline fade in per-character via `TextEffect`, then the CTAs cascade up (staggered `motion` variants) with `ScrollHint` (`play` prop) as the final beat. The *See work* CTA is a `ShinyButton`; the ghost *Get in touch* link carries `.cta-glow` — a pulsing white text-shadow halo (`glow-pulse` keyframe, top-level in `globals.css`). Radii stay under the button padding so `RippleLink`'s `overflow-hidden` doesn't clip the halo.
- **Device gating**: `components/a11y/DeviceDetector.tsx` runs on mount inside `<Providers />`, detects WebGL2 + viewport + `prefers-reduced-motion`, and writes to `useSceneStore`. `SkillsBackdrop` (on `/work/[slug]`) reads `initialized && hasWebGL2 && !isMobile && !reducedMotion` — only when true does `<SplineScene />` mount and the heavy runtime loads. The `timeline` beam and other motion surfaces read `useSceneStore.reducedMotion` directly to render static fallbacks.
- **Offscreen-pause convention**: every always-on animation loop pauses while scrolled out of the viewport via `lib/useInViewport.ts` (a shared IntersectionObserver hook modeled on `OrbitalField`'s pattern). The canvas starfields (`StarsBackground`, mounted in all six sections), each `ShootingStars`, the hero `BackgroundBeams`, and the `OrbitingSkills` orbit all gate their `requestAnimationFrame` on it (stacked on top of the existing `reducedMotion` gate). Any new animated background must do the same — don't add an ungated rAF/canvas loop.
- **Skills section**: `components/sections/Skills.tsx` filters `skills` (in `content/data/skills.ts`) into two `OrbitingSkills` groups (Technical / Productivity). Coursework + "Other" live separately as `skillHighlights: SkillCardGroup[]` (name + descriptor + lucide `icon` string key) and render through `skill-marquee.tsx` → `SkillHighlightCard.tsx` — a continuously-scrolling row of cards, each a `BorderRotate` (rotating conic-gradient border) wrapping an icon + `AnimatedGradientText` title + descriptor. The backdrop is the shared page-wide starfield (`StarsBackground` + `ShootingStars`), not a Spline scene. The orbit itself is driven **imperatively** — `OrbitingSkills` runs one `requestAnimationFrame` loop that writes each node's `transform` straight to the DOM (no per-frame React re-render), paused offscreen via `useInViewport` and on hover. The string→component icon indirection (in `SkillHighlightCard`) keeps the data file JSX-free, mirroring `orbiting-skills.tsx`. Each orbital node is a `<button>`: clicking opens a `SkillPopover` (`components/ui/SkillPopover.tsx`) — a click-to-reveal card anchored beside the node's frozen `(x, y)` (flips left for right-half nodes, vertically clamped inside the orbit container), showing the skill's category eyebrow + name + a one-line blurb. Blurbs live in a side map `skillBlurbs` in `content/data/skills.ts`, looked up case-insensitively via `getSkillBlurb` (mirroring `getIcon`); unmatched names degrade to name + category only. The popover owns its dismissal (Escape / × / outside-click via `lib/useOutsideClick.ts`) and animates via `motion` (collapsed to instant for reduced-motion).
- **Per-section scroll offset**: anchor jumps are tuned per section via `scroll-margin-top` in `globals.css`, driven by one `--heading-clear` knob (sections carry different top paddings, so a single global `scroll-padding-top` would land headings at uneven heights under the fixed nav). `Nav.tsx`'s `scrollToSection` drives the scroll explicitly (Next `<Link>` hash nav is a no-op when the hash already matches — the old "sometimes works" bug) and honors reduced-motion.
- **No persistent canvas, no smooth scroll, no scroll-linked animation.** The prior R3F terrain + GSAP/ScrollTrigger + Lenis stack was removed when the Spline hero swap landed. Native browser scroll only. The shared `PageStarfield` is a viewport-fixed `StarsBackground` — stars twinkle in place, no scroll or drift motion. (Both a scroll-coupled parallax and a time-based autonomous drift were tried and reverted: scroll-coupling judders because a main-thread canvas can't stay in sync with compositor-driven scroll, and the drift wasn't wanted. Keep the field static.)

## Working agreement (READ THIS)

1. **Do NOT run `git commit` autonomously.** This is captured in `~/.claude/projects/.../memory/feedback_no_autonomous_commits.md`. At each natural checkpoint: summarize what changed, propose a commit title + description for the user to use themselves. Surface staged files explicitly.
2. **Small, reviewable steps.** After each meaningful unit of work (scaffold, design tokens, first component, etc.), stop and summarize. Wait for "continue" before the next step.
3. **Flag any decision the plan didn't specify**: one line — `Decision: chose X because Y. Tell me if you want Z instead.`
4. **Flag dependencies > ~50 KB gzipped before installing.**
5. **TypeScript strict — non-negotiable.** No `any`, no `@ts-ignore` without a comment explaining why.
6. **Verify before declaring done.** `bun run type-check`, `bun run lint`, `bun run build`. Boot the dev server when you can; say so plainly when you can't fully verify.
7. **Don't silently descope or overrun.** If something is harder than the plan anticipated, stop and report it.
8. **Primary CTAs use `RippleButton` / `RippleLink`** (`components/ui/cta/RippleButton.tsx`, `components/ui/cta/RippleLink.tsx`, shared logic in `lib/useRipple.tsx`). New top-level CTAs — page-level buttons, hero/contact CTAs, MDX badge links, modal opens — should use these and pass `className` to preserve site styling. The ripple paints at `-z-10` so children don't need wrapping. Dense interactive surfaces (LA History tools at `components/laHistory/*`, viz toggles in `components/viz-*/`) intentionally keep native `<button>` for DOM-weight reasons — don't sweep those without checking.

## Constraints + gotchas

- **`Personal Data/`** in repo root is gitignored. Source PDFs, project code, headshot live there. Never commit anything from it. `scripts/optimize-images.mjs` reads from there, writes to `public/`.
- **`pdftoppm` is missing** in this environment, but `pdftotext` (poppler) is bundled with Git: `C:\Program Files\Git\mingw64\bin\pdftotext.exe`. Use that for extracting text from PDFs.
- **`bun` is invoked through `cmd.exe`** because the Bash tool's PATH doesn't include it directly. Pattern: `cmd.exe //c "bun run …"`. Same for `node` / `bunx`.
- **OG images at `app/**/opengraph-image.tsx`** must have `display: flex` on EVERY multi-child `<div>`. Next 16's satori-validator rejects without it.
- **OG with `generateStaticParams` cannot use `runtime: 'edge'`** under Next 16. We use build-time prerendering.
- **`next/dynamic({ ssr: false })` causes SSR subtree bailout in Next 16.** Use manual `lazy()` + `<Suspense>` inside a `'use client'` component instead. See `components/ui/three/SplineScene.tsx`.
- **`tsconfig.json` is auto-modified by Next 16** on first build (`jsx: preserve` → `react-jsx`; adds `.next/dev/types/**/*.ts` to includes). Don't fight it.
- **MDX plugins must be string references**, not function imports, in `next.config.mjs` under Turbopack. We dropped `remarkGfm` at the function-ref level; can re-add when needed via the new shape.
- **Tailwind v4 tree-shakes `@keyframes` defined inside `@theme`** — it only emits them when it can see the keyframe name in a generated utility, which it *can't* through `animate-[var(--x)]`. Keyframes referenced indirectly (or applied via a plain class) must live at **top level** in `globals.css`, not in `@theme` (see `glow-pulse` / `.cta-glow`). Adding a new `@theme` token mid-session can also need a dev-server restart to register.

## Commands

```bash
bun install                            # install deps
bun run dev                            # next dev (Turbopack)
bun run build                          # production build
bun run start                          # serve build
bun run lint                           # eslint . (flat config)
bun run type-check                     # tsc --noEmit
bun run analyze                        # ANALYZE=true next build
bun run scripts/optimize-images.mjs    # one-off image compression
```

## Phase status

| Phase | Status |
|-------|--------|
| Phase 1 — scaffold, sections, MDX pipeline, SEO basics, deploy | ✓ |
| Phase 2 — Lenis + ScrollTrigger + camera/terrain/atmosphere morph + PostFX + cursor parallax | ✓ |
| Phase 3 — 4 hero case studies + 3 supporting taglines; all routes live | ✓ |
| Phase 4 — Schema.org structured data + WCAG AA contrast fix + image opt + mobile menu | ✓ |
| Phase 5 — analytics/speed-insights, R3F v9 + React 19 upgrade, scene-actually-renders fix, embedded BiLSTM viz, InteractivityViz dashboard, native LA History port (Leaflet + Cytoscape + AI tutor), clickable supporting cards | ✓ |
| Phase 6 — replaced R3F terrain + GSAP/Lenis stack with a Spline hero scene + cursor Spotlight; pruned 9 unused deps; simplified DeviceDetector | ✓ |
| Phase 7 — visual overhaul: self-hosted full-bleed Spline hero + `BackgroundBeams`; `SpiralSplash` intro; `FloatingDock` nav; `AppleCardsCarousel` + `3DCard` projects (dropped FeaturedProject); `orbiting-skills` Skills; merged Education + Experience into a `Journey` timeline; `meteors`/`sparkles`/`StarfieldBackground` accents; Contact Spline greeting robot + single-row Footer | ✓ |
| Phase 8 — Skills overhaul: third self-hosted Spline backdrop (`skills.splinecode`) over a `gradient-dots` fallback; Coursework + Other moved to `skillHighlights` (`SkillCardGroup`) rendered as a `skill-marquee` of `SkillHighlightCard`s (`BorderRotate` + `AnimatedGradientText`); per-section `scroll-margin-top` system + `Nav` `scrollToSection` fix; `BackgroundBeams` recolored to white | ✓ |
| Phase 9 — Hero intro choreography (splash-gated `DiaTextReveal` name + `TextEffect` eyebrow/tagline + staggered CTA cascade + `ScrollHint`, driven by `splashDismissed`/`dismissSplash`); `ShinyButton` for *See work* + About's résumé link; pulsing white `.cta-glow` on *Get in touch*; Journey cards gain an animated masked gradient ring (`CardGradientRing`) + per-photo `zoom`/`objectPosition` crop controls (`MediaImage`) with real Occidental photos | ◧ working tree, not yet committed |
| Phase 10 — orbital skill nodes are now click-to-reveal: each is a `<button>` opening a `SkillPopover` (category + name + one-line blurb) anchored at the node's frozen `(x, y)`, with Escape / × / outside-click dismissal (`lib/useOutsideClick.ts`); blurbs in a `skillBlurbs` side map + `getSkillBlurb` helper in `content/data/skills.ts` | ◧ working tree, not yet committed |
| Phase 11 — performance pass: every always-on loop pauses offscreen via a shared `lib/useInViewport.ts` IntersectionObserver hook (`StarsBackground`, `ShootingStars`, `BackgroundBeams`, `OrbitingSkills`); `OrbitingSkills` rewritten to drive its orbit imperatively (ref-written transforms, zero per-frame React re-renders); `next.config.mjs` `optimizePackageImports` (motion / lucide / nivo); deleted unused 1.29 MB `hero.splinecode` + the dead `3DCard`/`CardShadcn`/`meteors` components; trimmed dead `useSceneStore` fields; gated the reduced-motion spiral splash so it no longer mounts the GSAP canvas | ◧ working tree, not yet committed |

## Known follow-ups (not blocking launch)

- **Custom domain** (currently `eduardorebollar.vercel.app`).
- **Recorded demo / screenshots** for LA History (no app screenshots exist; case study is text-driven).
- **Sweep over remaining mid-sized PNGs** (270–350 KB each in `public/projects/`) — would save ~150–200 KB.
- **`remark-gfm`** is installed but not wired into `next.config.mjs` — either re-add via the Turbopack string-ref form or drop the dep.
- **Bundle analyzer pass** — run `bun run analyze` to surface dep-side optimization opportunities (Cytoscape, Leaflet, and the Nivo bundle are the obvious heavy hitters; they're route-scoped, but worth a check).
- **`backdrop-blur-md` performance** — now respects `prefers-reduced-transparency: reduce` globally. If Speed Insights flags INP/CLS regressions on low-end Android specifically, consider a lite-mode/GPU-tier gate on top.
- **Journey timeline photos** — Education/Experience items support an optional `images?: MediaImage[]` (each with optional `zoom` / `objectPosition` crop controls). The Occidental College + Occidental ITS entries now carry real photos (`public/journey/*.jpg`); remaining entries still show a dashed placeholder until photos are added in `content/data/{education,experience}.ts`.

## When something feels off

- **The deployed page is blank or rendering wrong?** Check the served HTML for `BAILOUT_TO_CLIENT_SIDE_RENDERING` — Next 16 emits this when a server component contains `dynamic({ ssr: false })`. We had this bug once (`36fe738`); recurrence is the same fix pattern.
- **A new MDX file isn't appearing at `/work/<slug>`?** Register it in `lib/mdx.ts`'s `projectMDX` map — the build relies on explicit static imports, not filesystem scan.
- **OG image fails to build for a new slug?** Check `app/work/[slug]/opengraph-image.tsx` for any `<div>` with multiple children missing `display: flex`.
- **Spline backdrop doesn't appear on a `/work/[slug]` page?** It's the only Spline mount left (`SkillsBackdrop`). It only renders when `initialized && hasWebGL2 && !isMobile && !reducedMotion`; OS-level reduced-motion silently shows the `gradient-dots` fallback instead — toggle via DevTools Rendering → "Emulate prefers-reduced-motion: no-preference" to confirm. (The hero and Skills sections no longer use Spline at all.)
- **`/work` Spline backdrop reads charcoal grey, not black?** The scene bakes in a ~#121212 canvas background whose alpha can't be overridden from react-spline; `SkillsBackdrop` crushes it with a `[filter:contrast(1.6)]` on `<SplineScene />`. Bump the contrast if grey remains; ease it down if the particles start clipping.
- **A starfield / the skill orbit won't animate even with motion enabled?** Each loop is gated on `useInViewport` — it only runs while its element intersects the viewport. If a section is `display:none` or zero-height, the observer reports out-of-view and the loop stays paused by design.
- **A nav link only scrolls sometimes?** Next `<Link>` hash navigation is a no-op when the URL hash already matches the target. `Nav.tsx`'s `scrollToSection` drives the scroll explicitly to fix this — new nav links should route through it (or `scrollToBottom`/`scrollToWorkControls`), not bare `<Link href="#…">`.
