'use client';

import { useRef, useState, type ComponentType, type CSSProperties, type KeyboardEvent } from 'react';
import { useInView } from 'motion/react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { Container } from '@/components/ui/primitives/Container';
import { Heading } from '@/components/ui/primitives/Heading';
import { WaveText } from '@/components/ui/wave-text';
import { RippleLink } from '@/components/ui/cta/RippleLink';
import { ShootingStars } from '@/components/ui/backgrounds/shooting-stars';
import { StarsBackground } from '@/components/ui/backgrounds/stars-background';
import { projects } from '@/content/data/projects';
import { hasMDX } from '@/lib/mdx';
import { cn } from '@/lib/cn';
import type { Project } from '@/types/content';

/**
 * Work — featured-panel + filterable index (Direction B1, ported from the
 * work-section design handoff). A large card on the left shows the selected
 * build (abstract hued figure plate, tier badge, meta, title, blurb,
 * highlights, tech tags, CTAs); a numbered index on the right lets the visitor
 * hover / click / filter / keyboard-navigate. Each build recolors the panel to
 * its own accent hue via inline --f-* / --i-* CSS vars. All styling lives under
 * `.work-featured` in globals.css; reduced motion is handled by the global
 * @layer base clamp (the swap/hover transitions collapse to end-state).
 */

type FilterKey = 'all' | 'case' | 'project' | '2026' | '2025';

const FILTERS: Record<FilterKey, (p: Project) => boolean> = {
  all: () => true,
  case: (p) => p.tier === 'hero',
  project: (p) => p.tier === 'supporting',
  '2026': (p) => p.year === 2026,
  '2025': (p) => p.year === 2025,
};

const FILTER_ORDER: FilterKey[] = ['all', 'case', 'project', '2026', '2025'];
const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'All',
  case: 'Case Studies',
  project: 'Projects',
  '2026': '2026',
  '2025': '2025',
};

// Stable 01–07 numbering keyed to the source-of-truth array order.
const NO_BY_SLUG = new Map(projects.map((p, i) => [p.slug, String(i + 1).padStart(2, '0')]));

const typeLabel = (p: Project) => (p.tier === 'hero' ? 'Case study' : 'Project');

/** hue → soft oklch surface tint (l = lightness, c = chroma). */
function tint(hue: number, l: number, c: number) {
  return `oklch(${l} ${c} ${hue})`;
}

// Icon shape shared by lucide icons and the inline GitHub mark below — lucide
// dropped its brand icons, so the repo glyph is hand-rolled to keep it.
type IconComponent = ComponentType<{ className?: string; strokeWidth?: number }>;

function GitHubIcon({ className, strokeWidth = 1.6 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.5a3 3 0 0 0-.9-2.4c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19 5.5a4.9 4.9 0 0 0-.1-3.6s-1.1-.3-3.6 1.4a12.4 12.4 0 0 0-6.6 0C6.2 1.6 5.1 1.9 5.1 1.9A4.9 4.9 0 0 0 5 5.5a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7a3 3 0 0 0-.8 2.3V22" />
    </svg>
  );
}

type IconLink = {
  key: string;
  href: string;
  label: string;
  Icon: IconComponent;
  /** internal → client-routed <Link>; external → new-tab <a> (repos, PDFs). */
  internal: boolean;
};

// Primary CTA destination + the secondary repo/live/paper icon links, derived
// from the project's links + MDX presence. The repo icon is skipped when the
// repo *is* the primary destination (supporting builds with no case study), so
// it isn't duplicated.
function deriveLinks(p: Project) {
  const isCase = hasMDX(p.slug);
  const primaryHref = isCase
    ? `/work/${p.slug}`
    : (p.links?.repo ?? p.links?.demo ?? '#');
  const primaryLabel = p.tier === 'hero' ? 'Read case study' : 'View project';
  const primaryInternal = primaryHref.startsWith('/');

  const icons: IconLink[] = [];
  if (p.links?.repo && p.links.repo !== primaryHref) {
    icons.push({ key: 'repo', href: p.links.repo, label: 'Repository', Icon: GitHubIcon, internal: false });
  }
  if (p.links?.demo && p.links.demo !== primaryHref) {
    icons.push({
      key: 'demo',
      href: p.links.demo,
      label: 'Live demo',
      Icon: ExternalLink,
      internal: p.links.demo.startsWith('/'),
    });
  }
  if (p.links?.live) {
    icons.push({ key: 'live', href: p.links.live, label: 'Live', Icon: ExternalLink, internal: false });
  }
  if (p.links?.paper) {
    // PDF asset under /public — open in a new tab rather than client-routing.
    icons.push({ key: 'paper', href: p.links.paper, label: 'Paper', Icon: FileText, internal: false });
  }
  return { primaryHref, primaryLabel, primaryInternal, icons };
}

