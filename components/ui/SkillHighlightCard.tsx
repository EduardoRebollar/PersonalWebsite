'use client';

import {
  Binary,
  Cpu,
  Dices,
  Grid3x3,
  Hash,
  HeartHandshake,
  Languages,
  MessagesSquare,
  Network,
  PenLine,
  Sigma,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderRotate } from '@/components/ui/animated-gradient-border';
import type { SkillCard } from '@/types/content';

/**
 * SkillHighlightCard — a single Coursework / Other entry rendered as a card:
 * a surface traced by a rotating conic-gradient border (BorderRotate), holding
 * a lucide icon, a gradient-animated title (AnimatedGradientText), and a
 * static, legible descriptor.
 *
 * The `icon` string from content/data/skills.ts is resolved to a lucide-react
 * component here (data stays JSX-free, mirroring orbiting-skills.tsx).
 */

const ICONS: Record<string, LucideIcon> = {
  Binary,
  Cpu,
  Dices,
  Grid3x3,
  Hash,
  HeartHandshake,
  Languages,
  MessagesSquare,
  Network,
  PenLine,
  Sigma,
  TrendingUp,
};

export function SkillHighlightCard({ name, descriptor, icon }: SkillCard) {
  const Icon = ICONS[icon];

  return (
    <BorderRotate
      animationMode="auto-rotate"
      animationSpeed={5}
      borderWidth={1}
      borderRadius={12}
      className="flex h-full flex-col gap-1 px-3 py-2.5"
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
        )}
        <AnimatedGradientText className="text-[13px] font-semibold leading-tight tracking-tight">
          {name}
        </AnimatedGradientText>
      </div>
      <p className="font-mono text-[10px] leading-snug tracking-[0.02em] text-fg-mute">
        {descriptor}
      </p>
    </BorderRotate>
  );
}

export default SkillHighlightCard;
