/* Shared building blocks for the Work explorations.
   Exports (window): WkNav, WORK, CASE_STUDIES, PROJECTS, WkArrow, WkTags, useReveal
   Each project carries a hue so directions can tint per-card consistently. */

/* ---- project data (real content, two tiers) ------------------------- */
const WORK = [
  {
    id: 'la-history', no: '01', tier: 'case', title: 'LA History',
    year: '2026', type: 'Case Study', hue: 152, accent: '#34d399',
    stack: ['Python', 'Flask', 'SQLAlchemy', 'Leaflet', 'Ollama'],
    blurb: 'A constructivist learning game across LA — Leaflet map, era unlocks, and a Socratic AI tutor.',
    role: 'Full-stack · game design · AI', href: '#',
  },
  {
    id: 'interp', no: '02', tier: 'case', title: 'Interactivity & Interpretability',
    short: 'Interactivity &\u2009Interpretability',
    year: '2026', type: 'Case Study', hue: 245, accent: '#818cf8',
    stack: ['Tableau', 'SVG', 'D3', 'React', 'User study'],
    blurb: 'A user study on whether dashboard interactivity actually improves interpretation — or just makes it feel easier.',
    role: 'Research · data viz · study design', href: '#',
  },
  {
    id: 'toxicity', no: '03', tier: 'case', title: 'BiLSTM vs FFNN for Toxicity Detection',
    short: 'BiLSTM vs FFNN',
    year: '2025', type: 'Case Study', hue: 28, accent: '#fb923c',
    stack: ['Python', 'PyTorch', 'pandas', 'Matplotlib'],
    blurb: 'Two neural architectures, six toxicity labels, one question: does attention earn its keep?',
    role: 'ML · model evaluation', href: '#',
  },
  {
    id: 'reddit', no: '04', tier: 'case', title: 'Reddit Sentiment & Market Response',
    short: 'Reddit Sentiment',
    year: '2025', type: 'Case Study', hue: 350, accent: '#fb7185',
    stack: ['Python', 'VADER', 'RoBERTa', 'yfinance', 'statsmodels', 'pandas'],
    blurb: 'A contrarian indicator at weekly horizons, statistical noise at quarterly — the horizon flips the answer.',
    role: 'NLP · quant analysis', href: '#',
  },
  {
    id: 'dev-wages', no: '05', tier: 'project', title: "AI's Effect on Developer Wages",
    short: "AI & Developer Wages",
    year: '2026', type: 'Project', hue: 268, accent: '#a78bfa',
    stack: ['Stata', 'CSV pipeline', 'Econ 272'],
    blurb: "AI's effect on developer work, measured against the 2025 Stack Overflow Developer Survey.",
    role: 'Econometrics', href: '#',
  },
  {
    id: 'spring', no: '06', tier: 'project', title: 'Spring Landscape',
    year: '2023', type: 'Project', hue: 186, accent: '#2dd4bf',
    stack: ['Java', 'AWT'],
    blurb: 'An animated Java spring scene in progress — bouncing balls, trees, and a drifting motivating quote.',
    role: 'Graphics · animation', href: '#',
  },
  {
    id: 'pacmania', no: '07', tier: 'project', title: 'Pac-Mania',
    year: '2023', type: 'Project', hue: 47, accent: '#fcd34d',
    stack: ['Java', 'Swing/AWT'],
    blurb: 'A Java Pac-Man clone with maze rendering, ghost AI, and full game-state screens.',
    role: 'Game dev', href: '#',
  },
];

const CASE_STUDIES = WORK.filter((w) => w.tier === 'case');
const PROJECTS = WORK.filter((w) => w.tier === 'project');

/* hue → soft surface tint for cards */
function tint(hue, l = 0.16, c = 0.05) {
  return `oklch(${l} ${c} ${hue})`;
}
window.wkTint = tint;

/* ---- arrow glyph ---------------------------------------------------- */
function WkArrow({ size = 16, className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size}
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M17 7H8M17 7v9" />
    </svg>
  );
}

/* ---- tech tag row --------------------------------------------------- */
function WkTags({ items, max }) {
  const shown = max ? items.slice(0, max) : items;
  const extra = max && items.length > max ? items.length - max : 0;
  return (
    <div className="wk-tagrow">
      {shown.map((t) => <span key={t} className="wk-tag">{t}</span>)}
      {extra > 0 && <span className="wk-tag wk-tag-more">+{extra}</span>}
    </div>
  );
}

/* ---- intersection reveal hook -------------------------------------- */
function useReveal() {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

/* ---- shared nav (work active) -------------------------------------- */
const WK_NAV_ICONS = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  milestone: 'M12 13v8M12 3v3 M4 6h13l3 3.5L17 13H4z',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  folder: 'M4 20a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2z M14 13a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 7l-10 6L2 7',
};
const WK_DOCK = [
  { key: 'user', id: 'about' }, { key: 'milestone', id: 'journey' },
  { key: 'code', id: 'skills' }, { key: 'folder', id: 'work' }, { key: 'mail', id: 'contact' },
];
function WkNav() {
  return (
    <nav className="wk-nav">
      <a className="wk-logo">ER</a>
      <div className="wk-dock">
        {WK_DOCK.map((d) => (
          <button key={d.key} className={'wk-dockbtn' + (d.id === 'work' ? ' is-active' : '')} aria-label={d.id}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={WK_NAV_ICONS[d.key]} /></svg>
          </button>
        ))}
      </div>
    </nav>
  );
}

Object.assign(window, { WkNav, WORK, CASE_STUDIES, PROJECTS, WkArrow, WkTags, useReveal });
