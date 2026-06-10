import { Fragment } from 'react';

/**
 * WaveText — renders text as per-character spans so a single CSS keyframe
 * (`char-wave` in globals.css) can travel across them: each character lifts up
 * and tints indigo as a crest reaches it, the stagger (`animation-delay`,
 * left→right) making it read as a wave/glint sweeping the word. Pure render (no
 * hooks), so it works in both server and client components; the global
 * reduced-motion clamp freezes the keyframe to its resting frame.
 *
 * Accessibility: the real text is rendered once, visually hidden, for screen
 * readers; the animated per-character spans are aria-hidden so they aren't read
 * letter-by-letter.
 */

type WaveTextProps = {
  text: string;
  className?: string;
  /** Seconds between adjacent characters — the wave's travel speed. */
  step?: number;
};

export function WaveText({ text, className, step = 0.1 }: WaveTextProps) {
  const words = text.split(' ');
  // Running index across ALL characters (not reset per word) so the crest sweeps
  // continuously across the whole title rather than restarting each word.
  let charIndex = 0;

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wi) => (
          <Fragment key={wi}>
            {/* inline-block + nowrap keeps a word's characters together (no
                mid-word break) while still allowing the title to wrap at spaces. */}
            <span className="wave-word">
              {[...word].map((ch, ci) => {
                const delay = (charIndex * step).toFixed(3);
                charIndex += 1;
                return (
                  <span key={ci} className="wave-char" style={{ animationDelay: `${delay}s` }}>
                    {ch}
                  </span>
                );
              })}
            </span>
            {/* Breakable space between words (outside the nowrap word box). */}
            {wi < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </span>
  );
}

export default WaveText;
