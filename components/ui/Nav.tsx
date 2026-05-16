'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Container } from './Container';
import { navLinks, site } from '@/content/data/site';
import { cn } from '@/lib/cn';
import { useIsLaHistoryDemoRoute } from '@/lib/laHistory/route';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isDemoRoute = useIsLaHistoryDemoRoute();

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

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-mono text-[11px] tracking-wider text-fg-mute uppercase transition-colors hover:text-fg"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
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
          </button>
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
                      onClick={() => setOpen(false)}
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
