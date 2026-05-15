import type { Project } from '@/types/content';

/**
 * Source of truth for the project showcase. Hero projects ship as deep MDX
 * case studies in Phase 3 (Step 8 wires the route); supporting projects ship
 * as compact cards only.
 *
 * Taglines marked PLACEHOLDER will be refined when the README + paper
 * mining happens in Phase 3.
 */
export const projects: Project[] = [
  {
    slug: 'la-history',
    title: 'LA History',
    tagline:
      'A constructivist learning game across LA — Leaflet map, era unlocks, and a Socratic AI tutor.',
    year: 2025,
    tier: 'hero',
    tech: ['Python', 'Flask', 'SQLAlchemy', 'Leaflet', 'Ollama'],
  },
  {
    slug: 'interactivity-and-interpretability',
    title: 'Interactivity & Interpretability',
    tagline:
      'A senior-comps user study on whether dashboard interactivity actually helps readers — or just hides the work.',
    year: 2025,
    tier: 'hero',
    tech: ['Tableau', 'SVG', 'D3', 'React (port)', 'user study'],
  },
  {
    slug: 'bilstm-vs-ffnn',
    title: 'BiLSTM vs Feedforward NNs for Toxicity Detection',
    tagline:
      'Two neural architectures, six toxicity labels, one question: does attention earn its keep?',
    year: 2024,
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
    year: 2024,
    tier: 'hero',
    tech: ['Python', 'VADER', 'RoBERTa', 'yfinance', 'statsmodels', 'pandas'],
  },
  {
    slug: 'econometrics-final',
    title: 'Econometrics Final Project',
    tagline:
      "AI's effect on developer work, measured against the 2025 Stack Overflow Developer Survey.",
    year: 2025,
    tier: 'supporting',
    tech: ['Stata', 'CSV pipeline', 'Econ 272'],
  },
  {
    slug: 'spring-landscape',
    title: 'Spring Landscape',
    tagline:
      'An animated Java spring scene in progress — bouncing balls, trees, and a drifting motivating quote.',
    year: 2024,
    tier: 'supporting',
    tech: ['Java', 'AWT'],
  },
  {
    slug: 'pac-mania',
    title: 'Pac-Mania',
    tagline: 'A Java Pac-Man clone with maze rendering, ghost AI, and full game-state screens.',
    year: 2023,
    tier: 'supporting',
    tech: ['Java', 'Swing/AWT'],
  },
];

export const heroProjects = projects.filter((p) => p.tier === 'hero');
export const supportingProjects = projects.filter((p) => p.tier === 'supporting');
