'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { cn } from '@/lib/cn';
import { useSceneStore } from '@/stores/useSceneStore';

export interface DockItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

/**
 * Aceternity Floating Dock — mac-OS-style nav pill with cursor magnification.
 * Desktop-only here: the project's existing mobile hamburger drawer in Nav.tsx
 * handles small screens, so this component renders nothing under md.
 *
 * Source: https://ui.aceternity.com/components/floating-dock
 * Adaptations from upstream:
 *   - Stripped mobile (FloatingDockMobile) — kept project's existing drawer.
 *   - Dropped @tabler/icons-react dep (only used by the mobile collapse icon).
 *   - Recolored to project dark palette (bg-surface/80, border-hairline, etc.).
 *   - Magnification scale shrunk to fit h-14 + items-center (avoids overflow).
 *   - <a> → <Link> for in-page anchor links.
 *   - Added activeHref prop for active-section highlight.
 *   - reducedMotion: skip mouseMove → icons stay at base size, still clickable.
 */
export function FloatingDock({
  items,
  activeHref,
  className,
}: {
  items: DockItem[];
  activeHref?: string;
  className?: string;
}) {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={reducedMotion ? undefined : (e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn('mx-auto hidden h-14 items-center gap-6 md:flex', className)}
    >
      {items.map((item) => (
        <IconContainer
          key={item.title}
          mouseX={mouseX}
          isActive={activeHref === item.href}
          {...item}
        />
      ))}
    </motion.div>
  );
}

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  isActive,
}: DockItem & { mouseX: MotionValue; isActive: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [36, 56, 36]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [36, 56, 36]);
  const widthIconTransform = useTransform(distance, [-150, 0, 150], [18, 28, 18]);
  const heightIconTransform = useTransform(distance, [-150, 0, 150], [18, 28, 18]);

  const spring = { mass: 0.1, stiffness: 150, damping: 12 };
  const width = useSpring(widthTransform, spring);
  const height = useSpring(heightTransform, spring);
  const widthIcon = useSpring(widthIconTransform, spring);
  const heightIcon = useSpring(heightIconTransform, spring);

  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href} aria-label={title}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'relative flex aspect-square items-center justify-center rounded-full border bg-base/60 transition-[color,border-color,box-shadow] duration-200',
          isActive
            ? 'border-accent/60 text-accent shadow-[0_0_12px_-2px_var(--color-accent)]'
            : 'border-hairline text-fg-mute hover:border-accent/60 hover:text-fg hover:shadow-[0_0_14px_-2px_var(--color-accent),0_0_28px_-8px_var(--color-accent)]',
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: -4, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -2, x: '-50%' }}
              className="pointer-events-none absolute -bottom-9 left-1/2 w-fit rounded-md border border-accent/40 bg-base/95 px-2 py-1 font-mono text-[10px] tracking-[0.16em] whitespace-pre text-fg uppercase backdrop-blur-md"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
}
