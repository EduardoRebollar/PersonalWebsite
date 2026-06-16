'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react';
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { prefersReducedMotion } from '@/lib/motion';

/** The exact `offset` shape `useScroll` accepts, derived so values stay typed. */
type Offset = NonNullable<NonNullable<Parameters<typeof useScroll>[0]>['offset']>;

// useLayoutEffect warns on the server; fall back to useEffect there (mirrors
// CaseStudyShell / ScrollExpandCover).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Concrete values for the LA History scope tokens — motion can interpolate hex
 * colors but not `var(...)`, so the fill mode resolves them here. Kept in sync
 * with `.lah-cs` in components/laHistory/styles/casestudy.css.
 */
const FG_DIM = '#a3a3a3'; // --fg-dim
const FG = '#ffffff'; //     --fg
const ACCENT = '#34d399'; //  --accent

type Mode = 'wipe' | 'fill';

interface WordToken {
  text: string;
  em: boolean;
}

/** Strip leading/trailing punctuation so emphasis matching ignores commas etc. */
const norm = (s: string) => s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();

/**
 * Split `text` into words, flagging the contiguous run that matches `emphasis`
 * (compared punctuation-insensitively) so those words render as `<em>`.
 */
function tokenize(text: string, emphasis?: string): WordToken[] {
  const words = text.split(' ');
  if (!emphasis) return words.map((text) => ({ text, em: false }));
  const emWords = emphasis.split(' ').map(norm);
  let start = -1;
  for (let i = 0; i + emWords.length <= words.length; i++) {
    if (emWords.every((w, j) => norm(words[i + j]!) === w)) {
      start = i;
      break;
    }
  }
  return words.map((text, i) => ({
    text,
    em: start >= 0 && i >= start && i < start + emWords.length,
  }));
}

/** Each word reveals (opacity + rise + de-blur) across its slice of scroll. */
function WipeWord({
  token,
  progress,
  range,
}: {
  token: WordToken;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [10, 0]);
  const blur = useTransform(progress, range, [5, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const content = `${token.text} `;
  return (
    <motion.span className="srw-word" style={{ opacity, y, filter }}>
      {token.em ? <em>{content}</em> : content}
    </motion.span>
  );
}

/** Each word fills from dim → ink (accent for emphasis) across its scroll slice. */
function FillWord({
  token,
  progress,
  range,
}: {
  token: WordToken;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const color = useTransform(progress, range, [FG_DIM, token.em ? ACCENT : FG]);
  const content = `${token.text} `;
  return (
    <motion.span className="srw-word srw-fill" style={{ color }}>
      {token.em ? <em>{content}</em> : content}
    </motion.span>
  );
}

/**
 * Active (motion-enabled) branch: one scroll progress for the whole element,
 * sliced into overlapping per-word windows so the reveal sweeps left-to-right.
 */
function AnimatedWords({
  tokens,
  mode,
  as,
  className,
  offset,
}: {
  tokens: WordToken[];
  mode: Mode;
  as?: ElementType;
  className?: string;
  offset: Offset;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });

  const Tag = (as ?? 'div') as ElementType;
  const n = tokens.length;
  return (
    <Tag ref={ref as Ref<HTMLElement>} className={className}>
      {tokens.map((token, i) => {
        // overlap each word's window with its neighbours for a smooth sweep
        const range: [number, number] = [i / n, Math.min(1, (i + 2) / n)];
        return mode === 'wipe' ? (
          <WipeWord key={i} token={token} progress={scrollYProgress} range={range} />
        ) : (
          <FillWord key={i} token={token} progress={scrollYProgress} range={range} />
        );
      })}
    </Tag>
  );
}

/** Fully-visible, motion-free render — SSR, no-JS, and reduced-motion. */
function StaticWords({
  tokens,
  as,
  className,
}: {
  tokens: WordToken[];
  as?: ElementType;
  className?: string;
}) {
  const Tag = (as ?? 'div') as ElementType;
  return (
    <Tag className={className}>
      {tokens.map((token, i): ReactNode =>
        token.em ? <em key={i}>{token.text} </em> : <span key={i}>{token.text} </span>,
      )}
    </Tag>
  );
}

interface ScrollRevealWordsProps {
  text: string;
  /** Substring rendered as `<em>` (accent); matched punctuation-insensitively. */
  emphasis?: string;
  mode: Mode;
  as?: ElementType;
  className?: string;
  /** `useScroll` window — defaults tuned per mode. */
  offset?: Offset;
}

/**
 * Scroll-scrubbed word-by-word reveal for the LA History broadsheet. Two modes:
 *  - `wipe` — headlines rise + de-blur word-by-word as they enter (.bs-head),
 *  - `fill` — pull-quotes fill dim → ink/accent as they cross center (.bs-pull).
 *
 * Content is fully visible by default; the scrubbed pre-state only engages once
 * mounted with motion allowed (the `.anim-ok` convention, here per-component), so
 * SSR / no-JS / reduced-motion render readable, never-stuck text and there's no
 * hydration flash. Companion CSS lives in casestudy.css (`.srw-word`).
 */
export function ScrollRevealWords({
  text,
  emphasis,
  mode,
  as,
  className,
  offset,
}: ScrollRevealWordsProps) {
  const [engaged, setEngaged] = useState(false);
  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    setEngaged(true);
  }, []);

  const tokens = tokenize(text, emphasis);
  if (!engaged) return <StaticWords tokens={tokens} as={as} className={className} />;

  const resolved: Offset =
    offset ?? (mode === 'wipe' ? ['start end', 'start center'] : ['start center', 'end center']);
  return <AnimatedWords tokens={tokens} mode={mode} as={as} className={className} offset={resolved} />;
}

/** Headline word-wipe (`.bs-head`). */
export function ScrollWipeHeading({
  text,
  emphasis,
  className,
}: {
  text: string;
  emphasis?: string;
  className?: string;
}) {
  return (
    <ScrollRevealWords
      text={text}
      emphasis={emphasis}
      mode="wipe"
      as="h2"
      className={['bs-head', className].filter(Boolean).join(' ')}
    />
  );
}

/** Pull-quote karaoke fill (`.bs-pull blockquote`). */
export function ScrollFillQuote({
  text,
  emphasis,
  className,
}: {
  text: string;
  emphasis?: string;
  className?: string;
}) {
  return (
    <ScrollRevealWords
      text={text}
      emphasis={emphasis}
      mode="fill"
      as="blockquote"
      className={className}
    />
  );
}
