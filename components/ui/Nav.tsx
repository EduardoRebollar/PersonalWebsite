'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from './Container';
import { LiteModeToggle } from '@/components/a11y/LiteModeToggle';
import { navLinks, site } from '@/content/data/site';
import { cn } from '@/lib/cn';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled ? 'bg-base/70 backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <Container as="nav" className="flex h-16 items-center justify-between">
        <Link
          href="#hero"
          aria-label={`${site.name} — home`}
          className="font-display text-2xl leading-none tracking-tight text-fg transition-colors hover:text-accent"
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

        <LiteModeToggle />
      </Container>
    </header>
  );
}
