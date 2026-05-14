/**
 * Shared content types used by sections, MDX case studies, and the SEO layer.
 * Values live in content/data/*.ts; MDX frontmatter must match the project type.
 */

export type SocialLink = {
  label: string;
  href: string;
  handle?: string;
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
};

export type SkillGroup = {
  label: string;
  items: string[];
};
