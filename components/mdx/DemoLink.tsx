import type { ReactNode } from 'react';
import { RippleLink } from '@/components/ui/RippleLink';

type DemoLinkProps = {
  href: string;
  children?: ReactNode;
};

export function DemoLink({ href, children = 'View live demo' }: DemoLinkProps) {
  return (
    <RippleLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      rippleColor="oklch(0.985 0 0 / 0.5)"
      className="not-prose group inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/5 px-4 py-2 font-mono text-[11px] tracking-[0.18em] text-accent uppercase no-underline backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-accent hover:bg-accent/10 focus-visible:border-accent"
    >
      <span>{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        width="12"
        height="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        <path d="M5 11L11 5" />
        <path d="M6 5h5v5" />
      </svg>
    </RippleLink>
  );
}
