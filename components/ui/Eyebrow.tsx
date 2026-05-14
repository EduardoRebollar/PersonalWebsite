import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type EyebrowProps = {
  children: ReactNode;
  className?: string;
  dot?: boolean;
};

/**
 * Small mono label that introduces section headings or carries a status line.
 * Optional accent dot for hero-style status indicators.
 */
export function Eyebrow({ children, className, dot = false }: EyebrowProps) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase',
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]"
        />
      )}
      <span>{children}</span>
    </p>
  );
}
