# Claude session handoff — Eduardo Rebollar's personal portfolio

This file is auto-loaded by Claude Code at the start of each session in this repo. Read it first.

## What this project is

A personal portfolio for Eduardo Rebollar — Computer Science & Economics student at Occidental College. Single-page site with an interactive Spline 3D scene anchored to the hero's right column (gated on capable, non-reduced-motion devices).

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
| 3D | `@splinetool/react-spline` 4 + `@splinetool/runtime` 1 | Lazy + Suspense in `components/ui/SplineScene.tsx`; mounted in `components/sections/Hero.tsx` right column; gated on `hasWebGL2 && !isMobile && !reducedMotion`. Replaced the prior R3F terrain stack (commit refreshing this file) |
| UI motion | `motion` 12 (rebranded framer-motion) | `MotionConfig reducedMotion="user"` auto-skips on OS preference. Used by Hero entrance + cursor `Spotlight` |
| State | Zustand 5 | `stores/useSceneStore.ts` — single global store; now mostly feeds the Hero's Spline gate via `DeviceDetector`. `gpuTier`/`activeSection`/`sectionProgress` fields are dead-after-R3F-removal (kept for now; safe follow-up to trim) |
| Content | TS data files + MDX case studies | `content/data/*.ts` + `content/projects/*.mdx` |
| Case-study viz | `@nivo/*` (bar/line/heatmap), `cytoscape` + `react-cytoscapejs`, `leaflet` + `react-leaflet` | Bundled lazily into the routes that use them (BiLSTM, Interactivity, LA History) |
| LA History AI | `ai` v6 + `@ai-sdk/react` v3 | Tutor + concept-map chat under `/work/la-history/play`; routes in `app/api/la-history/*` |
| Image opt | `sharp` (via Next 16) | Run-once compression in `scripts/optimize-images.mjs` |

## Folder map

```
app/                 Next.js App Router (routes, layouts, OG, sitemap, robots, icon)
mdx-components.tsx   Next.js convention — typography + MDX component map
components/
  sections/          One per page section (Hero, About, Education, Experience,
                       Skills, Projects, Contact). Hero hosts the Spline scene
  ui/                Container, Nav, Footer, Card, CardShadcn, Pill, Heading,
                       Eyebrow, ScrollHint, SplineScene, Spotlight
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
lib/                 cn, device, mdx, motion, seo
stores/              useSceneStore (Zustand) — feeds Hero's Spline gate
types/               content (Project, ExperienceItem, …)
public/              photo.jpg, projects/<slug>/*, OG, favicon
scripts/             optimize-images.mjs (one-off sharp pipeline)
Personal Data/       GITIGNORED — source PDFs, papers, project code, headshot
```

## Architecture in 30 seconds

- **Hero Spline scene**: `components/sections/Hero.tsx` is a 2-column grid on `md+`. Left = animated copy (Eyebrow / display name / tagline / CTA). Right = `<SplineScene />` (lazy + Suspense around `@splinetool/react-spline/next`) with `<Spotlight />` cursor overlay, inside a bordered/rounded container. Right column is hidden on `<md`.
- **Device gating**: `components/a11y/DeviceDetector.tsx` runs on mount inside `<Providers />`, detects WebGL2 + viewport + `prefers-reduced-motion`, and writes to `useSceneStore`. Hero reads `initialized && hasWebGL2 && !isMobile && !reducedMotion` — only when true does `<SplineScene />` mount and the heavy runtime loads.
- **No persistent canvas, no smooth scroll, no scroll-linked animation.** The prior R3F terrain + GSAP/ScrollTrigger + Lenis stack was removed when the Spline hero swap landed. Native browser scroll only.

## Working agreement (READ THIS)

1. **Do NOT run `git commit` autonomously.** This is captured in `~/.claude/projects/.../memory/feedback_no_autonomous_commits.md`. At each natural checkpoint: summarize what changed, propose a commit title + description for the user to use themselves. Surface staged files explicitly.
2. **Small, reviewable steps.** After each meaningful unit of work (scaffold, design tokens, first component, etc.), stop and summarize. Wait for "continue" before the next step.
3. **Flag any decision the plan didn't specify**: one line — `Decision: chose X because Y. Tell me if you want Z instead.`
4. **Flag dependencies > ~50 KB gzipped before installing.**
5. **TypeScript strict — non-negotiable.** No `any`, no `@ts-ignore` without a comment explaining why.
6. **Verify before declaring done.** `bun run type-check`, `bun run lint`, `bun run build`. Boot the dev server when you can; say so plainly when you can't fully verify.
7. **Don't silently descope or overrun.** If something is harder than the plan anticipated, stop and report it.

