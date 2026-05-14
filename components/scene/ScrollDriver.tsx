'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSceneStore } from '@/stores/useSceneStore';
import { sectionOrder, type SectionId } from './sectionStates';

/**
 * Installs a ScrollTrigger per page section. As the user scrolls, the
 * trigger reports its 0..1 progress to the scene store via setActiveSection
 * + setSectionProgress. CameraRig, Terrain, and Atmosphere read those
 * values and interpolate between section poses.
 *
 * Triggers use `top top` → `bottom top` so each section's progress runs
 * from "section's top hits viewport top" to "section's bottom hits
 * viewport top" — a full screen-height of scroll per section.
 */
export function ScrollDriver() {
  const setActiveSection = useSceneStore((s) => s.setActiveSection);
  const setSectionProgress = useSceneStore((s) => s.setSectionProgress);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggers: ScrollTrigger[] = [];

    for (const id of sectionOrder) {
      const el = document.getElementById(id);
      if (!el) continue;

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          if (self.isActive) {
            setActiveSection(id satisfies SectionId);
            setSectionProgress(self.progress);
          }
        },
        onEnter: () => setActiveSection(id satisfies SectionId),
        onEnterBack: () => setActiveSection(id satisfies SectionId),
      });
      triggers.push(trigger);
    }

    ScrollTrigger.refresh();

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [setActiveSection, setSectionProgress]);

  return null;
}
