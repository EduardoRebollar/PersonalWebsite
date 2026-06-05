# Handoff: Hero — Orbital

## Overview
A full-viewport hero section for Eduardo Rebollar's personal website. Four field nodes (Economics, Machine Learning, Data, The Web) orbit a centered name on elliptical paths. Each node has a unique shape, a gradient spoke radiating from the name to the planet, and an upright floating label outside its orbit radius.

## About the Design Files
The files in this bundle are **HTML design references** — high-fidelity prototypes showing intended look, layout, and animation behavior. They are not production code to ship directly. Your task is to **recreate this design in your target codebase** (React, Next.js, etc.) using its established patterns, component library, and framework conventions.

The animation engine in these files uses plain JS + `requestAnimationFrame` and direct DOM manipulation. In a React codebase this should be rewritten using `useEffect` + `useRef` (or a motion library like Framer Motion / GSAP).

## Fidelity
**High-fidelity.** Pixel-perfect mockup with final colors, typography, spacing, and interactions. Recreate the UI precisely using the codebase's design system.

---

## Canvas & Layout

| Property | Value |
|---|---|
| Frame size | 1440 × 860 px |
| Canvas center (origin for orbits) | (720, 430) |
| Background | `radial-gradient(120% 120% at 50% 44%, #0b0d1c 0%, #000 66%)` |
| Content z-layering | SVG (z:0) → planets/labels (z:1) → vignette (z:2) → content (z:4) |

---

## Orbit Configuration

Each planet travels an elliptical path: `x = CX + rx·cos(t)`, `y = CY + ry·sin(t)` where `t` advances at `(2π / dur) * dir` radians per second, offset by `phase` degrees at t=0.

| Field | rx | ry | sz (body radius px) | period (s) | direction | start phase° | color role | node shape |
|---|---|---|---|---|---|---|---|---|
| Economics | 430 | 265 | 4 (8px dia) | 16 | CW (+1) | 305 | secondary (teal) | crosshair |
| Machine Learning | 490 | 298 | 7 (14px dia) | 30 | CCW (−1) | 25 | accent (indigo) | double ring |
| Data | 545 | 328 | 5 (10px dia) | 21 | CW (+1) | 150 | accent (indigo) | diamond |
| The Web | 600 | 356 | 3 (6px dia) | 38 | CCW (−1) | 235 | accent (indigo) | dot |

**Label offset:** each label is positioned radially outward from its planet body by `(sz × 2) + 26` px.

---

## Node Shape Details

### Crosshair (Economics)
Two 1px lines (20px long) forming a `+`, centered on the planet anchor. Color: `color-mix(in oklab, var(--secondary) 65%, transparent)`.

### Double Ring (Machine Learning)
A 30×30px unfilled circle centered on the planet, `border: 1px solid` accent at 38% opacity, rotating 360° over 12s.

### Diamond (Data)
The planet body (`border-radius: 2px`) rotated 45°. Looks like a square tilted on its corner.

### Dot (The Web)
Default filled circle, no extras.

---

## Gradient Spokes

Each spoke is an SVG `<line>` from `(CX, CY)` to the planet's current position, stroked with a `<linearGradient>` (gradientUnits="userSpaceOnUse"):
- **Stop 0% (center):** `stopOpacity: 0`
- **Stop 70%:** `stopOpacity: 0.28`
- **Stop 100% (planet):** `stopOpacity: 0.55`
- Color: `var(--accent)` for accent nodes, `var(--secondary)` for Economics

Both the gradient's `x2/y2` and the line's `x2/y2` must be updated every frame to track the planet.

---

## Planet Body

```css
width: sz * 2px;
height: sz * 2px;
border-radius: 999px;
background: var(--accent);  /* or --secondary for Economics */
box-shadow: 0 0 (sz * 2.8px) color-mix(in oklab, var(--accent) 80%, transparent);

/* breathing halo (::after) */
inset: sz * -1.8px;
border-radius: 999px;
opacity: 0.13;
animation: breathe 4.6s ease-in-out infinite;
/* breathe: scale(1)→scale(1.5), opacity 0.13→0.05 */
```

Each planet has a staggered `animation-delay`: `0s / 1.4s / 2.8s / 0.7s`.

---

## Center Vignette

Radial gradient overlay that fades planets passing through the center area:
```css
background: radial-gradient(36% 38% at 50% 50%,
  #000 30%,
  color-mix(in oklab, #000 48%, transparent) 62%,
  transparent 82%);
```

---

## Centered Content

All content is absolutely centered (`display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center`).

