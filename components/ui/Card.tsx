import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type CardProps = {
  href?: string;
  external?: boolean;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

/**
 * Surface card with hover lift. Renders as a Link when `href` is set
 * (internal), as an `<a>` for external links, otherwise as a `<div>`.
 */
export function Card({ href, external, children, className, ariaLabel }: CardProps) {
  const styles = cn(
    'group relative flex flex-col gap-4 rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur-md transition-all',
    href && 'cursor-pointer hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface/80',
    'focus-within:border-accent focus-within:bg-surface/80',
    className,
  );

  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={styles}
      >
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <div aria-label={ariaLabel} className={styles}>
      {children}
    </div>
  );
}
