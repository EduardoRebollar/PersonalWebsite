# eduardorebollar

Personal portfolio for Eduardo Rebollar — Computer Science & Economics @ Occidental College.

A single-page atmospheric portfolio with a morphing topographic-terrain 3D world, built with Next.js 16, React 18, Three.js (via `@react-three/fiber`), Tailwind v4, and TypeScript strict mode.

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
  layout.tsx          Root layout: fonts, providers, persistent canvas mount, Nav, Footer
  page.tsx            Main page composing all 7 sections
  providers.tsx       Client boundary — MotionConfig + DeviceDetector
  globals.css         Tailwind v4 + @theme tokens + base type
  sitemap.ts, robots.ts, opengraph-image.tsx, icon.tsx
  work/[slug]/        Project case-study route (MDX-rendered) + per-route OG
mdx-components.tsx    Next.js convention — MDX element + component map
components/
  scene/              All R3F: World, Terrain (FBM shader), Atmosphere, CameraRig, SceneMount
  sections/           One file per page section (Hero, About, Education, Experience, Skills, Projects, Contact)
  ui/                 Container, Nav, Footer, Card, Pill, Heading, Eyebrow, ScrollHint
  a11y/               DeviceDetector, LiteModeToggle, SkipToContent
  mdx/                MDX components (Figure, Aside, TechStack)
content/
  data/               Typed TS content (site, projects, experience, education, skills)
  projects/           MDX case studies (slug-by-slug, registered in lib/mdx.ts)
lib/                  cn.ts, device.ts, mdx.ts, motion.ts
stores/               Zustand: useSceneStore
types/                Shared TypeScript types
public/               Static assets (photo.jpg, resume.pdf, …)
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
