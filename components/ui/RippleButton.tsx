'use client';

import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from 'react';
import { cn } from '@/lib/cn';
import { useRipple } from '@/lib/useRipple';

type RippleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'ghost' | 'default';
  rippleColor?: string;
  rippleDuration?: number;
};

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(function RippleButton(
  {
    children,
    onClick,
    className,
    variant = 'ghost',
    rippleColor,
    rippleDuration,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  const { trigger, layer } = useRipple({ duration: rippleDuration, color: rippleColor });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    trigger(event);
    onClick?.(event);
  };

  const variantClasses =
    variant === 'default'
      ? 'rounded-lg bg-accent px-4 py-2 text-accent-foreground hover:opacity-90'
      : '';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'relative isolate cursor-pointer overflow-hidden',
        variantClasses,
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
      {layer}
    </button>
  );
});
