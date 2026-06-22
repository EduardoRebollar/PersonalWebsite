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

export function ZoomIcon({ s = 15 }: { s?: number }) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
    </svg>
  );
}

export function LayersIcon({ s = 18 }: { s?: number }) {
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
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5M3 16.5l9 5 9-5" />
    </svg>
  );
}

export function DialogueIcon({ s = 18 }: { s?: number }) {
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
      <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.5 9.5 0 0 1-4-1L3 21l1-4a8.38 8.38 0 0 1-1-4 8.5 8.5 0 0 1 17 0z" />
      <path d="M12 8.5a2 2 0 0 1 2 2c0 1.3-2 1.5-2 3M12 16h.01" />
    </svg>
  );
}

export function NetworkIcon({ s = 18 }: { s?: number }) {
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
      <circle cx="5" cy="6" r="2.2" />
      <circle cx="19" cy="6" r="2.2" />
      <circle cx="12" cy="18" r="2.2" />
      <path d="M6.8 7.2L10.5 16M17.2 7.2L13.5 16M7 6h10" />
    </svg>
  );
}

// ── results criteria glyphs (mirror the theory bento's title icons) ──

export function WithholdIcon({ s = 18 }: { s?: number }) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 5.6l12.8 12.8" />
    </svg>
  );
}

export function QuestionIcon({ s = 18 }: { s?: number }) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M9.3 9.2a2.7 2.7 0 0 1 5.2 1c0 1.8-2.5 2.1-2.5 3.6M12 17h.01" />
    </svg>
  );
}

export function AnalysisIcon({ s = 18 }: { s?: number }) {
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
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.7-4.7M8 11l1.8 1.8L13 9" />
    </svg>
  );
}

export function ClarityIcon({ s = 18 }: { s?: number }) {
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
      <path d="M4 6h16M4 12h12M4 18h8" />
    </svg>
  );
}

// ── reflection glyphs (mirror the criteria bento's title icons) ──

export function InsightIcon({ s = 18 }: { s?: number }) {
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
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

export function LoopIcon({ s = 18 }: { s?: number }) {
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
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <path d="M3 21v-5h5" />
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
