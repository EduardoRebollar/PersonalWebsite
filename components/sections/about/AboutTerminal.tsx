'use client';

/**
 * AboutTerminal — the interactive terminal panel + HUD portrait grid for the
 * About section. Owns useTerminal() and shares its state between the terminal
 * (left) and the portrait column (right, photo ⇄ ascii via the `portrait`
 * command). Ported from the design handoff (tbfinal.jsx + tm-shared.jsx).
 */

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ASCII_PORTRAIT } from '@/lib/asciiPortrait';
import { Ps1 } from './terminalEngine';
import { useTerminal, type Line } from './useTerminal';

const CHIPS = ['about', 'journey', 'projects', 'contact', 'resume'] as const;

function TermBody({ lines, bodyRef }: { lines: Line[]; bodyRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div className="tm-termbody" ref={bodyRef}>
      {lines.map((l) => (
        <div className="row" key={l.id}>
          {l.node}
        </div>
      ))}
    </div>
  );
}

type TermInputProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  input: string;
  ghost: string;
  locked: boolean;
  setInput: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  focus: () => void;
};

function TermInput({ inputRef, input, ghost, locked, setInput, onKeyDown, focus }: TermInputProps) {
  return (
    <div className="tm-inputrow" onClick={focus}>
      <Ps1 />
      <div className="tm-inputwrap">
        <span className="tm-typed">{input}</span>
        <span className="tm-blockcaret" />
        <span className="tm-ghost">
          {ghost}
          {ghost && <span className="tab">tab ⇥</span>}
        </span>
        <input
          ref={inputRef}
          className="tm-input-ov"
          value={input}
          spellCheck={false}
          autoComplete="off"
          aria-label="terminal input"
          disabled={locked}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}

function StatusBar({ branch = 'main' }: { branch?: string }) {
  const [clock, setClock] = useState('');
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('en-US', { hour12: false });
    // setState only via callbacks (rAF for the first paint, interval after) so
    // it's never called synchronously in the effect body.
    const raf = requestAnimationFrame(() => setClock(fmt()));
    const id = setInterval(() => setClock(fmt()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);
  return (
    <div className="tm-status">
      <span className="seg accent">~/about</span>
      <span className="seg">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="18" cy="9" r="2.5" />
          <path d="M6 8.5v7M18 11.5c0 3-4 2-8 4" />
        </svg>
        {branch}
      </span>
      <span className="seg right">
        <span className="on" /> online
      </span>
      <span className="seg">
        <span className="clock">{clock}</span>
      </span>
    </div>
  );
}

const HUD_META: readonly (readonly [string, string])[] = [
  ['SUBJECT', 'Eduardo Rebollar'],
  ['RATIO', '3 : 4'],
  ['LOC', 'Los Angeles, CA'],
  ['FOCUS', 'ML · Data · Web'],
] as const;

/**
 * HudShell — the stable HUD chrome around the portrait box (top label row +
 * corner-framed image slot + meta grid). The actual image vs. ascii art is
 * passed as `children` so toggling the `portrait` command only swaps the inner
 * box; the labels stay mounted, so their per-character fade-in plays once on
 * entrance and never re-fires on the swap.
 *
 * Every label character is wrapped in a `.tm-char` span. Each gets an inline
 * `transitionDelay` (a 2300ms base — just past the portrait's glitch-decode —
 * plus a per-char stagger) so that when `.is-on` fades them from opacity 0 → 1
 * (globals.css, motion-OK only) they resolve as one continuous top-to-bottom
 * cascade. Spans are aria-hidden behind an aria-label on the wrapper so screen
 * readers still read whole words.
 */
function HudShell({ children }: { children: ReactNode }) {
  let ci = 0;
  const chars = (text: string, bold = false) => {
    const Tag = bold ? 'b' : 'span';
    return (
      <Tag role="img" aria-label={text}>
        {Array.from(text).map((ch, i) => (
          <span key={i} aria-hidden="true" className="tm-char" style={{ transitionDelay: `${2300 + ci++ * 16}ms` }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </Tag>
    );
  };

  return (
    <div className="tm-hudcol">
      <div className="tm-hudtop">
        {chars('PORTRAIT.JPG')}
        <span className="live">{chars('LIVE')}</span>
      </div>
      <div className="tm-hud">
        {children}
        <span className="tm-corner tl" />
        <span className="tm-corner tr" />
        <span className="tm-corner bl" />
        <span className="tm-corner br" />
      </div>
      <div className="tm-hudmeta">
        {HUD_META.map(([label, value]) => (
          <span key={label}>
            {chars(label)}
            {'  '}
            {chars(value, true)}
          </span>
        ))}
      </div>
    </div>
  );
}

function HudImage() {
  return (
    <div className="tm-imgwrap">
      <Image
        src="/photo.jpg"
        alt="Eduardo Rebollar portrait"
        fill
        sizes="(max-width: 900px) 420px, 40vw"
        priority={false}
      />
      {/* Spider-Verse load-in: offset magenta + cyan chromatic ghosts and a
          halftone dot print. Idle opacity 0 — only animated during the
          .is-on decode (globals.css), then they vanish. */}
      <div className="tm-chroma tm-chroma-r" aria-hidden="true" />
      <div className="tm-chroma tm-chroma-c" aria-hidden="true" />
      <div className="tm-halftone" aria-hidden="true" />
      <div className="tm-scan" />
      <div className="tm-glitch2" aria-hidden="true" />
    </div>
  );
}

function AsciiImage() {
  return (
    <div className="tm-imgwrap tm-asciibox">
      <pre className="tm-ascii fg">{ASCII_PORTRAIT}</pre>
    </div>
  );
}

export function AboutTerminal({ start = true }: { start?: boolean }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const term = useTerminal({ bodyRef, inputRef, autoRun: ['whoami'], asciiDefault: false, start });

  return (
    <div className="about-grid">
      <div className="about-left">
        {/* Clicking anywhere in the panel focuses the real <input>; the input +
            chips remain the keyboard-accessible controls. */}
        <div className="tm-panel tm-term" onClick={term.focus}>
          <div className="tm-bar">
            <span className="tm-dots">
              <i />
              <i />
              <i />
            </span>
            <span className="file">eduardo@portfolio: ~/about</span>
            <span className="right">
              <span>bash</span>
              <span>{term.locked ? 'BOOT…' : 'READY'}</span>
            </span>
          </div>
          <TermBody lines={term.lines} bodyRef={bodyRef} />
          <div className="tm-chips" role="group" aria-label="suggested commands">
            <span className="tm-chips-lead">try</span>
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                className="tm-chip"
                disabled={term.locked}
                onClick={() => {
                  term.run(c);
                  term.focus();
                }}
              >
                {c}
              </button>
            ))}
            <span className="tm-chips-tip">
              <b>TAB</b> autocompletes · <b>↑</b> recalls
            </span>
          </div>
          <TermInput
            inputRef={inputRef}
            input={term.input}
            ghost={term.ghost}
            locked={term.locked}
            setInput={term.setInput}
            onKeyDown={term.onKeyDown}
            focus={term.focus}
          />
          <StatusBar />
        </div>
      </div>

      <div className="about-side">
        <HudShell>{term.ascii ? <AsciiImage /> : <HudImage />}</HudShell>
      </div>
    </div>
  );
}
