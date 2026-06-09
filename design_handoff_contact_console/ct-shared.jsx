/* Shared building blocks for the Contact explorations.
   Reuses .hero artboard base + HeroNav + Eyebrow from hero.css / hero-shared.jsx.
   Exports (window): CONTACT, CICONS, useCopied, useClock, LiveClock */

const CONTACT = {
  name: 'Eduardo Rebollar',
  initials: 'ER',
  location: 'Los Angeles, CA',
  tz: 'America/Los_Angeles',
  status: 'Open to work',
  response: '24–48 hrs',
  focus: 'ML · Data · Web',
  blurb: "Open to internship, full-time, and collaboration opportunities. The fastest way to reach me is email — I usually reply within a day or two.",
  // Channels. Email values are real; the social handles below are editable
  // placeholders (swap to your actual github / linkedin paths).
  channels: [
    { id: 'personal',   icon: 'mail',     label: 'Personal',   value: 'eduardorebollar2121@gmail.com', kind: 'copy',     href: 'mailto:eduardorebollar2121@gmail.com', action: 'Copy' },
    { id: 'occidental', icon: 'mail',     label: 'Occidental', value: 'rebollar@oxy.edu',               kind: 'copy',     href: 'mailto:rebollar@oxy.edu',               action: 'Copy' },
    { id: 'github',     icon: 'github',   label: 'GitHub',     value: '@eduardorebollar',               kind: 'ext',      href: '#', action: 'Open' },
    { id: 'linkedin',   icon: 'linkedin', label: 'LinkedIn',   value: 'in/eduardo-rebollar',            kind: 'ext',      href: '#', action: 'Open' },
    { id: 'resume',     icon: 'doc',      label: 'Résumé',     value: 'resume.pdf',                     kind: 'download', href: '/resume.pdf', action: 'PDF' },
  ],
};

const CICONS = {
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.79-4.58 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h4" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  ext: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M7 11l5 5 5-5M5 21h14" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
};

/* transient per-id "copied" state */
function useCopied() {
  const [copied, setCopied] = React.useState(null);
  const t = React.useRef();
  const copy = (id, text) => {
    try { navigator.clipboard && navigator.clipboard.writeText(text); } catch (e) {}
    setCopied(id);
    clearTimeout(t.current);
    t.current = setTimeout(() => setCopied(null), 1500);
  };
  React.useEffect(() => () => clearTimeout(t.current), []);
  return [copied, copy];
}

/* live wall-clock in a given tz; withSeconds toggles HH:MM vs HH:MM:SS */
function useClock(tz, withSeconds = true) {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, hour: '2-digit', minute: '2-digit',
      ...(withSeconds ? { second: '2-digit' } : {}), hour12: false,
    }).format(now);
  } catch (e) {
    return withSeconds ? '00:00:00' : '00:00';
  }
}

function LiveClock({ tz = CONTACT.tz, withSeconds = true, className }) {
  return <span className={className}>{useClock(tz, withSeconds)}</span>;
}

Object.assign(window, { CONTACT, CICONS, useCopied, useClock, LiveClock });