/** Selection + filter + keyboard-navigation state for the featured/index pair. */
function useFeatured() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selSlug, setSelSlug] = useState<string>(projects[0]?.slug ?? '');

  const list = projects.filter(FILTERS[filter]);
  const sel = projects.find((p) => p.slug === selSlug) ?? list[0];

  const pick = (key: FilterKey) => {
    setFilter(key);
    const next = projects.filter(FILTERS[key]);
    const target = next[0];
    if (target && !next.some((p) => p.slug === selSlug)) setSelSlug(target.slug);
  };

  const step = (dir: 1 | -1) => {
    if (list.length === 0) return;
    const idx = list.findIndex((p) => p.slug === selSlug);
    const ni = (idx + dir + list.length) % list.length;
    const target = list[ni];
    if (target) setSelSlug(target.slug);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    }
  };

  return { filter, pick, selSlug, setSelSlug, sel, list, step, onKeyDown };
}

export function Projects() {
  const { filter, pick, selSlug, setSelSlug, sel, list, step, onKeyDown } = useFeatured();
  // In-view toggle drives the "archive indexing" entrance — same scaffold as
  // Skills/Contact: `useInView` is a plain IntersectionObserver wrapper; the
  // motion itself lives in globals.css under `.work-reveal.is-on`, gated on
  // prefers-reduced-motion. The aggressive `-45%` bottom margin holds the
  // entrance back until the grid is scrolled well into view (deeper than the
  // other sections), so the slow develop/print plays in front of the visitor.
  const revealRef = useRef<HTMLDivElement>(null);
  const inView = useInView(revealRef, { once: true, margin: '0px 0px -45% 0px' });
  // `sel` only falls through to undefined if the active filter matches nothing
  // (can't happen with the current data, but keeps the indexing type-safe).
  if (!sel) return null;
  const pos = list.findIndex((p) => p.slug === sel.slug);
  const selNo = NO_BY_SLUG.get(sel.slug);
  const { primaryHref, primaryLabel, primaryInternal, icons } = deriveLinks(sel);

  const featStyle = {
    '--f-accent': sel.accent,
    '--f-top': tint(sel.hue, 0.165, 0.05),
    '--f-base': tint(sel.hue, 0.12, 0.04),
    '--f-glow': tint(sel.hue, 0.34, 0.12),
  } as CSSProperties;

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="work-featured relative overflow-hidden pt-16 pb-12 md:pt-24 md:pb-16"
    >
      {/* Same starfield as Skills, extended down so the sky reads continuously
          from Journey → Skills → Work. Solid at both edges — it hands off from
          Skills above and into Contact below. Centered 1.5x-shell band the
          section's overflow-hidden crops. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-[calc(var(--container-shell)*1.5)] overflow-hidden"
      >
        <StarsBackground />
        <ShootingStars minDelay={400} maxDelay={1800} />
        <ShootingStars minDelay={800} maxDelay={2600} starColor="#2dd4bf" trailColor="#818cf8" />
        <ShootingStars minDelay={1200} maxDelay={3200} starColor="#fcd34d" trailColor="#818cf8" />
      </div>

      <Container className="flex flex-col gap-5">
        <Heading as="h2" id="work-heading" gapClassName="gap-2">
          <WaveText text="Selected work" />
        </Heading>

        {/* `#work-controls`: the Hero "See work" CTA + nav "Work" button align
            this element's bottom edge to the viewport, framing the grid above.
            `.work-reveal` + `.is-on` (added once in view) drive the archive-indexing
            entrance; the choreography lives in globals.css under `.work-reveal.is-on`. */}
        <div
          id="work-controls"
          ref={revealRef}
          className={cn('prod-grid work-reveal', inView && 'is-on')}
        >
          {/* ---- featured panel ---- */}
          <div className="prod-feat" style={featStyle}>
            <div className="prod-vis">
              <span className="prod-vis-no" aria-hidden="true">
                {selNo}
              </span>
              <span className="prod-figtag">Fig · {selNo}</span>
            </div>

            <div className="prod-feat-body">
              <div className="prod-feat-top">
                <span className="bf-badge">
                  <span className="d" />
                  {typeLabel(sel)}
                </span>
                <span className="bf-meta">
                  <b>{sel.year}</b> · {sel.role}
                </span>
              </div>

              {/* re-mounted per selection (key) so the bf-swap entrance replays */}
              <div className="prod-swap" key={sel.slug}>
                <h3 className="bf-title">{sel.title}</h3>
                <p className="bf-blurb">{sel.tagline}</p>
                <ul className="bf-highlights">
                  {sel.highlights.map((h) => (
                    <li key={h}>
                      <Check className="h-[14px] w-[14px]" strokeWidth={1.8} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="prod-feat-foot">
                <div className="bf-tagrow">
                  {sel.tech.map((t) => (
                    <span key={t} className="wk-tag">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="bf-ctas">
                  <RippleLink
                    href={primaryHref}
                    internal={primaryInternal}
                    className="bf-cta-primary"
                    style={{ '--c-accent': sel.accent } as CSSProperties}
                    {...(primaryInternal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {primaryLabel}
                    <ArrowUpRight className="h-[15px] w-[15px]" strokeWidth={1.7} />
                  </RippleLink>
                  {icons.length > 0 && (
                    <div className="bf-cta-links">
                      {icons.map(({ key, href, label, Icon, internal }) =>
                        internal ? (
                          <Link key={key} href={href} className="bf-cta-icon" aria-label={label} title={label}>
                            <Icon className="h-[17px] w-[17px]" strokeWidth={1.6} />
                          </Link>
                        ) : (
                          <a
                            key={key}
                            href={href}
                            className="bf-cta-icon"
                            aria-label={label}
                            title={label}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icon className="h-[17px] w-[17px]" strokeWidth={1.6} />
                          </a>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---- index ---- */}
          <div className="prod-index">
            <div className="prod-index-head">
              <span className="prod-index-label">Index</span>
            </div>

            <div className="bf-filters" role="tablist" aria-label="Filter work">
              {FILTER_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={filter === key}
                  aria-controls="prod-list"
                  className={cn('bf-filter', filter === key && 'on')}
                  onClick={() => pick(key)}
                >
                  {FILTER_LABELS[key]}
                </button>
              ))}
            </div>

            <div
              id="prod-list"
              className="prod-list"
              role="listbox"
              aria-label="Projects"
              tabIndex={0}
              aria-activedescendant={`prod-opt-${sel.slug}`}
              onKeyDown={onKeyDown}
            >
              {list.map((p) => (
                <button
                  key={p.slug}
                  id={`prod-opt-${p.slug}`}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={p.slug === selSlug}
                  className={cn('prod-item', p.slug === selSlug && 'sel')}
                  style={
                    { '--i-accent': p.accent, '--i-tint': tint(p.hue, 0.17, 0.045) } as CSSProperties
                  }
                  onMouseEnter={() => setSelSlug(p.slug)}
                  onClick={() => setSelSlug(p.slug)}
                >
                  <span className="prod-item-no">{NO_BY_SLUG.get(p.slug)}</span>
                  <span>
                    <span className="prod-item-name">{p.short ?? p.title}</span>
                    <span className="prod-item-sub">{typeLabel(p)}</span>
                  </span>
                  <span className="prod-item-right">
                    <span className="prod-item-year">{p.year}</span>
                    <span className="prod-item-dot" />
                  </span>
                </button>
              ))}
            </div>

            <div
              className="prod-index-foot"
              style={{ '--foot-accent': sel.accent } as CSSProperties}
            >
              <span className="bf-count">
                <span className="bf-count-cur">{String(pos + 1).padStart(2, '0')}</span>
                <span className="bf-count-sep">/</span>
                <span className="bf-count-tot">{String(list.length).padStart(2, '0')}</span>
              </span>
              <span className="bf-nav">
                <button
                  type="button"
                  className="bf-navbtn"
                  aria-label="Previous project"
                  onClick={() => step(-1)}
                >
                  <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </button>
                <button
                  type="button"
                  className="bf-navbtn"
                  aria-label="Next project"
                  onClick={() => step(1)}
                >
                  <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </button>
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
