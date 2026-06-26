/* Inline SVG icons for the AI & Developer Wages broadsheet, ported from
   design-source/econ-wages/ew-shared.jsx. Pure presentational — no client JS. */

type IconProps = { s?: number };

export function ExtArrow({ s = 14 }: IconProps) {
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

export function PaperIcon({ s = 15 }: IconProps) {
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
      <path d="M6 2h7l5 5v15H6z" />
      <path d="M13 2v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

export function SlidesIcon({ s = 15 }: IconProps) {
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
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
