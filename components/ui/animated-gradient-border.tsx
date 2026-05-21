import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * BorderRotate — a card wrapper whose border is a slowly rotating conic
 * gradient (the fill stays solid via the padding-box/border-box background-clip
 * trick).
 *
 * Source: 21st.dev "Animated Gradient Border". Adapted for this repo:
 * - className merged via `@/lib/cn`.
 * - Defaults retuned to a calm indigo/periwinkle sweep (the original teal +
 *   amber both popped too much) and a thinner default border.
 * - The rotation relies on `@property --gradient-angle` + the `gradient-rotate`
 *   keyframe registered in app/globals.css (the angle custom property must be
 *   registered as <angle> to interpolate). The global prefers-reduced-motion
 *   clamp freezes it to a static gradient border automatically.
 */

type AnimationMode = 'auto-rotate' | 'rotate-on-hover' | 'stop-rotate-on-hover';

interface BorderRotateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode;
  className?: string;

  animationMode?: AnimationMode;
  /** Rotation duration in seconds. */
  animationSpeed?: number;

  gradientColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  backgroundColor?: string;

  borderWidth?: number;
  borderRadius?: number;

  style?: CSSProperties;
}

const defaultGradientColors = {
  primary: '#4f46e5', // indigo-600 — deep, the dark end of the sweep
  secondary: '#818cf8', // --primary (indigo-400)
  accent: '#c7d2fe', // indigo-200 — bright, the light end of the sweep
};

const ANIMATION_CLASS: Record<AnimationMode, string> = {
  'auto-rotate': 'gradient-border-auto',
  'rotate-on-hover': 'gradient-border-hover',
  'stop-rotate-on-hover': 'gradient-border-stop-hover',
};

export function BorderRotate({
  children,
  className,
  animationMode = 'auto-rotate',
  animationSpeed = 6,
  gradientColors = defaultGradientColors,
  backgroundColor = '#1a212b', // --card
  borderWidth = 1,
  borderRadius = 12,
  style = {},
  ...props
}: BorderRotateProps) {
  const combinedStyle: CSSProperties = {
    '--gradient-primary': gradientColors.primary,
    '--gradient-secondary': gradientColors.secondary,
    '--gradient-accent': gradientColors.accent,
    '--bg-color': backgroundColor,
    '--border-width': `${borderWidth}px`,
    '--border-radius': `${borderRadius}px`,
    '--animation-duration': `${animationSpeed}s`,
    border: `${borderWidth}px solid transparent`,
    borderRadius: `${borderRadius}px`,
    backgroundImage: `
      linear-gradient(${backgroundColor}, ${backgroundColor}),
      conic-gradient(
        from var(--gradient-angle, 0deg),
        ${gradientColors.primary} 0%,
        ${gradientColors.secondary} 37%,
        ${gradientColors.accent} 30%,
        ${gradientColors.secondary} 33%,
        ${gradientColors.primary} 40%,
        ${gradientColors.primary} 50%,
        ${gradientColors.secondary} 77%,
        ${gradientColors.accent} 80%,
        ${gradientColors.secondary} 83%,
        ${gradientColors.primary} 90%
      )
    `,
    backgroundClip: 'padding-box, border-box',
    backgroundOrigin: 'padding-box, border-box',
    ...style,
  } as CSSProperties;

  return (
    <div
      className={cn('gradient-border-component', ANIMATION_CLASS[animationMode], className)}
      style={combinedStyle}
      {...props}
    >
      {children}
    </div>
  );
}

export default BorderRotate;
