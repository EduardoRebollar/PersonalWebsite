/**
 * Motion constants — easings and durations shared across DOM and 3D animations.
 * Mirrors the CSS custom properties in app/globals.css so JS animations stay
 * in sync with CSS transitions.
 */

export const easing = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOutQuart: [0.76, 0, 0.24, 1] as const,
  outQuad: [0.25, 0.46, 0.45, 0.94] as const,
} as const;

export const duration = {
  micro: 0.12,
  small: 0.3,
  medium: 0.7,
  large: 1.4,
} as const;

export type EaseToken = keyof typeof easing;
export type DurationToken = keyof typeof duration;