## Constraints + gotchas

- **`Personal Data/`** in repo root is gitignored. Source PDFs, project code, headshot live there. Never commit anything from it. `scripts/optimize-images.mjs` reads from there, writes to `public/`.
- **`pdftoppm` is missing** in this environment, but `pdftotext` (poppler) is bundled with Git: `C:\Program Files\Git\mingw64\bin\pdftotext.exe`. Use that for extracting text from PDFs.
- **`bun` is invoked through `cmd.exe`** because the Bash tool's PATH doesn't include it directly. Pattern: `cmd.exe //c "bun run …"`. Same for `node` / `bunx`.
- **OG images at `app/**/opengraph-image.tsx`** must have `display: flex` on EVERY multi-child `<div>`. Next 16's satori-validator rejects without it.
- **OG with `generateStaticParams` cannot use `runtime: 'edge'`** under Next 16. We use build-time prerendering.
- **`next/dynamic({ ssr: false })` causes SSR subtree bailout in Next 16.** Use manual `lazy()` + `<Suspense>` inside a `'use client'` component instead. See `components/ui/SplineScene.tsx`.
- **`tsconfig.json` is auto-modified by Next 16** on first build (`jsx: preserve` → `react-jsx`; adds `.next/dev/types/**/*.ts` to includes). Don't fight it.
- **MDX plugins must be string references**, not function imports, in `next.config.mjs` under Turbopack. We dropped `remarkGfm` at the function-ref level; can re-add when needed via the new shape.

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

## Known follow-ups (not blocking launch)

- **Custom domain** (currently `eduardorebollar.vercel.app`).
- **Recorded demo / screenshots** for LA History (no app screenshots exist; case study is text-driven).
- **Sweep over remaining mid-sized PNGs** (270–350 KB each in `public/projects/`) — would save ~150–200 KB.
- **`remark-gfm`** is installed but not wired into `next.config.mjs` — either re-add via the Turbopack string-ref form or drop the dep.
- **Bundle analyzer pass** — run `bun run analyze` to surface dep-side optimization opportunities (Cytoscape, Leaflet, and the Nivo bundle are the obvious heavy hitters; they're route-scoped, but worth a check).
- **`backdrop-blur-md` performance** — now respects `prefers-reduced-transparency: reduce` globally. If Speed Insights flags INP/CLS regressions on low-end Android specifically, consider a lite-mode/GPU-tier gate on top.
- **Spline scene URL is a placeholder** — `Hero.tsx` points at the Spline demo asset (`kZDDjO5HuC9GJUM2/scene.splinecode`). Author a scene matching the Deep Oceanic palette and swap the constant at the top of `Hero.tsx`.
- **Trim dead store fields** — `useSceneStore` still exposes `gpuTier`, `activeSection`, `sectionProgress`, `liteMode`, `toggleLiteMode` etc. after R3F removal; no consumer reads them. Safe to prune.

## When something feels off

- **The deployed page is blank or rendering wrong?** Check the served HTML for `BAILOUT_TO_CLIENT_SIDE_RENDERING` — Next 16 emits this when a server component contains `dynamic({ ssr: false })`. We had this bug once (`36fe738`); recurrence is the same fix pattern.
- **A new MDX file isn't appearing at `/work/<slug>`?** Register it in `lib/mdx.ts`'s `projectMDX` map — the build relies on explicit static imports, not filesystem scan.
- **OG image fails to build for a new slug?** Check `app/work/[slug]/opengraph-image.tsx` for any `<div>` with multiple children missing `display: flex`.
- **Spline scene doesn't appear in the hero?** Check the store flags in DevTools: it only mounts when `initialized && hasWebGL2 && !isMobile && !reducedMotion`. OS-level reduced-motion (which Eduardo has) silently hides it — toggle via DevTools Rendering → "Emulate prefers-reduced-motion: no-preference" to confirm.
