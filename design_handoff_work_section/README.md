# Handoff: Work / "Selected Work" Section

## Overview
A redesign of the **Work section** of a personal portfolio site. It presents 7 builds
(4 case studies + 3 projects) as a **featured-panel + filterable-index** layout: a large
featured card on the left shows the currently-selected build (screenshot, title, blurb,
highlights, tech stack, links); a numbered index on the right lets the visitor hover, click,
filter, and keyboard-navigate between builds. Dark, editorial, "starfield" aesthetic that
matches the rest of the site (Hero / About / Skills / Contact sections share these tokens).

This is **Direction B1**, chosen from a larger exploration.

## About the Design Files
The files in this bundle are **design references created in HTML/React-via-Babel** — a
working prototype showing the intended look and behavior. They are **not** meant to be shipped
as-is. The task is to **recreate this design in the target codebase's existing environment**
(the portfolio appears to be a Flask/Python site per other projects — implement as server-rendered
templates + a small JS island, or as a React/Vue component if the site already uses one). Use the
codebase's established patterns, fonts, and build pipeline. If no front-end environment exists yet,
pick the most appropriate one for a static-ish portfolio (e.g. plain HTML + a small vanilla-JS
controller, or Astro/React) and implement there.

The prototype loads React 18 + Babel from a CDN purely for prototyping convenience — **do not** copy
that pattern into production; use the codebase's normal component/build system.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, and interactions are final and exact.
Recreate the UI pixel-for-pixel using the codebase's libraries. The only placeholder is the
**screenshot area** (it uses a drag-and-drop `<image-slot>` web component in the prototype) — in
production this should be a normal `<img>` per project, populated from real project screenshots.

## Screens / Views
There is **one** view — the Work section — with a single dynamic "featured" region driven by selection.

### Work Section
- **Purpose**: Browse the portfolio's case studies and projects; select one to see its details and links.
- **Layout**:
  - Full-bleed dark section. Inner content capped at **max-width 1320px**, centered.
  - Section padding: `clamp(28px, 5vw, 64px)` top, `clamp(20px, 5vw, 72px)` sides, `clamp(48px, 6vw, 80px)` bottom.
  - **Top nav row** (`flex`, space-between): wordmark "ER" on the left; a dock of 5 circular icon buttons on the right (about / journey / skills / **work (active)** / contact).
  - **Header row** (`flex`, align-items flex-end, space-between, wraps): left = eyebrow + big serif title; right = kicker "CASE STUDIES & PROJECTS". Margin `clamp(36px,5vw,60px)` top / `clamp(24px,3vw,34px)` bottom.
  - **Main grid**: `grid-template-columns: 1.32fr 1fr; gap: clamp(24px,3vw,40px); align-items: stretch`. Left = featured panel, right = index.
