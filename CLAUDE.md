# Claude session handoff — Eduardo Rebollar's personal portfolio

This file is auto-loaded by Claude Code at the start of each session in this repo. Read it first.

## What this project is

A personal portfolio for Eduardo Rebollar — Computer Science & Economics student at Occidental College. Single-page atmospheric site with a morphing topographic-terrain 3D world behind the content.

- **Deployed**: `https://eduardorebollar.vercel.app/`
- **Repo**: `https://github.com/EduardoRebollar` (push to `main` → Vercel auto-deploys)
- **Original implementation plan**: `~/.claude/plans/i-want-to-build-lexical-sketch.md` (outside this repo)

## Stack — locked in

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16 (App Router, Turbopack) | Migrated from 15 mid-build; supporting `@next/*` packages all bumped to ^16.2.6 |
| Runtime / pkg mgr | bun 1.3+ | Installed via `npm install -g bun`. Vercel auto-detects the `bun.lock` |
| React | 18.3 (NOT 19) | Stable; would need a coordinated R3F bump to move |
| Styling | Tailwind v4 (CSS-first) | `@theme` in `app/globals.css`; **no `tailwind.config.ts`** |
| 3D | three.js 0.171, R3F v8, drei v9 | R3F v9 / drei v10 are out but we stay on v8 for stability |
| Smooth scroll | Lenis 1.3 | Runs on GSAP's ticker; auto-disabled under reduced motion / lite mode |
| Scroll animation | GSAP 3 + ScrollTrigger | Drives the camera/terrain morph; per-section `top top → bottom top` |
| UI motion | `motion` 12 (rebranded framer-motion) | `MotionConfig reducedMotion="user"` auto-skips on OS preference |
| Post-FX | `@react-three/postprocessing` v2 + `postprocessing` 6 | v2 for R3F v8 compat |
| State | Zustand 5 | `stores/useSceneStore.ts` is the only global store |
| GPU/device detect | detect-gpu 5 | Runs in DeviceDetector on mount |
| Content | TS data files + MDX case studies | `content/data/*.ts` + `content/projects/*.mdx` |
| Image opt | `sharp` (via Next 16) | Run-once compression in `scripts/optimize-images.mjs` |

## Folder map

```
app/                 Next.js App Router (routes, layouts, OG, sitemap, robots, icon)
mdx-components.tsx   Next.js convention — typography + MDX component map
components/
  scene/             All R3F: World, Terrain, Atmosphere, CameraRig, ScrollDriver,
                       SmoothScroll, PostFX, SceneMount, sectionStates, shaders
  sections/          One per page section (Hero, About, Education, Experience,
                       Skills, Projects, Contact)
  ui/                Container, Nav, Footer, Card, Pill, Heading, Eyebrow, ScrollHint
  a11y/              DeviceDetector, LiteModeToggle, SkipToContent
  mdx/               Figure, Aside, TechStack
  seo/               JsonLd
content/
  data/              site, projects, experience, education, skills (typed TS)
  projects/          MDX case studies — registered in lib/mdx.ts
lib/                 cn, device, mdx, motion, seo
stores/              useSceneStore (Zustand)
types/               content (Project, ExperienceItem, …)
public/              photo.jpg, projects/<slug>/*, OG, favicon
scripts/             optimize-images.mjs (one-off sharp pipeline)
Personal Data/       GITIGNORED — source PDFs, papers, project code, headshot
```

## Architecture in 30 seconds

- **Persistent canvas**: One R3F `<Canvas>` mounted via `SceneMount.tsx` (manual `useEffect`-import — `next/dynamic({ ssr: false })` triggers a `BAILOUT_TO_CLIENT_SIDE_RENDERING` in Next 16, see commit `36fe738`). Fixed-position, z-0, pointer-events-none, behind all DOM.
- **Scroll → state**: `ScrollDriver` installs one GSAP `ScrollTrigger` per DOM section id, writes `activeSection` + `sectionProgress` to `useSceneStore`.
- **State → scene**: `CameraRig`, `Terrain`, `Atmosphere` each read those values and damp-lerp their respective targets each frame.
- **Lite mode**: Auto-engages when no WebGL2, mobile viewport (<768px), GPU tier ≤ 1, or `prefers-reduced-motion`. Canvas doesn't mount at all in lite mode. Manually toggleable in nav.

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
- **`react-hooks/immutability` rule is off for `components/scene/**`** — R3F's `useFrame` legitimately mutates `camera` / `mesh` / `uniforms` refs each frame.
- **OG images at `app/**/opengraph-image.tsx`** must have `display: flex` on EVERY multi-child `<div>`. Next 16's satori-validator rejects without it.
- **OG with `generateStaticParams` cannot use `runtime: 'edge'`** under Next 16. We use build-time prerendering.
- **`next/dynamic({ ssr: false })` causes SSR subtree bailout in Next 16.** Use manual `useEffect`-import instead. See `SceneMount.tsx`.
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

## Phase status (as of last session — Phase 4 polish complete)

| Phase | Status |
|-------|--------|
| Phase 1 — scaffold, sections, MDX pipeline, SEO basics, deploy | ✓ |
| Phase 2 — Lenis + ScrollTrigger + camera/terrain/atmosphere morph + PostFX + cursor parallax | ✓ |
| Phase 3 — 4 hero case studies + 3 supporting taglines; all routes live | ✓ |
| Phase 4 — Schema.org structured data + WCAG AA contrast fix + image opt + mobile menu | ✓ |

## Known follow-ups (not blocking launch)

- **`/resume.pdf`** is referenced from `site.resumeHref` but file doesn't exist yet — link 404s.
- **Custom domain** (currently `eduardorebollar.vercel.app`).
- **Recorded demo / screenshots** for LA History (no app screenshots exist; case study is text-driven).
- **Sweep over remaining mid-sized PNGs** (270–350 KB each in projects/) — would save ~150–200 KB.
- **Bundle analyzer pass** — run `bun run analyze` to surface dep-side optimization opportunities.
- **`backdrop-blur-md` performance** — now respects `prefers-reduced-transparency: reduce` globally. If Speed Insights flags INP/CLS regressions on low-end Android specifically, consider a lite-mode/GPU-tier gate on top.

## When something feels off

- **The deployed page is blank or rendering wrong?** Check the served HTML for `BAILOUT_TO_CLIENT_SIDE_RENDERING` — Next 16 emits this when a server component contains `dynamic({ ssr: false })`. We had this bug once (`36fe738`); recurrence is the same fix pattern.
- **A new MDX file isn't appearing at `/work/<slug>`?** Register it in `lib/mdx.ts`'s `projectMDX` map — the build relies on explicit static imports, not filesystem scan.
- **OG image fails to build for a new slug?** Check `app/work/[slug]/opengraph-image.tsx` for any `<div>` with multiple children missing `display: flex`.
- **Lint errors in scene code?** The `react-hooks/immutability` rule is off for `components/scene/**` only — if you're seeing it elsewhere, the mutation pattern is probably wrong (move to a `ref`).
