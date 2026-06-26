import type { Project } from '@/types/content';

/**
 * Source of truth for the project showcase. Hero projects ship as deep MDX
 * case studies at /work/<slug>; supporting projects link to their repos.
 *
 * The Work section renders these as a featured-panel + filterable index
 * (components/sections/Projects.tsx). The array order is the index numbering
 * (01–07). Per-project `accent`/`hue` recolor the featured panel on selection;
 * `role`/`highlights` populate its meta + bullet list.
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
    accent: '#34d399',
    hue: 152,
    role: 'Full-stack · game design',
    highlights: [
      'Leaflet map of greater LA',
      'Era-unlock progression system',
      'Socratic AI tutor on Ollama',
    ],
    links: {
      demo: '/work/la-history/play',
      paper: '/projects/la-history/report.pdf',
    },
  },
  {
    slug: 'interactivity-and-interpretability',
    title: 'Interactivity & Interpretability',
    short: 'Interactivity & Interpretability',
    tagline:
      'A user study on whether dashboard interactivity actually improves interpretation — or just makes it feel easier.',
    year: 2026,
    tier: 'hero',
    tech: ['Tableau', 'SVG', 'D3', 'React (port)', 'user study'],
    accent: '#818cf8',
    hue: 245,
    role: 'Research · data viz',
    highlights: [
      'Controlled user study',
      'Interactive vs. static dashboards',
      'Comprehension measured against confidence',
    ],
    links: {
      paper: '/projects/interactivity-and-interpretability/mini-project-report.pdf',
    },
  },
  {
    slug: 'bilstm-vs-ffnn',
    title: 'BiLSTM vs FFNN for Toxicity Detection',
    short: 'BiLSTM vs FFNN',
    tagline:
      'Two neural architectures, six toxicity labels, one question: does attention earn its keep?',
    year: 2025,
    tier: 'hero',
    tech: ['Python', 'PyTorch', 'pandas', 'Matplotlib'],
    accent: '#fb923c',
    hue: 28,
    role: 'ML · model evaluation',
    highlights: [
      'BiLSTM vs. feed-forward baseline',
      'Six-label toxicity classification',
      'Does attention earn its keep?',
    ],
    links: {
      repo: 'https://github.com/EduardoRebollar/BiLSTM-vs-Feedforward-Neural-Networks-for-Toxicity-Detection',
      paper: '/projects/bilstm-vs-ffnn/paper.pdf',
    },
  },
  {
    slug: 'reddit-sentiment',
    title: 'Reddit Sentiment & Market Response',
    short: 'Reddit Sentiment',
    tagline:
      'A contrarian indicator at weekly horizons, statistical noise at quarterly. The horizon flips the answer.',
    year: 2025,
    tier: 'hero',
    tech: ['Python', 'VADER', 'RoBERTa', 'yfinance', 'statsmodels', 'pandas'],
    accent: '#fb7185',
    hue: 350,
    role: 'NLP · quant analysis',
    highlights: [
      'VADER + RoBERTa sentiment',
      'Weekly vs. quarterly horizons',
      'A contrarian signal emerges',
    ],
    links: {
      paper: '/projects/reddit-sentiment/report.pdf',
    },
  },
  {
    slug: 'econometrics-final',
    title: 'AI & Developer Wages',
    short: 'AI & Developer Wages',
    tagline:
      'AI complements experience, not juniors: a wage regression on 17,498 developers from the 2025 Stack Overflow Survey.',
    year: 2026,
    tier: 'supporting',
    tech: ['Stata', 'CSV pipeline', 'Econ 272'],
    accent: '#a78bfa',
    hue: 268,
    role: 'Econometrics',
    highlights: [
      'AI × experience interaction',
      'OLS · log annual salary',
      'Break-even at 11.4 years',
    ],
  },
  {
    slug: 'spring-landscape',
    title: 'Spring Landscape',
    tagline:
      'An animated Java spring scene in progress — bouncing balls, trees, and a drifting motivating quote.',
    year: 2023,
    tier: 'supporting',
    tech: ['Java', 'AWT'],
    accent: '#2dd4bf',
    hue: 186,
    role: 'Graphics · animation',
    highlights: [
      'Java AWT render loop',
      'Bouncing-ball motion',
      'Drifting quote overlay',
    ],
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
    accent: '#fcd34d',
    hue: 47,
    role: 'Game dev',
    highlights: [
      'Maze rendering engine',
      'Ghost chase AI',
      'Full game-state screens',
    ],
    links: {
      repo: 'https://github.com/EduardoRebollar/Pac-Mania',
    },
  },
];

export const heroProjects = projects.filter((p) => p.tier === 'hero');
export const supportingProjects = projects.filter((p) => p.tier === 'supporting');
