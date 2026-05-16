'use client';

import Link from 'next/link';
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useRipple } from '@/lib/useRipple';

type RippleLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  internal?: boolean;
  rippleColor?: string;
  rippleDuration?: number;
  children?: ReactNode;
};

export const RippleLink = forwardRef<HTMLAnchorElement, RippleLinkProps>(function RippleLink(
  { href, internal, rippleColor, rippleDuration, className, onClick, children, ...rest },
  ref,
) {
  const { trigger, layer } = useRipple({ duration: rippleDuration, color: rippleColor });

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trigger(event);
    onClick?.(event);
  };

  const sharedClassName = cn('relative isolate overflow-hidden', className);

  const content = (
    <>
      {children}
      {layer}
    </>
  );

  if (internal) {
    return (
      <Link ref={ref} href={href} className={sharedClassName} onClick={handleClick} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <a ref={ref} href={href} className={sharedClassName} onClick={handleClick} {...rest}>
      {content}
    </a>
  );
});