- **Components**:

  **1. Eyebrow** — `• SELECTED WORK · 2023—2026`
  - JetBrains Mono, 12px, letter-spacing 0.22em, uppercase, color `#cccccc`.
  - Leading dot: 6px circle, `var(--accent)` (#818cf8), `box-shadow: 0 0 8px` accent.

  **2. Title** — "Selected *work*"
  - Instrument Serif, weight 400, `font-size: clamp(40px,6vw,72px)`, line-height 1.0, letter-spacing -0.01em, color `#fff`.
  - The word "work" is italic and colored `var(--accent)`.
  - `white-space: nowrap` on desktop; wraps under 980px.

  **3. Kicker (top-right)** — "CASE STUDIES & PROJECTS"
  - JetBrains Mono, 12px, letter-spacing 0.18em, uppercase, color `#8b8b8b`.

  **4. Featured panel** (left) — a bordered card, `border: 1px solid rgba(255,255,255,0.10)`, `border-radius: 20px`, background `linear-gradient(180deg, <tint>, #070809 80%)`. The tint is derived from the selected project's hue (see Design Tokens → per-project accents). `flex column`, fills grid cell height.
  - **Screenshot area**: height `clamp(190px,22vw,256px)`, bottom border `1px solid rgba(255,255,255,0.10)`. In production = a project screenshot `<img>` with `object-fit: cover`. Empty/placeholder state shows a "Drop a screenshot" prompt (prototype only).
    - **"FIG · NN" tag** pinned top-left (16px/14px inset): JetBrains Mono 10.5px, uppercase, letter-spacing 0.16em, color `#8b8b8b`, `border: 1px solid rgba(255,255,255,0.10)`, `border-radius: 999px`, padding 4px 10px, bg `rgba(0,0,0,0.4)`.
  - **Body**: padding `clamp(22px,2.4vw,30px) clamp(24px,2.6vw,34px) clamp(24px,2.6vw,32px)`, `flex column`, gap 18px.
    - **Top row** (`flex`, space-between, wraps): tier badge + meta line.
      - **Tier badge**: pill, text = `CASE STUDY` or `PROJECT`. JetBrains Mono 11px, letter-spacing 0.2em, uppercase. Color = the project accent. `border: 1px solid` accent@40%, `border-radius: 999px`, padding 6px 13px. Leading 6px dot in accent with glow.
      - **Meta line**: `<YEAR> · <ROLE>` — JetBrains Mono 12.5px, uppercase, letter-spacing 0.1em, color `#cccccc`; the year is bold and accent-colored.
    - **Swap group** (re-animates on selection change — `translateY(12px)→0` over .42s `cubic-bezier(.2,.7,.3,1)`; transform-only so content is never hidden): title, blurb, highlights.
      - **Title**: Instrument Serif, `font-size: clamp(32px,3.4vw,46px)`, line-height 1.0, letter-spacing -0.015em, color `#fff`, margin 0.
      - **Blurb**: Geist, `font-size: clamp(15.5px,1.3vw,17.5px)`, line-height 1.55, color `#fff`, max-width 44ch.
      - **Highlights**: unstyled `ul`, gap 9px. Each `li`: `flex`, gap 11px, Geist 14.5px, color `#cccccc`. Leading checkmark SVG (14px, accent-colored, stroke-width 1.8).
    - **Footer** (`margin-top:auto`, padding-top 22px, top border `1px solid rgba(255,255,255,0.10)`, `flex` space-between, wraps): tech-tag row + CTA cluster.
      - **Tech tags**: `flex wrap`, gap 7px. Each tag: JetBrains Mono 11px, letter-spacing 0.10em, uppercase, color `#cccccc`, `border: 1px solid rgba(255,255,255,0.10)`, `border-radius: 999px`, padding 4px 10px.
      - **CTA cluster** (`flex`, gap 14px):
        - **Primary CTA**: pill, text `Read case study` (case studies) / `View project` (projects) + arrow icon. JetBrains Mono 12px, letter-spacing 0.1em, uppercase, color `#07080b`, background = project accent, `border-radius: 999px`, padding 13px 20px. Hover: `translateY(-2px)` + `box-shadow: 0 14px 32px -14px` accent.
        - **Icon links**: 42px circular buttons, `border: 1px solid #545454`, color `#cccccc`. One per available link (repo / live / paper). Open in a new tab. Hover: color `#fff`, border `#cccccc`, `translateY(-2px)`.

  **5. Index** (right) — `flex column`.
  - **Label** "INDEX": JetBrains Mono 11px, letter-spacing 0.22em, uppercase, color `#8b8b8b`. Margin-bottom 16px.
  - **Filter pills** (`flex wrap`, gap 8px): `All`, `Case Studies`, `Projects`, `2026`, `2025`. JetBrains Mono 11.5px, letter-spacing 0.1em, uppercase. Inactive: color `#cccccc`, `border: 1px solid rgba(255,255,255,0.10)`, transparent bg, padding 8px 14px, radius 999px. Active: color `#07080b`, background `#fff`, border `#fff`. Hover (inactive): color `#fff`, border `#545454`.
  - **List** (`flex column`, margin-top 14px). Each **item** is a button: `grid-template-columns: 30px 1fr auto`, align center, gap 14px, padding 15px 14px, radius 12px, `border: 1px solid transparent`. 2px margin between items.
    - Columns: [number] [name + sub] [year + dot].
    - **Number**: JetBrains Mono 12px, color `#8b8b8b` (→ accent when selected).
    - **Name**: Instrument Serif, `font-size: clamp(20px,1.7vw,23px)`, line-height 1.08, color `#fff`.
    - **Sub**: JetBrains Mono 10.5px, letter-spacing 0.1em, uppercase, color `#8b8b8b`, margin-top 3px. (= `CASE STUDY` / `PROJECT`)
    - **Year**: JetBrains Mono 11.5px, color `#8b8b8b`.
    - **Dot**: 7px circle in project accent + glow; opacity 0 normally, 1 when selected.
    - **Hover**: background `rgba(255,255,255,0.03)`.
    - **Selected** (`.sel`): background = project-accent tint (`oklch(0.17 0.045 <hue>)`), `border-color` = accent@38%.
  - **Footer** (margin-top 16px, padding-top 16px, top border, `flex` space-between):
    - **Count**: `NN / NN` (current index / total in current filter), JetBrains Mono 12px, color `#8b8b8b`.
    - **Nav cluster**: a faint `↑ ↓ to browse` hint (JetBrains Mono 10.5px, opacity .55; `kbd` chips have a 1px soft border) + two 40px circular prev/next buttons (same styling as the icon-link buttons).

## Interactions & Behavior
- **Hover an index item** → it becomes the selected/featured build (preview-on-hover).
- **Click an index item** → locks selection to it.
- **Featured panel swaps** on selection change with a `translateY(12px)→0` / .42s / `cubic-bezier(.2,.7,.3,1)` entrance on the title/blurb/highlights group. Transform-only (never animate opacity from 0 — keeps content visible for print/reduced-motion).
- **Filter pills** narrow the list to All / Case Studies / Projects / 2026 / 2025. If the current selection falls outside the new filter, selection moves to the first item of the filtered list.
- **Prev / Next buttons** and **Arrow keys** (↑/← previous, ↓/→ next) step through the *currently filtered* list, wrapping around. The list is focusable (`tabindex=0`, `role="listbox"`, items `role="option"` with `aria-selected`); arrow handling is on the list container.
- **CTA primary** links to the build's detail page/URL (`href`). **Icon links** (repo/live/paper) open in a new tab (`target="_blank" rel="noopener noreferrer"`).
- **All accent-colored elements** (badge, dot, tints, CTA, checkmarks, glow) recolor per selected project — see per-project accents.
- **Reduced motion**: disable the swap/entrance animations (`@media (prefers-reduced-motion: reduce)`), show end-state.

### Responsive behavior
- **≤ 980px**: main grid collapses to **single column** (featured stacks above index); title `white-space: normal`; screenshot area height `clamp(200px,42vw,300px)`.
- **≤ 560px**: featured footer stacks (`flex-direction: column`, tags above CTAs); the `↑ ↓` hint hides.

## State Management
- `selectedId` — id of the currently featured build (default: first / `la-history`).
- `filter` — one of `all | case | project | 2026 | 2025` (default `all`).
- Derived: `filteredList` = WORK filtered by the active filter's predicate; `selected` = lookup by id (falls back to first of list).
- Transitions:
  - hover/click item → set `selectedId`.
  - pick filter → set `filter`; if `selectedId` not in new list, set it to `filteredList[0]`.
  - prev/next or arrow key → move `selectedId` by ±1 within `filteredList` (wrapping).
- No data fetching — the 7 builds are static content (see data table below). Project screenshots are static assets.

## Design Tokens

### Core palette
| Token | Value | Use |
|---|---|---|
| `--base` | `#000000` | page background |
| `--fg` | `#ffffff` | primary text |
| `--fg-mute` | `#cccccc` | secondary text |
| `--fg-dim` | `#8b8b8b` | tertiary / meta text |
| `--hairline` | `#545454` | solid borders (buttons) |
| `--hair-soft` | `rgba(255,255,255,0.10)` | soft borders / dividers |
| `--accent` (primary) | `#818cf8` | indigo — global accent, title italic, eyebrow dot |
| `--secondary` | `#2dd4bf` | teal — secondary accent |
| `--surface` | `#1a212b` | (available; not heavily used here) |

### Per-project accent + hue (drives badge, dot, tint, CTA, glow when that build is selected)
| # | id | Title | Tier | Year | Accent | Hue |
|---|---|---|---|---|---|---|
| 01 | la-history | LA History | Case Study | 2026 | `#34d399` | 152 |
| 02 | interp | Interactivity & Interpretability | Case Study | 2026 | `#818cf8` | 245 |
| 03 | toxicity | BiLSTM vs FFNN for Toxicity Detection | Case Study | 2025 | `#fb923c` | 28 |
| 04 | reddit | Reddit Sentiment & Market Response | Case Study | 2025 | `#fb7185` | 350 |
| 05 | dev-wages | AI's Effect on Developer Wages | Project | 2026 | `#a78bfa` | 268 |
| 06 | spring | Spring Landscape | Project | 2023 | `#2dd4bf` | 186 |
| 07 | pacmania | Pac-Mania | Project | 2023 | `#fcd34d` | 47 |

- **Selected-item tint** (index background when selected): `oklch(0.17 0.045 <hue>)`.
- **Featured panel top tint**: `oklch(0.165 0.05 <hue>)` → fades to `#070809`.
- **Screenshot base tint**: `oklch(0.12 0.04 <hue>)`.
- Accent-mix borders use `color-mix(in oklab, <accent> 38–40%, transparent)`.

### Typography
| Role | Family | Notes |
|---|---|---|
| Display / serif | **Instrument Serif** (400, + italic) | titles, project names |
| Sans / body | **Geist** (300–600) | blurbs, highlights |
| Mono | **JetBrains Mono** (400–500) | eyebrows, meta, tags, filters, numbers |

Load via Google Fonts (already imported in `work.css`):
`Geist`, `Instrument+Serif` (incl. italic), `JetBrains+Mono`.

### Spacing / radius / motion
- Section padding & gaps use `clamp()` (values listed per-component above).
- **Radii**: featured panel 20px; index items 12px; tags/pills/badges/dots 999px; FIG tag 999px.
- **Borders**: 1px. Soft = `rgba(255,255,255,0.10)`; solid (buttons) = `#545454`.
- **Glow** (dots/CTAs): `box-shadow: 0 0 8px <accent>`; CTA hover `0 14px 32px -14px <accent>`.
- **Easing**: `cubic-bezier(.2,.7,.3,1)` for swap/transition; durations .22s (UI hover) / .42s (content swap) / .5s (panel bg).
- **Starfield**: fixed background of layered tiny `radial-gradient` dots at low opacity (see `.wk-stars` in `work.css`). Toggleable.

## Assets
- **Fonts**: Instrument Serif, Geist, JetBrains Mono — Google Fonts (no local files needed).
- **Icons**: inline SVG only (nav dock glyphs, arrow, checkmark, repo/external/paper, chevrons). No icon library; copy the `<path>` data from the JSX or substitute the codebase's icon set.
- **Project screenshots**: NOT included — the prototype uses an `<image-slot>` placeholder. Supply one real screenshot per build (`object-fit: cover`, area ~ 16:9 to 2:1). Filenames suggested: `work-shot-<id>.{jpg,png}`.
- **No raster brand assets** — the "ER" wordmark is plain text in Instrument Serif.

## Files
Design-reference source (in this bundle), all at the prototype's project root:
- `Work Section.html` — entry point; mounts `<WorkSection>` + the Tweaks panel; maps tweak state to CSS vars / body classes.
- `work-prod.jsx` — **the section component** (`WorkSection`): layout, selection/filter/keyboard hook usage, image slots.
- `work-prod.css` — **the section's production styles** (the `.prod-*` classes documented above; responsive rules).
- `b-shared.jsx` — per-build metadata (`B_META`: role, highlights, links), the featured sub-components (`BVisual`, `BBadge`, `BHighlights`, `BCtas`, `BFilters`), and the `useBFeatured` selection/filter/keyboard hook + `B_FILTERS` predicates.
- `b-common.css` — shared featured/index primitives (badge, highlights, tags, CTAs, filter pills, prev/next, swap animation).
- `work-shared.jsx` — the **WORK data array** (the 7 builds: id, no, tier, title/short, year, type, hue, accent, stack, blurb, role, href), the nav dock (`WkNav`), and small helpers (`WkArrow`, `WkTags`, `wkTint`).
- `work.css` — global tokens (the palette above), font import, `.wk` base, starfield, nav + eyebrow + tag primitives.
- `image-slot.js` — the drag-and-drop placeholder web component (prototype-only; replace with `<img>` in production).
- `tweaks-panel.jsx` — the in-prototype Tweaks panel (NOT part of the design; ignore for production).

### What to implement vs ignore
- **Implement**: everything in `work-prod.*`, `b-*`, `work-shared.jsx` (data + layout + interactions), and the tokens from `work.css`.
- **Ignore in production**: `tweaks-panel.jsx`, `image-slot.js`, the CDN React/Babel script tags, and the `TweakDefaults`/`useTweaks` wiring in `Work Section.html`. The Tweaks panel only exists to preview accent/visual/highlight/starfield options.

## Open items the developer needs from the site owner
- **Project screenshots** (one per build) for the featured visual.
- **Real URLs** for each build: detail page (`href`) + repo / live / paper links (currently `#`).

## Screenshots (in ./screenshots)
- `01-default-la-history.png` — default state, LA History (case study) selected, "All" filter.
- `02-selection-swap.png` — a project selected (AI's Effect on Developer Wages); note accent shifts to purple.
- `03-projects-filter.png` — "Projects" filter active; list narrowed to the 3 projects.
- `04-mobile-responsive.png` — stacked single-column layout (≤980px): featured panel above the index.
