import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';
import { cn } from '@/lib/cn';

type HeadingProps = {
  as?: 'h2' | 'h3';
  eyebrow?: string;
  id?: string;
  children: ReactNode;
  className?: string;
  /** Tailwind gap utility for eyebrow→title spacing. Defaults to gap-3. */
  gapClassName?: string;
};

/**
 * Section heading w/ optional eyebrow above. Hero's <h1> is bespoke in
 * Hero.tsx because of the word-stagger entrance.
 */
export function Heading({
  as: As = 'h2',
  eyebrow,
  id,
  children,
  className,
  gapClassName = 'gap-3',
}: HeadingProps) {
  const sizeClass =
    As === 'h2'
      ? 'text-h2 leading-[var(--text-h2--line-height)] tracking-[var(--text-h2--letter-spacing)]'
      : 'text-h3 leading-[var(--text-h3--line-height)]';

  return (
    <div className={cn('flex flex-col', gapClassName)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <As id={id} className={cn('font-display text-fg', sizeClass, className)}>
        {children}
      </As>
    </div>
  );
}
