# Handoff: Contact — Unified Console

## Overview
A redesign of the personal-website **Contact section** ("Get in touch"). It replaces the
previous layout (a 3D robot render + two oversized email cards) with a single, self-contained
**console panel** that pairs a working message form with a live "Open to new opportunities"
status block and a compact list of every contact channel. Goals the design solves for:

- **Use the space meaningfully** — no decorative robot; every element carries information.
- **Compact the emails** — both addresses live as one-line rows, not large cards.
- **Add a résumé link** — now a first-class channel.
- **Reinforce the site's terminal/space aesthetic** — a console header bar, mono labels, an indigo glow.

---

## About the Design Files
The files in this bundle are **design references created in HTML/React-via-Babel** — a prototype
that shows the intended look and behavior. They are **not** production code to copy directly.

Your task is to **recreate this design in the target codebase's existing environment**, using its
established patterns, component primitives, and styling system. If the site already uses React +
CSS Modules / Tailwind / styled-components, build it there with those tools. If no front-end
environment exists yet, pick the most appropriate framework for the project and implement it there.

Treat the HTML/CSS as the **source of truth for visual values** (colors, type, spacing, sizing,
states) and the JSX as the source of truth for **structure, state, and interactions**.

### How to view the reference
Open `Contact Console (reference).html` in a browser (Chrome/Safari). It renders the single screen,
scaled to fit the viewport (letterboxed on black). It loads React + Babel from a CDN, so it needs
network access on first open. Entrance animations play once on load.

---

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, sizing, interactions, and states are
all specified. Recreate the UI pixel-accurately using the codebase's libraries — match the hex
values, font stack, radii, and the hover/focus/active states described below. The one explicitly
unfinished area is **placeholder content** (social URLs, résumé path) — see *Content to replace*.

---

## Canvas & Layout System

- **Design frame:** fixed **1440 × 860 px** (the section is built as a full-bleed block at this
  size). In production this is a **full-width section**; treat 1440 as the design width and make it
  responsive (see *Responsive behavior*). 860px is the design height — in production let the
  section be at least viewport-tall but allow it to grow.
- **Root padding:** `100px 60px 46px` (top / sides / bottom).
- **Background:** solid black `#000000` with a subtle two-layer **starfield** overlay (see *Assets*).
- **Box-sizing:** `border-box` everywhere.

### Top-level structure
```
section.cc8  (position: relative; black; starfield behind)
├── nav            ← shared site nav (logo "ER" + circular icon dock), absolute top
├── header         ← .cc8-head  (flex, space-between, align-flex-end)
│   ├── left       ← eyebrow "Contact" + serif headline "Start a conversation."
│   └── right      ← availability pill (status + reply time)
└── panel          ← .cc8-panel (the console; flex column, rounded, bordered, glow)
    ├── bar        ← .cc8-bar   (console header strip: prompt path + live clock)
    └── body       ← .cc8-body  (CSS grid: form | divider | rail)
        ├── left   ← .cc8-left  (the message form OR the success state)
        ├── divider← .cc8-divider (1px vertical hairline)
        └── right  ← .cc8-right (compact status block + channel list + footer note)
```

The **panel body** is a 3-column grid: `grid-template-columns: 1fr 1px 0.78fr` (form is the wide
column, then a 1px divider, then the 0.78fr rail).

---

## Design Tokens

All tokens are defined in `hero.css` under `:root`. Use these exact values.

### Colors
| Token | Hex | Usage |
|---|---|---|
| `--base` | `#000000` | Page background |
| `--fg` | `#ffffff` | Primary text, solid button bg |
| `--fg-mute` | `#cccccc` | Secondary text, labels, values |
| `--surface` | `#11151c` | Panel/card fills (used via `color-mix`) |
| `--hairline` | `#545454` | Borders/dividers (used via `color-mix`, usually 30–60% opacity) |
| `--accent` | `#818cf8` | Indigo — primary accent, focus rings, glows, links, live dot square |
| `--secondary` | `#2dd4bf` | Teal — "available" status dot, success state |
| `--warn` | `#fcd34d` | Yellow (not used in this screen) |