| Element | Spec |
|---|---|
| Eyebrow | Font: JetBrains Mono, 13px, 0.22em tracking, uppercase, muted white, indigo dot prefix |
| Name "Eduardo" / "Rebollar" | Instrument Serif, 400, 150px, line-height 0.9, −0.02em tracking, margin-top 22px |
| Tagline | Geist, 300, 22px, line-height 1.5, muted white (`#ccc`); "Four" and "One" in `var(--accent)` (#818cf8) |
| CTAs margin-top | 40px |
| Scroll cue | Bottom-left, `left: 64px; bottom: 40px`, JetBrains Mono 11px, animated bar |

---

## CTAs

**See Work (primary):**
```css
background: var(--accent);  /* #818cf8 */
color: #0a0a12;
padding: 16px 30px;
border-radius: 999px;
font: JetBrains Mono 500 13px, 0.16em tracking, uppercase
hover: box-shadow: 0 0 34px -4px var(--accent); translateY(-2px)
```

**Get in Touch (ghost):**
```css
padding: 14px 28px;
border-radius: 999px;
border: 1px solid color-mix(in oklab, #545454 65%, transparent);
color: #cccccc;
hover: border-color changes to accent-tinted, box-shadow: 0 0 18px -4px var(--accent); translateY(-2px)
```

---

## Design Tokens

| Token | Value |
|---|---|
| `--base` | `#000000` |
| `--fg` | `#ffffff` |
| `--fg-mute` | `#cccccc` |
| `--surface` | `#11151c` |
| `--hairline` | `#545454` |
| `--accent` | `#818cf8` (indigo) |
| `--secondary` | `#2dd4bf` (teal) |
| `--warn` | `#fcd34d` (yellow) |
| `--font-sans` | `'Geist', ui-sans-serif` |
| `--font-display` | `'Instrument Serif', ui-serif` |
| `--font-mono` | `'JetBrains Mono', ui-monospace` |

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap
```

---

## Navigation (`.h-nav`)

Top bar, height 96px, `padding: 0 64px`, flex space-between.
- **Logo "ER":** Instrument Serif 34px
- **Dock:** 5 circular icon buttons (48×48px, border-radius 999px). "Work" tab active (indigo border + glow).

---

## Starfield

70 deterministic dust particles (seeded PRNG, same seed each render):
```
x: random * 1440, y: random * 860
r: 0.5–2px, opacity: 0.1–0.55
fill: #fff
```
Use a seeded random to keep positions stable between renders (seed: `s = (s * 9301 + 49297) % 233280` starting at 21).

---

## Animation Implementation Notes

The animation loop runs at 60fps via `requestAnimationFrame`. Key points for React:

```tsx
useEffect(() => {
  let raf: number;
  const start = performance.now();

  const tick = (now: number) => {
    const elapsed = (now - start) / 1000;
    orbits.forEach((o, i) => {
      const t = (o.phase / 360) * TAU + (elapsed / o.dur) * TAU * o.dir;
      const px = o.rx * Math.cos(t);
      const py = o.ry * Math.sin(t);
      // update planet DOM ref position
      // update label DOM ref position (px + nx*pad, py + ny*pad)
      // update SVG spoke x2/y2
      // update SVG gradient x2/y2
    });
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, []);
```

Use `useRef` arrays for planet divs, label divs, SVG spoke lines, and SVG gradient elements. Set `left`/`top` directly on the DOM nodes (not via React state) to avoid re-renders.

---

## Accessibility

- Wrap the animated SVG in `aria-hidden="true"` — it's purely decorative
- Respect `prefers-reduced-motion`: disable the breathing halo animation at minimum; optionally pause the orbital animation
- All CTA buttons need accessible labels

---

## Screenshots

Two frames showing planets at different orbital positions — note the tapered gradient spokes, node shape variety (diamond, double-ring, crosshair, dot), and upright labels.

| Frame | Description |
|---|---|
| `01-screenshot-01.png` | Economics (teal) near top, Data (diamond) right, Machine Learning (double-ring) left |
| `02-screenshot-01.png` | All four spread across the lower half, spokes clearly visible |

---

## Files in This Bundle

| File | Purpose |
|---|---|
| `Hero — Orbital.html` | Full self-contained prototype (open in browser to preview) |
| `hero-orbital.jsx` | React component source (Babel JSX) |
| `hero-orbital.css` | Component-scoped styles |
| `hero.css` | Shared design tokens + nav + CTA base styles |
| `hero-shared.jsx` | Shared React components: `HeroNav`, `Eyebrow`, `CTAs`, `ScrollCue` |
