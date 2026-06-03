/**
 * Shared content types used by sections, MDX case studies, and the SEO layer.
 * Values live in content/data/*.ts; MDX frontmatter must match the project type.
 */

export type SocialLink = {
  label: string;
  href: string;
  handle?: string;
};

export type MediaImage = {
  src: string;
  alt: string;
  /**
   * Optional curated description shown under the image in the expand-to-view
   * Lightbox. Falls back to `alt` when omitted.
   */
  caption?: string;
  /**
   * Optional zoom factor (1 = none) applied inside the object-cover frame, so a
   * too-wide/too-tall source can crop tighter on its subject without a separate
   * asset. Composes with the card's hover scale.
   */
  zoom?: number;
  /**
   * Optional CSS object-position for the object-cover crop (default 'center').
   * e.g. 'top' to anchor the crop to the top edge so more of the upper part of
   * a tall photo stays in frame.
   */
  objectPosition?: string;
};

export type SiteConfig = {
  name: string;
  initials: string;
  role: string;
  tagline: string;
  description: string;
  url: string;
  email: {
    primary: string;
    secondary?: string;
  };
  socials: SocialLink[];
  location?: string;
  resumeHref?: string;
};

export type ProjectTier = 'hero' | 'supporting';

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  year: number;
  tier: ProjectTier;
  tech: string[];
  cover?: {
    src: string;
    alt: string;
    aspect?: number;
  };
  links?: {
    live?: string;
    repo?: string;
    demo?: string;
  };
  challenges?: string[];
  featured?: boolean;
};

export type ExperienceItem = {
  role: string;
  org: string;
  start: string;
  end: string | 'present';
  location?: string;
  type?: 'full-time' | 'part-time' | 'internship' | 'contract' | 'volunteer';
  impact: string;
  bullets: string[];
  tech?: string[];
  /** Optional photos for the Journey timeline card. */
  images?: MediaImage[];
};

export type EducationItem = {
  institution: string;
  credential: string;
  start: string;
  end: string | 'present';
  focus?: string[];
  honors?: string[];
  activities?: string[];
  notes?: string;
  /** Optional photos for the Journey timeline card. */
  images?: MediaImage[];
};

export type SkillGroup = {
  label: string;
  items: string[];
};

/**
 * A richer skill entry for the Coursework / Other highlight cards: a name, a
 * one-line descriptor, and a string `icon` key resolved to a lucide-react
 * component in SkillHighlightCard (string key keeps this data JSX-free, mirroring
 * the aliasIcons → brandIcons indirection in components/ui/orbiting-skills.tsx).
 */
export type SkillCard = {
  name: string;
  descriptor: string;
  icon: string;
};

export type SkillCardGroup = {
  label: string;
  items: SkillCard[];
};
