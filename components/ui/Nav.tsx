'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Code2, FolderGit2, Mail, Milestone, User } from 'lucide-react';
import { Container } from './Container';
import { FloatingDock, type DockItem } from './FloatingDock';
import { RippleButton } from './RippleButton';
import { navLinks, site } from '@/content/data/site';
import { cn } from '@/lib/cn';
import { useIsLaHistoryDemoRoute } from '@/lib/laHistory/route';

const NAV_ICONS: Record<string, React.ReactNode> = {
  '#about': <User className="h-full w-full" strokeWidth={1.6} />,
  '#journey': <Milestone className="h-full w-full" strokeWidth={1.6} />,
  '#skills': <Code2 className="h-full w-full" strokeWidth={1.6} />,
  '#work': <FolderGit2 className="h-full w-full" strokeWidth={1.6} />,
  '#contact': <Mail className="h-full w-full" strokeWidth={1.6} />,
};

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | undefined>(undefined);
  const isDemoRoute = useIsLaHistoryDemoRoute();

  const scrollToBottom = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: reduced ? 'auto' : 'smooth',
    });
    history.replaceState(null, '', '#contact');
  }, []);

  // Place the "work-controls" row's bottom edge flush at the bottom of the
  // viewport (minus a small gap). Computed explicitly because scrollIntoView's
  // block:'end' is honored inconsistently across browsers.
  const scrollWorkControlsIntoView = useCallback(() => {
    if (typeof window === 'undefined') return;
    const target = document.getElementById('work-controls');
    if (!target) return;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const GAP = 16;
    const rect = target.getBoundingClientRect();
    const top = window.scrollY + rect.bottom - window.innerHeight + GAP;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  // "Work" scrolls to the carousel's arrow/dot controls (bottom of the
  // section) rather than the heading, so the interactive cards are framed.
  const scrollToWorkControls = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      scrollWorkControlsIntoView();
      history.replaceState(null, '', '#work');
    },
    [scrollWorkControlsIntoView],
  );

  const dockItems = useMemo<DockItem[]>(
    () =>
      navLinks.map((link) => ({
        title: link.label,
        href: link.href,
        icon: NAV_ICONS[link.href] ?? null,
        onClick:
          link.href === '#contact'
            ? scrollToBottom
            : link.href === '#work'
              ? scrollToWorkControls
              : undefined,
      })),
    [scrollToBottom, scrollToWorkControls],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (isDemoRoute) return;
    const sections = navLinks
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isDemoRoute]);

  // When the hash becomes #work via real navigation (link click, initial load,
  // back/forward), the browser jumps to the section top — override it to land
  // on the controls. pushState/replaceState don't fire hashchange, so the nav
  // click handler above isn't double-triggered. The rAF lets the browser's
  // native jump and layout settle before we measure.
  useEffect(() => {
    if (isDemoRoute) return;
    const handleHashWork = () => {
      if (window.location.hash !== '#work') return;
      requestAnimationFrame(() => scrollWorkControlsIntoView());
    };
    handleHashWork();
    window.addEventListener('hashchange', handleHashWork);
    return () => window.removeEventListener('hashchange', handleHashWork);
  }, [isDemoRoute, scrollWorkControlsIntoView]);

  if (isDemoRoute) return null;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled || open ? 'bg-base/70 backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <Container as="nav" className="flex h-16 items-center justify-between">
        <Link
          href="#hero"
          aria-label={`${site.name} — home`}
          className="font-display text-2xl leading-none tracking-tight text-fg transition-colors hover:text-accent"
          onClick={() => setOpen(false)}
        >
          {site.initials}
        </Link>

        <FloatingDock items={dockItems} activeHref={activeHref} />

        <div className="flex items-center gap-2">
          <RippleButton
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface/60 text-fg backdrop-blur-md transition-colors hover:border-accent/60 hover:text-accent focus-visible:border-accent focus-visible:text-accent md:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
            >
              {open ? (
                <path d="M6 6 L18 18 M18 6 L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7 L20 7 M4 17 L20 17" strokeLinecap="round" />
              )}
            </svg>
          </RippleButton>
        </div>
      </Container>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="border-t border-hairline bg-base/80 backdrop-blur-md md:hidden"
          >
            <Container className="py-4">
              <ul className="flex flex-col">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        if (link.href === '#contact') scrollToBottom(e);
                        else if (link.href === '#work') scrollToWorkControls(e);
                        setOpen(false);
                      }}
                      className="block py-3 font-mono text-[12px] tracking-wider text-fg-mute uppercase transition-colors hover:text-fg focus-visible:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
