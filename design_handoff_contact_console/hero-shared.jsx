/* Shared building blocks for the Hero explorations.
   Exports (window): HICONS, HeroNav, Eyebrow, CTAs, ArrowIcon */

const HICONS = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  milestone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 13v8M12 3v3" /><path d="M4 6h13l3 3.5L17 13H4z" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2z" /><circle cx="12" cy="13" r="2" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
    </svg>
  ),
};

const HDOCK = [
  { key: 'user', label: 'About', id: 'about' },
  { key: 'milestone', label: 'Journey', id: 'journey' },
  { key: 'code', label: 'Skills', id: 'skills' },
  { key: 'folder', label: 'Work', id: 'work' },
  { key: 'mail', label: 'Contact', id: 'contact' },
];

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function HeroNav({ active = 'work', logoStyle, className = '' }) {
  return (
    <nav className={'h-nav ' + className}>
      <a className="h-logo" style={logoStyle}>ER</a>
      <div className="h-dock">
        {HDOCK.map((d) => (
          <button key={d.key} className={'h-dockbtn' + (d.id === active ? ' is-active' : '')} aria-label={d.label}>
            {HICONS[d.key]}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Eyebrow({ children, style }) {
  return (
    <span className="h-eyebrow" style={style}>
      <span className="dot" />
      {children}
    </span>
  );
}

/* CTAs — primary variant: 'solid' (white) | 'accent' (indigo). */
function CTAs({ primaryLabel = 'See Work', ghostLabel = 'Get in Touch', variant = 'solid', style }) {
  return (
    <div className="h-ctarow" style={style}>
      <a className={'h-cta h-cta-primary' + (variant === 'accent' ? ' h-cta-accent' : '')}>
        {primaryLabel} <ArrowIcon />
      </a>
      <a className="h-cta h-cta-ghost">{ghostLabel}</a>
    </div>
  );
}

function ScrollCue({ style }) {
  return (
    <div className="h-scroll" style={style}>
      Scroll <span className="bar" />
    </div>
  );
}

Object.assign(window, { HICONS, HeroNav, Eyebrow, CTAs, ScrollCue, ArrowIcon });
