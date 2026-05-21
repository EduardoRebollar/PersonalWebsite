# eduardorebollar

Personal portfolio for Eduardo Rebollar — Computer Science & Economics @ Occidental College.

A single-page atmospheric portfolio that opens with a full-bleed `SpiralSplash` intro, then reveals an interactive Spline 3D scene rendered full-bleed behind the hero (gated on capable, non-reduced-motion devices). Built with Next.js 16 (App Router, Turbopack), React 19, Spline, Tailwind v4 (CSS-first), and TypeScript strict mode.

**Live:** [eduardorebollar.vercel.app](https://eduardorebollar.vercel.app/)

## Prerequisites

- **Node.js 20+** (see [.nvmrc](./.nvmrc))
- **Bun 1.3+** as the package manager and script runner ([install](https://bun.sh/docs/installation))

## Local development

```bash
bun install        # install dependencies
bun run dev        # start dev server at http://localhost:3000
bun run build      # production build (Next 16 / Turbopack)
bun run start      # serve production build locally
bun run lint       # eslint via flat config + eslint-config-next@16
bun run type-check # tsc --noEmit (strict TypeScript)
bun run analyze    # bundle-size analysis report (ANALYZE=true build)
```

## Folder map

```
app/                  Next.js App Router
  layout.tsx          Root layout: fonts, providers, Nav, Footer
  page.tsx            Main page composing the sections
  providers.tsx       Client boundary — MotionConfig + DeviceDetector
  globals.css         Tailwind v4 + @theme tokens + keyframes + base type
  sitemap.ts, robots.ts, opengraph-image.tsx, icon.tsx
  work/[slug]/        Project case-study route (MDX-rendered) + per-route OG
  api/la-history/     LA History tutor + concept-map chat (AI SDK)
mdx-components.tsx    Next.js convention — MDX element + component map
components/
  sections/           One file per page section: Hero, About, Journey, Skills,
                        Projects, Contact (Education + Experience merged into Journey)
  ui/                 Layout/typography (Container, Nav, Footer, Card, Pill, Heading…),
                        CTAs (RippleButton, RippleLink), 3D/cursor (SplineScene, Spotlight),
                        nav chrome (FloatingDock), Journey timeline, Projects carousel,
                        Skills (orbiting-skills, skill-marquee, SkillHighlightCard),
                        intro/backgrounds (SpiralSplash, BackgroundBeams, meteors,
                        sparkles, StarfieldBackground, gradient-dots)
  a11y/               DeviceDetector, SkipToContent
  mdx/                MDX components (Figure, Aside, TechStack, Lessons, RepoLink, DemoLink)
  viz-bilstm/         BiLSTM case-study charts (Nivo)
  viz-interactivity/  Interactivity dashboard (Nivo + SVG)
  laHistory/          Native LA History port (Leaflet map, Cytoscape concept map, AI chat)
  seo/                JsonLd
content/
  data/               Typed TS content (site, projects, experience, education, skills)
  projects/           MDX case studies (slug-by-slug, registered in lib/mdx.ts)
lib/                  cn.ts, device.ts, mdx.ts, motion.ts, seo.ts, useRipple.tsx
stores/               Zustand: useSceneStore (feeds the Spline device gate)
types/                Shared TypeScript types
public/               Static assets (photo.jpg, projects/<slug>/*, spline/*.splinecode, OG)
scripts/              optimize-images.mjs (one-off sharp image pipeline)
```

## Architecture in 30 seconds

- **Intro splash:** `SpiralSplash` overlays a full-bleed animation on first load, then fades out to reveal the page.
- **Spline scenes, not a persistent canvas.** The hero and Contact greeting robot each mount a self-hosted `*.splinecode` scene (served from Vercel's edge) full-bleed behind the section. Skills uses a third self-hosted scene as its backdrop. The prior R3F terrain + GSAP/ScrollTrigger + Lenis stack was removed — this is native browser scroll only.
- **Device gating:** `components/a11y/DeviceDetector.tsx` detects WebGL2 + viewport + `prefers-reduced-motion` on mount and writes to `useSceneStore`. The heavy Spline runtime only loads when `initialized && hasWebGL2 && !isMobile && !reducedMotion`; everyone else gets a lightweight static fallback.
- **Content is hybrid:** structured data (experience, education, skills, project metadata) in typed TS files; project case studies are MDX in `content/projects/`, registered in `lib/mdx.ts`.

## Deploy

Push to `main`. Vercel rebuilds and deploys to `eduardorebollar.vercel.app` automatically (linked via the Vercel dashboard → GitHub).

The LA History AI tutor under `/work/la-history/play` requires an AI provider key in the Vercel environment; the rest of the site needs no environment variables.
