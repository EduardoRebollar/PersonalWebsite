import type { Project } from '@/types/content';

/**
 * Source of truth for the project showcase. Hero projects ship as deep MDX
 * case studies at /work/<slug>; supporting projects render as compact cards
 * on the home page that link to their repos.
 */
export const projects: Project[] = [
  {
    slug: 'la-history',
    title: 'LA History',
    tagline:
      'A constructivist learning game across LA — Leaflet map, era unlocks, and a Socratic AI tutor.',
    year: 2026,
    tier: 'hero',
    tech: ['Python', 'Flask', 'SQLAlchemy', 'Leaflet', 'Ollama'],
    links: {
      demo: '/work/la-history/play',
    },
  },
  {
    slug: 'interactivity-and-interpretability',
    title: 'Interactivity & Interpretability',
    tagline:
      'A user study on whether dashboard interactivity actually improves interpretation — or just makes it feel easier.',
    year: 2026,
    tier: 'hero',
    tech: ['Tableau', 'SVG', 'D3', 'React (port)', 'user study'],
  },
  {
    slug: 'bilstm-vs-ffnn',
    title: 'BiLSTM vs FFNN for Toxicity Detection',
    tagline:
      'Two neural architectures, six toxicity labels, one question: does attention earn its keep?',
    year: 2025,
    tier: 'hero',
    tech: ['Python', 'PyTorch', 'pandas', 'Matplotlib'],
    links: {
      repo: 'https://github.com/EduardoRebollar/BiLSTM-vs-Feedforward-Neural-Networks-for-Toxicity-Detection',
    },
  },
  {
    slug: 'reddit-sentiment',
    title: 'Reddit Sentiment & Market Response',
    tagline:
      'A contrarian indicator at weekly horizons, statistical noise at quarterly. The horizon flips the answer.',
    year: 2025,
    tier: 'hero',
    tech: ['Python', 'VADER', 'RoBERTa', 'yfinance', 'statsmodels', 'pandas'],
  },
  {
    slug: 'econometrics-final',
    title: "AI's Effect on Developer Wages",
    tagline:
      "AI's effect on developer work, measured against the 2025 Stack Overflow Developer Survey.",
    year: 2026,
    tier: 'supporting',
    tech: ['Stata', 'CSV pipeline', 'Econ 272'],
  },
  {
    slug: 'spring-landscape',
    title: 'Spring Landscape',
    tagline:
      'An animated Java spring scene in progress — bouncing balls, trees, and a drifting motivating quote.',
    year: 2023,
    tier: 'supporting',
    tech: ['Java', 'AWT'],
    links: {
      repo: 'https://github.com/EduardoRebollar/Spring-Landscape',
    },
  },
  {
    slug: 'pac-mania',
    title: 'Pac-Mania',
    tagline: 'A Java Pac-Man clone with maze rendering, ghost AI, and full game-state screens.',
    year: 2023,
    tier: 'supporting',
    tech: ['Java', 'Swing/AWT'],
    links: {
      repo: 'https://github.com/EduardoRebollar/Pac-Mania',
    },
  },
];

export const heroProjects = projects.filter((p) => p.tier === 'hero');
export const supportingProjects = projects.filter((p) => p.tier === 'supporting');
