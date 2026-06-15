// Inline glyphs for the LA History broadsheet (no icon dependency — matches the
// design handoff's hand-rolled SVGs).

export function Arrow({ s = 16 }: { s?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={s}
      height={s}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17L17 7M17 7H8M17 7v9" />
    </svg>
  );
}

export function ExtArrow({ s = 15 }: { s?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={s}
      height={s}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 7h10v10M7 17L17 7" />
    </svg>
  );
}

export function PlayIcon({ s = 15 }: { s?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function PaperIcon({ s = 15 }: { s?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={s}
      height={s}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2h7l5 5v15a0 0 0 0 1 0 0H6z" />
      <path d="M13 2v5h5M9 13h6M9 17h6" />
    </svg>
  );
}
