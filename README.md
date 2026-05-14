# eduardorebollar

Personal portfolio for Eduardo Rebollar — Computer Science & Economics @ Occidental College.

A single-page atmospheric portfolio with a morphing topographic-terrain 3D world, built with Next.js 15, React 18, Three.js (via react-three-fiber), Tailwind v4, and TypeScript strict mode.

## Prerequisites

- **Node.js 20+** (see [.nvmrc](./.nvmrc))
- **Bun 1.1+** as the package manager and script runner ([install bun](https://bun.sh/docs/installation))

## Local development

```bash
bun install        # install dependencies
bun run dev        # start dev server at http://localhost:3000
bun run build      # production build
bun run start      # serve production build locally
bun run lint       # eslint (next/core-web-vitals + next/typescript)
bun run type-check # tsc --noEmit (strict TypeScript)
bun run analyze    # bundle-size analysis report
```

## Folder map

```
app/                  Next.js App Router — routes, layouts, route-level OG / sitemap / robots
  layout.tsx          Root layout: fonts, providers, persistent canvas mount, Nav, Footer
  page.tsx            Main page composing all 7 sections
  globals.css         Tailwind v4 + @theme tokens + base type
  work/[slug]/        Project case-study route (MDX-rendered)
components/
  scene/              All react-three-fiber: World, Terrain (FBM shader), Atmosphere, CameraRig
  sections/           One file per page section (Hero, About, Education, Experience, Skills, Projects, Contact)
  ui/                 Primitives: Nav, Footer, Card, Pill, Heading, Eyebrow, etc.
  a11y/               ReducedMotionProvider, LiteModeToggle, SkipToContent
  mdx/                MDX component map (Figure, Aside, TechStack, …)
content/
  data/               Typed TS source-of-truth content (site, projects, experience, education, skills)
  projects/           MDX case studies per project
lib/                  device.ts, mdx.ts, seo.ts, motion.ts, cn.ts
stores/               Zustand: useSceneStore
types/                Shared TypeScript types
public/               Static assets (photo, resume, favicon, OG)
```

## Architecture in 30 seconds

- **One persistent canvas** mounted at the layout root behind all content; sections don't unmount, only the camera/terrain parameters change as you scroll.
- **State** lives in `stores/useSceneStore.ts` (Zustand). Both DOM and the 3D canvas subscribe.
- **Lite mode** auto-engages on mobile, devices without WebGL2, or when `prefers-reduced-motion` is set. Replaces the canvas with CSS gradients + noise. Manually toggleable in nav.
- **Content** is hybrid: structured data (experience, education, skills, project metadata) in typed TS files; project case studies are MDX in `content/projects/`.

## Deploy

Push to `main`. Vercel rebuilds and deploys to `eduardorebollar.vercel.app` automatically (linked via the Vercel dashboard → GitHub).

No environment variables required for Phase 1.

## Plan

The full implementation plan lives at `~/.claude/plans/i-want-to-build-lexical-sketch.md` (outside the repo).