**Color-mix pattern:** the design leans heavily on `color-mix(in oklab, <token> N%, transparent)`
to derive translucent borders/fills/glows from the base tokens. Keep this approach (or precompute
equivalents) so tints stay harmonized. Examples used here:
- Panel border: `color-mix(in oklab, var(--hairline) 55%, transparent)`
- Panel fill: `color-mix(in oklab, var(--surface) 60%, transparent)` over black
- Accent glow wash (top-left of panel): `radial-gradient(85% 120% at 0% 0%, color-mix(in oklab, var(--accent) 9%, transparent) 0%, transparent 46%)`
- Input fill: `color-mix(in oklab, #06080c 72%, transparent)`
- Focus ring: `box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 16%, transparent)` + border `color-mix(in oklab, var(--accent) 70%, transparent)`

### Typography
Loaded from Google Fonts (`hero.css` `@import`):
`Geist` (300/400/500/600/700), `Instrument Serif` (roman + italic), `JetBrains Mono` (400/500).

| Token | Stack |
|---|---|
| `--font-sans` | `'Geist', ui-sans-serif, system-ui, sans-serif` |
| `--font-display` | `'Instrument Serif', ui-serif, Georgia, serif` |
| `--font-mono` | `'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace` |

**Type roles in this screen:**
- **Display serif** (`--font-display`, weight 400): the headline "Start a conversation." (56px,
  line-height 0.98, letter-spacing −0.02em), form/section titles ("Send a message" 27px), the
  status headline ("Open to new opportunities" 28px), and the success headline (32px).
- **Sans** (`--font-sans`): input text and channel values (15–16px), the status stat values.
- **Mono** (`--font-mono`): all uppercase micro-labels, eyebrow, console prompt + clock, reason
  chips, channel labels, button text, the ⌘↵ hint. Typical 11–12.5px, letter-spacing 0.1–0.22em,
  `text-transform: uppercase`.

> ⚠️ **Multi-line display-serif headings use an explicit `<br />`** (e.g. the success heading
> "Your message<br/>is ready.") on purpose. Instrument Serif has tight metrics and, during web-font
> load (FOUT), a soft-wrapped serif heading can briefly collapse and overlap the line below. Forcing
> the break makes the line count deterministic in any font. Keep deliberate breaks on serif headings
> that can wrap in narrow columns.

### Spacing, radius, shadow (as used)
- **Radii:** panel & cards `16–20px`; inputs & chips `11px` / `999px` (chips are pills); icon dock
  buttons `999px`.
- **Panel shadow:** `0 50px 130px -60px rgba(0,0,0,.95)` plus an inset top highlight
  `inset 0 1px 0 color-mix(in oklab, var(--fg) 8%, transparent)`.
- **Accent glow on hover/focus:** `box-shadow: 0 0 Npx -Mpx var(--accent)` (e.g. button hover
  `0 0 32px -6px`, focus ring as above).
- **Gaps:** header gap 40px; form fields grid gap 15px; chips gap 8px; stat rows ~11px vertical
  padding; channel rows 11px vertical padding.

---

## Screens / Views

There is **one screen** with **two states** in the left column (form ⇄ success).

### Screen: Contact — Unified Console

**Purpose:** Let a visitor send a message (which opens their mail client pre-filled) and/or reach
out through any direct channel, while seeing live availability/status.

#### A. Header (`.cc8-head`)
- Flex row, `justify-content: space-between`, `align-items: flex-end`, `gap: 40px`,
  `margin-bottom: 22px`.
- **Left (`.cc8-headl`, flex: 1):**
  - **Eyebrow** (`Eyebrow` component): a 7px indigo dot with glow + mono uppercase text
    "Contact" (13px, letter-spacing 0.22em, color `--fg-mute`). `margin-bottom: 16px`.
  - **Headline:** `<h1>` serif, 56px, line-height 0.98, letter-spacing −0.02em, white;
    text "Start a conversation." where the word **"conversation."** is italic + indigo
    (`--accent`). `white-space: nowrap` — must stay on **one line** (do not let it wrap into the
    panel).
- **Right (`.cc8-headr`, max-width 366px, align-flex-end):**
  - **Availability pill** (`.cc8-avail`): teal **live dot** (breathing pulse) + mono uppercase
    text "Open to work · replies in 24–48 hrs" in teal (`--secondary`), 12px, letter-spacing 0.14em.
  - (An empty subtitle slot exists below the pill but is intentionally blank in the current design.)

