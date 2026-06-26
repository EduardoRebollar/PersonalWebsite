/* =============================================================================
   AI & Developer Wages — data layer (real figures from the paper + Stata log).
   Ported verbatim from design_handoff_ai_wages_broadsheet/design-source/
   econ-wages/ew-data.js into typed TS for the bespoke broadsheet case study.

   Source: Eduardo Rebollar, "The Effect of AI Tools on Developer Wages by
   Experience Level," Econ 272 Final Project, Occidental College, May 2026.
   Dataset: 2025 Stack Overflow Annual Developer Survey (analytic N = 17,498).
   All coefficients below are taken verbatim from the paper's main regression.
   ========================================================================== */

export type RegressionRow = {
  key: string;
  /** Greek symbol (β₁ … β₇). */
  sym: string;
  label: string;
  /** Coefficient. */
  b: number;
  /** Standard error. */
  se: number;
  /** t-statistic. */
  t: number;
  /** Significant at one-sided 5%. */
  sig: boolean;
  /** The interaction term of interest (highlighted row / ringed dot). */
  interest?: boolean;
};

export type LiteratureBrief = {
  authors: string;
  year: number;
  finding: string;
};

export const meta = {
  title: 'The Effect of AI Tools on Developer Wages',
  subtitle: 'by Experience Level',
  author: 'Eduardo Rebollar',
  affiliation: 'Occidental College',
  course: 'Econ 272',
  term: 'Spring 2026',
  date: 'May 2026',
  dataset: '2025 Stack Overflow Annual Developer Survey',
  n: 17498,
  rawResponses: 49000,
  countries: 177,
  links: {
    // Conventional public asset paths — replace with the real PDFs once added
    // under public/projects/econometrics-final/ (see Known follow-ups).
    paper: '/projects/econometrics-final/paper.pdf',
    slides: '/projects/econometrics-final/slides.pdf',
  },
} as const;

/** One-line framing used as the standfirst / abstract hook. */
export const thesis =
  'I expected AI to help juniors most — the productivity literature is unanimous on that. ' +
  'The wage data says the opposite: AI complements experience rather than substituting for it. ' +
  'The payoff is concentrated among senior developers.';

/** Main regression (paper's reported figures). */
export const main = {
  n: 17498,
  r2: 0.353,
  f: 1364.98,
  df: '7, 17,490',
  rootMSE: 0.912,
  cons: 9.512,
  consSE: 0.037,
  consT: 258.1,
  rows: [
    {
      key: 'ai', sym: 'β₁', label: 'Uses AI tools',
      b: -0.148, se: 0.032, t: -4.7, sig: false,
    },
    {
      key: 'exp', sym: 'β₂', label: 'Years of experience',
      b: 0.02, se: 0.002, t: 12.8, sig: true,
    },
    {
      key: 'ai_exp', sym: 'β₃', label: 'AI × Experience',
      b: 0.013, se: 0.002, t: 7.06, sig: true, interest: true,
    },
    {
      key: 'edu', sym: 'β₄', label: "Bachelor's degree or higher",
      b: 0.184, se: 0.018, t: 10.33, sig: true,
    },
    {
      key: 'size', sym: 'β₅', label: 'Firm has 1,000+ employees',
      b: 0.274, se: 0.015, t: 18.7, sig: true,
    },
    {
      key: 'industry', sym: 'β₆', label: 'Software-development firm',
      b: 0.011, se: 0.014, t: 0.8, sig: false,
    },
    {
      key: 'country', sym: 'β₇', label: 'High-income country',
      b: 1.318, se: 0.018, t: 74.74, sig: true,
    },
  ] satisfies RegressionRow[],
} as const;

/** Descriptive statistics of the analytic sample (who is in the data). */
export const sample = {
  developers: meta.n, // 17,498 respondents in the analytic sample
  countries: meta.countries, // 177 countries represented
  useAiPct: 81, // % who use AI tools in their workflow
  useAiDailyPct: 49, // % who use AI tools daily
  medianExpYrs: 13.2, // median years of professional coding experience
  r2Pct: Math.round(main.r2 * 100), // 35% — variance in log wage the model explains
} as const;

/** The headline interaction result. */
export const result = {
  nonAi: 2.0, // % per year of experience, non-AI users
  ai: 3.3, // % per year, AI users
  gapPct: 65, // AI users' per-year return is ~65% larger
  beta1: -0.148, // AI level effect at zero experience
  beta3: 0.013, // per-year interaction
  breakeven: 11.38, // years where total AI effect crosses zero
} as const;

/** Literature the paper builds on / argues against. */
export const literature: LiteratureBrief[] = [
  {
    authors: 'Acemoglu & Restrepo', year: 2018,
    finding:
      'Automation can substitute for labor on routine tasks OR complement experienced workers on complex ones. Theory can’t say which dominates — it must be tested.',
  },
  {
    authors: 'Brynjolfsson, Li & Raymond', year: 2025,
    finding:
      '5,000+ support agents: +14% productivity overall, +34% for novices, ~0 for experienced. AI passes senior knowledge to juniors.',
  },
  {
    authors: 'Peng et al.', year: 2023,
    finding:
      'RCT, 95 developers with GitHub Copilot finished a task 55.8% faster — largest gains among the least experienced.',
  },
  {
    authors: 'Cui et al.', year: 2024,
    finding:
      'Field experiment, ~2,000 devs at Microsoft & Accenture: +13–22% pull requests/week, juniors benefiting most.',
  },
  {
    authors: 'Brown & Medoff', year: 1989,
    finding: 'Large firms pay more — motivates the firm-size control.',
  },
  {
    authors: 'Freeman & Oostendorp', year: 2000,
    finding:
      'Cross-country gaps dominate global wage variation — motivates the country control.',
  },
];

/* -------------------------------------------------------------------------
   Chart geometry helpers — the signature visualizations.
   ------------------------------------------------------------------------- */

/** Experience-return lines: wage premium vs years, for the two groups.
    non-AI: y = 0.020·x ; AI: y = -0.148 + 0.033·x ; they cross at x = 11.38. */
export function returnLines(xmax = 40) {
  const nonAi: { x: number; y: number }[] = [];
  const ai: { x: number; y: number }[] = [];
  for (let x = 0; x <= xmax; x++) {
    nonAi.push({ x, y: 0.02 * x });
    ai.push({ x, y: -0.148 + 0.033 * x });
  }
  return { nonAi, ai, breakeven: 11.38, xmax };
}

/** Net AI effect on log wage at a given experience: -0.148 + 0.013·x. */
export function netEffect(x: number): number {
  return -0.148 + 0.013 * x;
}

/* ---- number formatters --------------------------------------------------- */
export const fmt = (n: number, d = 0): string =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Signed to a fixed number of decimals, using a true minus glyph. */
export const signed = (n: number, d = 3): string =>
  (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(d);

export const caseStudy = { meta, thesis, main, sample, result, literature } as const;
