'use client';

import { motion } from 'motion/react';
import { Container } from '@/components/ui/primitives/Container';
import { GradientDots } from '@/components/ui/backgrounds/gradient-dots';
import { Heading } from '@/components/ui/primitives/Heading';
import { OrbitingSkills } from '@/components/ui/orbiting-skills';
import { SkillMarquee } from '@/components/ui/skill-marquee';
import { SplineScene } from '@/components/ui/three/SplineScene';
import { skillHighlights, skills } from '@/content/data/skills';
import { easing } from '@/lib/motion';
import { useSceneStore } from '@/stores/useSceneStore';
import type { SkillGroup } from '@/types/content';

// Self-hosted from /public so the scene is served from Vercel's edge (with
// long-lived caching) instead of a third-party CDN round-trip — same pattern
// as the hero scene. Replaces the GradientDots field as the section backdrop
// on capable, non-reduced-motion devices.
const SKILLS_SCENE_URL = '/spline/skills.splinecode';

const TECHNICAL_LABELS = new Set(['Languages', 'ML / Data', 'Frameworks', 'Dev Tools']);
const PRODUCTIVITY_LABELS = new Set([
  'Microsoft',
  'Google Workspace',
  'Communication',
  'Network & Creative',
]);

function OrbitGroup({
  label,
  groups,
  delay = 0,
}: {
  label: string;
  groups: SkillGroup[];
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.8, ease: easing.outExpo, delay }}
      className="flex flex-col items-center gap-3"
    >
      <h3 className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">{label}</h3>
      <OrbitingSkills groups={groups} maxSize={520} />
    </motion.div>
  );
}

export function Skills() {
  const technicalGroups = skills.filter((g) => TECHNICAL_LABELS.has(g.label));
  const productivityGroups = skills.filter((g) => PRODUCTIVITY_LABELS.has(g.label));

  // Gate the heavy Spline runtime exactly like the hero: only mount it on
  // initialized, WebGL2-capable, non-mobile devices with motion allowed.
  // Everyone else falls back to the lightweight GradientDots field.
  const initialized = useSceneStore((s) => s.initialized);
  const hasWebGL2 = useSceneStore((s) => s.hasWebGL2);
  const isMobile = useSceneStore((s) => s.isMobile);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const showSpline = initialized && hasWebGL2 && !isMobile && !reducedMotion;

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative isolate overflow-hidden pt-3 pb-6 md:pt-4 md:pb-8"
    >
      {/* Animation band — a hard 1.5x the container shell, centered, bleeding
          past the viewport on narrower screens (the section's overflow-hidden
          crops it). The top/bottom mask fades it into neighboring sections. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2"
        style={{
          width: 'calc(var(--container-shell) * 1.5)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
        }}
      >
        {showSpline ? (
          // The Spline scene bakes in a ~#121212 canvas background (its alpha
          // can't be overridden from react-spline), which reads as charcoal,
          // not black. A contrast filter crushes that dark grey to true black
          // while leaving the white particles white. Bump contrast if any grey
          // remains; ease it down if the particles start clipping.
          <>
            <SplineScene
              scene={SKILLS_SCENE_URL}
              className="h-full w-full [filter:contrast(1.6)]"
            />
            {/* The Spline runtime paints a "Built with Spline" badge in the
                bottom-right of the canvas that can't be disabled from
                react-spline (free plan). Cover it with an opaque swatch matching
                the crushed-black backdrop. Compositing happens before the band's
                mask, so the badge never shows through. */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 bottom-0 h-14 w-44 bg-background"
            />
          </>
        ) : (
          <>
            <GradientDots className="opacity-50" />
            {/* Flat scrim — only for the dense dot fallback, to darken it to
                black rather than grey. The Spline path needs none. */}
            <div className="absolute inset-0 bg-background/55" />
          </>
        )}
      </div>

      <Container className="relative z-10 flex flex-col gap-3">
        <Heading as="h2" id="skills-heading" eyebrow="Skills">
          Tools I reach for
        </Heading>

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-8">
          <OrbitGroup label="Technical" groups={technicalGroups} />
          <OrbitGroup label="Productivity" groups={productivityGroups} delay={0.1} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.6, ease: easing.outExpo }}
          className="flex flex-col gap-3"
        >
          <h3 className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">
            Coursework &amp; more
          </h3>
          <SkillMarquee items={skillHighlights.flatMap((g) => g.items)} />
        </motion.div>
      </Container>
    </section>
  );
}