#### B. Console panel (`.cc8-panel`)
- Flex column, `flex: 1`, rounded 20px, `overflow: hidden`.
- Border `1px color-mix(--hairline 55%)`; fill = top-left indigo glow wash over
  `color-mix(--surface 60%)` on black; big soft drop shadow + inset top highlight (see tokens).

**B1. Console bar (`.cc8-bar`)** — height 50px, flex row, padding `0 22px`, bottom hairline,
slightly lighter fill (`color-mix(--surface 55%)`).
- Left: an **11px indigo rounded square** with glow (`.sq`), then a mono path
  `eduardo@portfolio : ~/contact` where **"eduardo"** is bold white and the rest is muted.
- Right (`margin-left: auto`): a mono clock — a small clock icon + **live HH:MM:SS** (24h,
  tabular-nums) + " · Los Angeles", muted.

**B2. Body (`.cc8-body`)** — grid `1fr 1px 0.78fr`, fills remaining panel height.

##### Left column (`.cc8-left`, padding `30px 34px`) — **Form state**
1. **Form head (`.cc8-fhead`):** serif title "Send a message" (27px) + mono uppercase subtext
   "I read every one" (11.5px, muted).
2. **Reason selector (`.cc8-reason`):**
   - Mono uppercase label "I'm reaching out about".
   - **Chip row (`.cc8-chips`):** 4 pill buttons — **Internship · Full-time role ·
     Freelance / project · Just saying hi**. Mono 12px. Default: muted text, hairline border,
     faint surface fill. **Hover:** white text, indigo-tinted border, lift 1px. **Selected (`.on`):**
     white text, indigo border (70%), indigo-tinted fill (16%), soft indigo glow. Single-select,
     and clicking the active chip **deselects** it (toggle).
3. **Fields grid (`.cc8-fields`, 2-col, gap 15px):**
   - "Your name" (text) and "Email" (email) side by side.
   - "Message" (textarea) full-width, grows to fill (`flex: 1`, min-height 96px, no resize).
   - Inputs: dark fill `color-mix(#06080c 72%)`, hairline border, radius 11px, padding `13px 15px`,
     sans 15px. **Focus:** indigo border + 3px indigo focus ring + faint indigo fill shift.
   - Labels: mono 11px uppercase, letter-spacing 0.16em, muted.
4. **Submit row (`.cc8-submit`):**
   - **Send button (`.cc8-btn`):** solid **white** pill, black text, mono 12.5px uppercase,
     padding `14px 26px`, with a trailing **arrow icon**. **Hover:** indigo glow
     `0 0 32px -6px`, lift 2px, arrow nudges right 3px.
   - **Hint:** "or press ⌘ ↵" with the keys in `<kbd>` chips (mono, hairline border).

##### Left column — **Success state** (`.cc8-success`, replaces the form after send)
- A 60px **teal ring** (circle, teal border + 12% teal fill + teal glow) containing a check icon.
- Serif heading "Your message<br/>is ready." (32px) — note the explicit line break.
- Sans body: "I've opened your mail client with everything filled in — just hit send. I'll get back
  to you within 24–48 hrs." (15px, muted, max-width 38ch).
- **"Write another"** ghost button (`.cc8-again`): pill, hairline border, mono uppercase, leading
  arrow icon; hover → white text + indigo border + glow. Resets the form (clears fields, reason,
  and returns to form state).

##### Divider (`.cc8-divider`)
- 1px vertical hairline (`color-mix(--hairline 38%)`) spanning the body height.

##### Right column (`.cc8-right`, padding `30px 32px`, faint dark fill `color-mix(#06080c 24%)`)
1. **Status block (compact)** — rendered "bare" (no card chrome) and "compact":
   - Top row: teal **live dot** + mono uppercase "Available" (teal) + "Status" (muted, right).
   - Serif headline "Open to new opportunities" (28px, white).
   - **Stats list** (compact = 3 rows, each: indigo icon + mono uppercase key + right-aligned value):
     - **Based in** → "Los Angeles, CA"
     - **Local time** → **live HH:MM:SS** in indigo mono (tabular-nums)
     - **Replies in** → "24–48 hrs"
   - (The full/non-compact variant also shows a "Focus → ML · Data · Web" row and an
     "Internships · full-time · collaborations" subline; **omitted here** to fit the rail height.)
