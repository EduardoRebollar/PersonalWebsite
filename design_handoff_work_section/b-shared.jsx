/* Shared building blocks for the Direction B expansion.
   Builds on work-shared.jsx (WORK, CASE_STUDIES, PROJECTS, WkArrow, WkTags, WkNav, wkTint).
   Exports (window): B_META, bMeta, BVisual, BBadge, BHighlights, BCtas,
                     BFilters, useBFeatured, B_FILTERS */

/* per-project extras: honest highlights pulled from the real scope + link set */
const B_META = {
  'la-history': {
    role: 'Full-stack · game design',
    highlights: ['Leaflet map of greater LA', 'Era-unlock progression system', 'Socratic AI tutor on Ollama'],
    links: { repo: '#', live: '#' },
  },
  'interp': {
    role: 'Research · data viz',
    highlights: ['Controlled user study', 'Interactive vs. static dashboards', 'Comprehension measured against confidence'],
    links: { repo: '#', paper: '#' },
  },
  'toxicity': {
    role: 'ML · model evaluation',
    highlights: ['BiLSTM vs. feed-forward baseline', 'Six-label toxicity classification', 'Does attention earn its keep?'],
    links: { repo: '#' },
  },
  'reddit': {
    role: 'NLP · quant analysis',
    highlights: ['VADER + RoBERTa sentiment', 'Weekly vs. quarterly horizons', 'A contrarian signal emerges'],
    links: { repo: '#' },
  },
  'dev-wages': {
    role: 'Econometrics',
    highlights: ['Stata panel model', '2025 SO Developer Survey', 'Wage-effect estimates'],
    links: { repo: '#' },
  },
  'spring': {
    role: 'Graphics · animation',
    highlights: ['Java AWT render loop', 'Bouncing-ball motion', 'Drifting quote overlay'],
    links: { repo: '#' },
  },
  'pacmania': {
    role: 'Game dev',
    highlights: ['Maze rendering engine', 'Ghost chase AI', 'Full game-state screens'],
    links: { repo: '#' },
  },
};
function bMeta(p) { return B_META[p.id] || { role: p.role, highlights: [], links: {} }; }

/* ---- featured visual placeholder (swap for a real screenshot later) ---- */
function BVisual({ p, className = '' }) {
  return (
    <div className={'bf-visual ' + className}
      style={{ '--v-accent': p.accent, '--v-glow': window.wkTint(p.hue, 0.34, 0.12), '--v-base': window.wkTint(p.hue, 0.13, 0.045) }}>
      <span className="bf-visual-no">{p.no}</span>
      <div className="bf-visual-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 14l4-3 3 2 4-4 7 5" /><circle cx="8.5" cy="8.5" r="1.4" />
        </svg>
        <span className="bf-visual-label">Screenshot</span>
      </div>
      <span className="bf-visual-fig">FIG · {p.no}</span>
    </div>
  );
}

/* ---- tier badge ---- */
function BBadge({ p }) {
  return <span className="bf-badge"><span className="d" />{p.type}</span>;
}

/* ---- highlights list ---- */
function BHighlights({ p }) {
  const m = bMeta(p);
  if (!m.highlights.length) return null;
  return (
    <ul className="bf-highlights">
      {m.highlights.map((h) => (
        <li key={h}><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.2 3.2L13 4.5" /></svg>{h}</li>
      ))}
    </ul>
  );
}

/* ---- CTA buttons (primary + external links) ---- */
const B_LINK_LABEL = { repo: 'Repo', live: 'Live', paper: 'Paper' };
const B_LINK_ICON = {
  repo: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.5a3 3 0 0 0-.9-2.4c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19 5.5a4.9 4.9 0 0 0-.1-3.6s-1.1-.3-3.6 1.4a12.4 12.4 0 0 0-6.6 0C6.2 1.6 5.1 1.9 5.1 1.9A4.9 4.9 0 0 0 5 5.5a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7a3 3 0 0 0-.8 2.3V22',
  live: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
  paper: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
};
function BCtas({ p, compact }) {
  const m = bMeta(p);
  return (
    <div className={'bf-ctas' + (compact ? ' compact' : '')}>
      <a className="bf-cta-primary" href={p.href} style={{ '--c-accent': p.accent }}>
        {p.tier === 'case' ? 'Read case study' : 'View project'} <WkArrow size={15} />
      </a>
      <div className="bf-cta-links">
        {Object.keys(m.links).map((k) => (
          <a key={k} className="bf-cta-icon" href={m.links[k]} target="_blank" rel="noopener noreferrer" aria-label={B_LINK_LABEL[k]} title={B_LINK_LABEL[k]}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={B_LINK_ICON[k]} /></svg>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---- filters ---- */
const B_FILTERS = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'case', label: 'Case Studies', test: (w) => w.tier === 'case' },
  { key: 'project', label: 'Projects', test: (w) => w.tier === 'project' },
  { key: '2026', label: '2026', test: (w) => w.year === '2026' },
  { key: '2025', label: '2025', test: (w) => w.year === '2025' },
];
function BFilters({ filter, onPick, keys }) {
  const items = keys ? B_FILTERS.filter((f) => keys.includes(f.key)) : B_FILTERS;
  return (
    <div className="bf-filters" role="tablist">
      {items.map((f) => (
        <button key={f.key} role="tab" aria-selected={filter === f.key}
          className={'bf-filter' + (filter === f.key ? ' on' : '')}
          onClick={() => onPick(f.key)}>{f.label}</button>
      ))}
    </div>
  );
}

/* ---- selection + filter + keyboard hook ---- */
function useBFeatured(initialId = 'la-history') {
  const { useState, useCallback } = React;
  const [filter, setFilter] = useState('all');
  const [selId, setSelId] = useState(initialId);
  const test = (B_FILTERS.find((f) => f.key === filter) || B_FILTERS[0]).test;
  const list = WORK.filter(test);
  const sel = WORK.find((w) => w.id === selId) || list[0];

  const pick = useCallback((key) => {
    setFilter(key);
    const t = (B_FILTERS.find((f) => f.key === key) || B_FILTERS[0]).test;
    const next = WORK.filter(t);
    setSelId((cur) => (next.some((w) => w.id === cur) ? cur : next[0].id));
  }, []);

  const step = useCallback((dir) => {
    setSelId((cur) => {
      const i = list.findIndex((w) => w.id === cur);
      const ni = (i + dir + list.length) % list.length;
      return list[ni].id;
    });
  }, [list]);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  }, [step]);

  return { filter, pick, selId, setSelId, sel, list, step, onKeyDown };
}

Object.assign(window, { B_META, bMeta, BVisual, BBadge, BHighlights, BCtas, BFilters, useBFeatured, B_FILTERS });
