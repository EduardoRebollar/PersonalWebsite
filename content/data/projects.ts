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
    title: 'LA History Explorer',
    tagline:
      'PLACEHOLDER: Flask + Leaflet app surfacing layers of Los Angeles history through an interactive map.',
    year: 2025,
    tier: 'hero',
    tech: ['Python', 'Flask', 'Leaflet', 'SQLite', 'HTML/CSS'],
  },
  {
    slug: 'interactivity-and-interpretability',
    title: 'Interactivity & Interpretability',
    tagline:
      'PLACEHOLDER: How interactive controls affect comprehension in data-visualization dashboards.',
    year: 2025,
    tier: 'hero',
    tech: ['Tableau', 'D3', 'React'],
  },
  {
    slug: 'bilstm-vs-ffnn',
    title: 'BiLSTM vs Feedforward NNs for Toxicity Detection',
    tagline:
      'PLACEHOLDER: Comparing recurrent and feedforward architectures on a toxicity-classification benchmark.',
    year: 2024,
    tier: 'hero',
    tech: ['Python', 'PyTorch', 'NLP'],
  },
  {
    slug: 'reddit-sentiment',
    title: 'Reddit Sentiment & Market Response',
    tagline:
      'PLACEHOLDER: Time-series analysis of how subreddit sentiment relates to stock movements.',
    year: 2024,
    tier: 'hero',
    tech: ['Python', 'PRAW', 'RoBERTa', 'yfinance', 'Pandas'],
  },
  {
    slug: 'econometrics-final',
    title: 'Econometrics Final Project',
    tagline: 'PLACEHOLDER: Applied econometrics on (topic to be confirmed).',
    year: 2024,
    tier: 'supporting',
    tech: ['R', 'Stata'],
  },
  {
    slug: 'spring-landscape',
    title: 'Spring Landscape',
    tagline: 'PLACEHOLDER: one-line summary — describe in chat and I will fill in.',
    year: 2024,
    tier: 'supporting',
    tech: ['PLACEHOLDER'],
  },
  {
    slug: 'pac-mania',
    title: 'Pac-Mania',
    tagline: 'PLACEHOLDER: Java arcade game inspired by Pac-Man.',
    year: 2023,
    tier: 'supporting',
    tech: ['Java', 'Swing/AWT'],
  },
];

export const heroProjects = projects.filter((p) => p.tier === 'hero');
export const supportingProjects = projects.filter((p) => p.tier === 'supporting');