2. **Channel label:** mono uppercase "Or reach me directly" with a top hairline + 18px top padding.
3. **Channel list (`ChannelList`):** 5 rows, each a 3-col grid `128px 1fr auto`:
   - **icon + mono uppercase label** | **sans value** | **mono uppercase action**.
   - Rows: **Personal** (mail) → `eduardorebollar2121@gmail.com` → "Copy"; **Occidental** (mail)
     → `rebollar@oxy.edu` → "Copy"; **GitHub** → `@eduardorebollar` → "Open"; **LinkedIn** →
     `in/eduardo-rebollar` → "Open"; **Résumé** (doc) → `resume.pdf` → "PDF".
   - **Hover:** row fill appears, a 2px indigo left-edge bar slides in (scaleY), label turns white,
     icon turns indigo, the row indents 16px (left padding animates).
   - **Copy rows:** clicking copies the value to clipboard and the action swaps to a teal
     "✓ Copied" for ~1.5s. **Open rows:** open in a new tab. **PDF row:** downloads/opens the file.
4. **Footer note (`.cc8-foot`, pinned to bottom via `margin-top: auto`):** indigo mail icon + mono
   "Prefer email? **eduardorebollar2121@gmail.com** reaches me first." (email bold/muted).

> **Height budget note:** the right rail content is tuned to fit exactly within the panel body
> (~691px at design size). The status block is intentionally **compact** for this reason. If you add
> rows, re-check that the footer isn't clipped (the panel has `overflow: hidden`).

---

## Interactions & Behavior

- **Reason chips:** single-select toggle. Selected reason is prefixed to the email subject as
  `[Reason]`.
- **Send (button or ⌘/Ctrl + Enter):** builds a `mailto:` link to the personal email with
  `subject = "[Reason] Hello from <name|your site>"` and `body = <message>` + a signature line
  `— <name> (<email>)` when email is provided, opens it (`window.open(url, '_blank')`), then shows
  the **success state**. In a real app you may instead POST to a mail/contact API and show the same
  success state — keep the mailto as a no-backend fallback.
- **Write another:** resets fields + reason and returns to the form.
- **Channel rows:** copy-to-clipboard (emails) with transient "Copied" confirmation; open-in-new-tab
  (GitHub/LinkedIn); open/download (résumé).
- **Live clocks:** the console-bar clock and the status "Local time" both tick every second,
  formatted in `America/Los_Angeles`, 24-hour, `Intl.DateTimeFormat`.

### Animations & transitions
- **Entrance reveals** (play once on mount, gated for reduced-motion):
  - `h-fade`: opacity 0→1 over 1s ease (eyebrow, availability pill).
  - `h-rise` (aliased `ct-rise`): translateY(28px)+opacity → settle, 0.9s
    `cubic-bezier(0.16,1,0.3,1)`. Applied with staggered `animation-delay`: headline .04s,
    pill .08s, panel .14s.
  - Respect `@media (prefers-reduced-motion: reduce)` — the design already near-disables these.
- **Live status dot:** teal pulse ring, 2.4s ease-out infinite (`ct-pulse`).
- **Micro-interactions:** chip hover lift; input focus ring; button hover glow + arrow nudge;
  channel-row left-bar reveal + indent; dock-button hover glow. Durations 0.15–0.28s, easings
  ease / `cubic-bezier(0.16,1,0.3,1)`.

### State management
Local component state only (no data fetching in the prototype):
- `reason: string | null` — selected chip.
- `f: { name, email, msg }` — controlled inputs.
- `sent: boolean` — toggles form ⇄ success.
- A transient `copied: id | null` (in `ChannelList`) for the per-row "Copied" confirmation
  (auto-clears after ~1.5s).
- `now: Date` ticking each second for the live clocks.

### Responsive behavior
The prototype is a fixed 1440×860 frame; for production:
- **≥ ~1100px:** keep the two-column panel body (`form | divider | rail`).
- **< ~900px:** stack to a single column — form on top, then the status + channel rail below;
  drop the vertical divider (use a horizontal hairline between stacked blocks). Consider moving the
  availability pill under the headline.
