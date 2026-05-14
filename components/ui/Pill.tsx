import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type PillProps = {
  children: ReactNode;
  className?: string;
  subtle?: boolean;
};

export function Pill({ children, className, subtle = false }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-hairline px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase whitespace-nowrap',
        subtle ? 'text-fg-mute' : 'text-fg',
        className,
      )}
    >
      {children}
    </span>
  );
}
