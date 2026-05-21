import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ContainerElement = 'div' | 'section' | 'header' | 'footer' | 'main' | 'nav' | 'article';

type ContainerProps = {
  as?: ContainerElement;
  width?: 'shell' | 'prose';
  className?: string;
  children: ReactNode;
};

export function Container({
  as: As = 'div',
  width = 'shell',
  className,
  children,
}: ContainerProps) {
  return (
    <As className={cn(width === 'shell' ? 'container-shell' : 'container-prose', className)}>
      {children}
    </As>
  );
}