- Inputs, chips, and channel rows are already fluid; the headline can reduce from 56px and is
  allowed to wrap once the panel is full-width.
- Maintain 44px+ hit targets on the dock buttons, chips, and channel rows for touch.

---

## Shared site chrome (context)
Top nav is shared across the whole site (`HeroNav` in `hero-shared.jsx`): a serif **"ER"** logo
(left) and a right-aligned **dock** of five 48px circular icon buttons — About (user), Journey
(milestone), Skills (code), Work (folder), **Contact** (mail, shown active here). Active button =
indigo icon + indigo border + indigo glow ring. Hover = white icon, indigo border, 2px lift. Reuse
your site's real nav component; this is included only so the section composes correctly.

---

## Content to replace (placeholders)
The contact data lives in `ct-shared.jsx` as the `CONTACT` object. **Emails are real; the rest are
placeholders — confirm/replace before shipping:**
- `github` value/href → real GitHub URL (currently `@eduardorebollar`, href `#`).
- `linkedin` value/href → real LinkedIn URL (currently `in/eduardo-rebollar`, href `#`).
- `resume` href → real résumé path (currently `/resume.pdf`).
- Copy to confirm: `status` "Open to work", `response` "24–48 hrs", `location` "Los Angeles, CA",
  `focus` "ML · Data · Web" (focus only appears in the non-compact status variant).

---

## Design Tokens (quick reference list)
- **Colors:** `#000000` base · `#ffffff` fg · `#cccccc` fg-mute · `#11151c` surface · `#545454`
  hairline · `#818cf8` accent (indigo) · `#2dd4bf` secondary (teal) · `#fcd34d` warn (unused here) ·
  input base tint `#06080c`.
- **Fonts:** Instrument Serif (display) · Geist (sans) · JetBrains Mono (mono).
- **Type sizes (px):** 56 headline · 32 success heading · 28 status heading · 27 form title ·
  15–16 body/inputs/values · 11–13 mono labels.
- **Radii:** 20 panel · 16 cards · 11 inputs · 999 pills/chips/dock.
- **Key shadow:** `0 50px 130px -60px rgba(0,0,0,.95)` + inset top highlight.
- **Focus ring:** 3px `color-mix(--accent 16%)` + accent border.

---

## Assets
- **No raster/vector image assets are required.** All icons are inline SVGs defined in
  `ct-shared.jsx` (`CICONS`: mail, github, linkedin, doc, copy, check, ext, download, pin, clock,
  bolt, send, arrow) and `hero-shared.jsx` (`HICONS`: nav dock icons). Re-create with your icon
  library (e.g. Lucide — these are Lucide-style 24px, 1.6 stroke) or keep the inline SVGs.
- **Starfield** (`.h-stars` in `hero.css`): two layered `radial-gradient` tiled background layers at
  low opacity — pure CSS, no image.
- **Fonts:** Google Fonts (Geist, Instrument Serif, JetBrains Mono). Self-host in production.
- The site logo is the text **"ER"** in Instrument Serif — no image file.

---

## Files in this bundle
| File | Role |
|---|---|
| `Contact Console (reference).html` | Open this — renders the single screen, scaled to fit. |
| `ct8.jsx` | The screen component (`CT8`): structure, form/success state, interactions. |
| `ct8.css` | All styles specific to this screen (`.cc8-*`). |
| `ctcombo.jsx` | Shared modules used by the screen: `StatusCard`, `ChannelList`, `MsgForm`, `useMailForm`. |
| `ctcombo.css` | Styles for the shared status/list/form modules (`.cc-*`). |
| `ct-shared.jsx` | `CONTACT` data, `CICONS` icon set, `useCopied`, `useClock`, `LiveClock`. |
| `ctbase.css` | Small shared primitives (eyebrow rule, live dot pulse, "Copied" pill, reveals). |
| `hero.css` | **Design tokens** (`:root`), `.hero` frame, shared nav/eyebrow, starfield, reveal keyframes. |
| `hero-shared.jsx` | Shared site nav (`HeroNav`), `Eyebrow`, icon sets. |

**Start here:** read `hero.css` (tokens + frame) → `ct-shared.jsx` (data + icons) → `ct8.jsx` +
`ct8.css` (the screen) → `ctcombo.*` (the status/list/form modules it composes).
