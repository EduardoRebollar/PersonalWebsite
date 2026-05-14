import type { SiteConfig } from '@/types/content';

export const site: SiteConfig = {
  name: 'Eduardo Rebollar',
  initials: 'ER',
  role: 'Computer Science & Economics @ Occidental College',
  tagline: 'PLACEHOLDER: hero tagline — building at the intersection of ML, data, and the web.',
  description:
    'Personal portfolio for Eduardo Rebollar — Computer Science & Economics student at Occidental College, building at the intersection of ML, data, and the web.',
  url: 'https://eduardorebollar.vercel.app',
  email: {
    primary: 'eduardorebollar2121@gmail.com',
    secondary: 'rebollar@oxy.edu',
  },
  socials: [
    {
      label: 'GitHub',
      href: 'https://github.com/EduardoRebollar',
      handle: '@EduardoRebollar',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/eduardo-rebollar-361877244/',
      handle: 'in/eduardo-rebollar',
    },
  ],
  location: 'Los Angeles, CA',
  resumeHref: '/resume.pdf',
};

export const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
] as const;
