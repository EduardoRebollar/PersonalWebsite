'use client';

/**
 * useTerminal — owns all interactive-terminal state for the About section:
 * scrollback lines, the current input + ghost autocomplete, boot/lock state,
 * portrait (ascii) mode, command history, and the typewriter streamer.
 * Ported from the design handoff (term-engine.jsx) to strict TS.
 */

import { isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import {
  COMMAND_NAMES,
  MatrixRainNode,
  Ps1,
  TypeLine,
  TypeOut,
  bannerLines,
  containsPre,
  nodeTextLen,
  resolveCommand,
  tDim,
  tOk,
  type TermCtx,
} from './terminalEngine';

export type Line = { id: number; node: ReactNode };

const COMMANDS: readonly string[] = COMMAND_NAMES;

/**
 * The DOM refs are owned by the consuming component and passed in (rather than
 * created here and returned), so the hook's return value carries no ref objects
 * — this keeps consumers clear of the react-hooks/refs "ref accessed during
 * render" rule, which taints any object that bundles a ref. The hook only reads
 * `.current` inside effects/handlers, which is allowed.
 */
// The scanline-sweep entrance (globals.css → tm-scan-reveal) takes ~1900ms once
// the section scrolls into view. Hold the typed boot until it clears so the
// terminal types into a freshly-revealed, empty screen.
const SCAN_LEAD_MS = 1900;

export function useTerminal({
  bodyRef,
  inputRef,
  autoRun = ['whoami'],
  asciiDefault = false,
  start = true,
}: {
  bodyRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  autoRun?: string[];
  asciiDefault?: boolean;
  /** Gate the boot/type sequence; flips true once the section is in view. */
  start?: boolean;
}) {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [locked, setLocked] = useState(true);
  const [ascii, setAscii] = useState(asciiDefault);
  const idRef = useRef(0);
  const hist = useRef<string[]>([]);
  const hidx = useRef(0);
  const booted = useRef(false);
  const asciiRef = useRef(asciiDefault);
  const streaming = useRef(false);
  const streamTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pinRaf = useRef(0);

  // While output streams, a single long line grows (wraps) without changing the
  // `lines` array, so the [lines,input] scroll effect never fires mid-line. Pin
  // the body to the bottom every frame so the view follows the text — but only
  // while the reader is already near the bottom, so manual scroll-up isn't hijacked.
  const pinToBottom = () => {
    const b = bodyRef.current;
    if (b && b.scrollHeight - b.scrollTop - b.clientHeight < 160) b.scrollTop = b.scrollHeight;
    if (streaming.current) pinRaf.current = requestAnimationFrame(pinToBottom);
    else pinRaf.current = 0;
  };

  const push = (node: ReactNode) => setLines((ls) => [...ls, { id: idRef.current++, node }]);
  const pushMany = (nodes: ReactNode[]) =>
    setLines((ls) => [...ls, ...nodes.map((n) => ({ id: idRef.current++, node: n }))]);

  const ctx: TermCtx = {
    toggleAscii: () => {
      asciiRef.current = !asciiRef.current;
      setAscii(asciiRef.current);
    },
    get asciiNext() {
      return asciiRef.current;
    },
    runMatrix: () => {
      push(<MatrixRainNode />);
      streamTimers.current.push(
        setTimeout(
          () =>
            pushMany([
              <span key="wake">
                {tOk('wake up.')} {tDim('follow the white rabbit ↗')}
              </span>,
              <span key="wake-sp">&nbsp;</span>,
            ]),
          3100,
        ),
      );
    },
  };

  // stream rich output lines one-by-one with a typewriter effect, then a
  // trailing blank line. very long lines (ascii art) print instantly.
  const typeOut = (nodes: ReactNode[]) => {
    if (prefersReducedMotion()) {
      pushMany(nodes);
      pushMany([<span key="sp">&nbsp;</span>]);
      return;
    }
    streaming.current = true;
    if (!pinRaf.current) pinRaf.current = requestAnimationFrame(pinToBottom);
    let i = 0;
    const next = () => {
      if (i >= nodes.length) {
        push(<span>&nbsp;</span>);
        streaming.current = false;
        return;
      }
      const node = nodes[i++];
      // components, <pre> blocks, and zero-text/very-long decorative rows that
      // the char-slicer can't gate dump instantly; plain prose types out.
      const isComponent = isValidElement(node) && typeof node.type === 'function';
      if (isComponent || containsPre(node) || nodeTextLen(node) === 0 || nodeTextLen(node) > 600) {
        push(node);
        streamTimers.current.push(setTimeout(next, 42));
      } else {
        const sp = nodeTextLen(node) > 90 ? 4 : 7;
        push(
          <TypeOut
            node={node}
            speed={sp}
            onDone={() => streamTimers.current.push(setTimeout(next, 36))}
          />,
        );
      }
    };
    next();
  };

  const run = (raw: string) => {
    const cmd = raw.trim();
    push(
      <span className="row">
        <Ps1 />
        {cmd}
      </span>,
    );
    if (cmd) {
      hist.current.push(cmd);
      hidx.current = hist.current.length;
    }
    const out = resolveCommand(cmd, ctx);
    if (out === 'CLEAR') {
      setLines([]);
      return;
    }
    if (out === 'BANNER') {
      typeOut(bannerLines());
      return;
    }
    if (out.length) typeOut(out);
    else push(<span>&nbsp;</span>);
  };

  // boot / system-check sequence — lines type out one char at a time. Held
  // until `start` (the section scrolls into view) so the typewriter plays after
  // the scanline sweep reveals the empty terminal, not on page load.
  useEffect(() => {
    if (!start || booted.current) return;
    booted.current = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const reduce = prefersReducedMotion();
    // motion-OK users see the scan sweep first, so wait for it to clear before
    // typing; reduced-motion users have no sweep, so start right away.
    const leadIn = reduce ? 0 : SCAN_LEAD_MS;
    const bootData: { text: string; cls: string; tail?: ReactNode }[] = [
      { text: 'booting eduardo.portfolio …', cls: 'tm-boot' },
      { text: 'mounting /about', cls: 'tm-okk' },
      { text: 'loading profile.json', cls: 'tm-okk' },
      { text: 'initializing skills[]', cls: 'tm-okk' },
      { text: 'establishing connection … ', cls: 'tm-okk', tail: <span className="tm-ok">online</span> },
    ];

    const afterBoot = () => {
      push(<span>&nbsp;</span>);
      pushMany(bannerLines());
      let acc = 220;
      autoRun.forEach((command) => {
        if (reduce) {
          // reduced-motion: run instantly, skip the per-char input typing.
          timers.push(setTimeout(() => run(command), acc));
          acc += 80;
          return;
        }
        const startAt = acc;
        command.split('').forEach((_, ci) =>
          timers.push(setTimeout(() => setInput(command.slice(0, ci + 1)), startAt + ci * 38)),
        );
        acc = startAt + command.length * 38 + 180;
        timers.push(
          setTimeout(() => {
            run(command);
            setInput('');
          }, acc),
        );
        acc += 140;
      });
      timers.push(
        setTimeout(() => {
          setLocked(false);
          inputRef.current?.focus({ preventScroll: true });
        }, acc),
      );
    };

    if (reduce) {
      bootData.forEach((b) =>
        push(
          <span className={b.cls}>
            {b.text}
            {b.tail}
          </span>,
        ),
      );
      afterBoot();
      return () => timers.forEach(clearTimeout);
    }

    let idx = 0;
    const typeNext = () => {
      if (idx >= bootData.length) {
        timers.push(setTimeout(afterBoot, 150));
        return;
      }
      const b = bootData[idx++];
      if (!b) return;
      push(
        <TypeLine
          text={b.text}
          className={b.cls}
          tail={b.tail}
          onDone={() => timers.push(setTimeout(typeNext, 70))}
        />,
      );
    };
    timers.push(setTimeout(typeNext, leadIn + 120));
    return () => timers.forEach(clearTimeout);
    // Boot must run exactly once (guarded by booted.current); re-checks only when
    // `start` flips. All other referenced setters/refs are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  // auto-scroll to bottom on new output. Never set scroll-behavior:smooth on
  // the body element — it silently breaks this programmatic scroll in Chromium.
  useEffect(() => {
    const b = bodyRef.current;
    if (b) b.scrollTo({ top: b.scrollHeight, behavior: 'auto' });
  }, [lines, input, bodyRef]);

  // clean up any in-flight stream timers / rAF on unmount
  useEffect(
    () => () => {
      streamTimers.current.forEach(clearTimeout);
      if (pinRaf.current) cancelAnimationFrame(pinRaf.current);
    },
    [],
  );

  // ghost autocomplete suggestion
  const ghost = useMemo(() => {
    const v = input;
    if (!v || /\s/.test(v)) return '';
    const m = COMMANDS.find((c) => c.startsWith(v) && c !== v);
    return m ? m.slice(v.length) : '';
  }, [input]);

  const accept = () => {
    if (ghost) setInput(input + ghost);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (streaming.current) {
        e.preventDefault();
        return;
      }
      run(input);
      setInput('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      accept();
    } else if (e.key === 'ArrowRight') {
      const el = e.currentTarget;
      if (ghost && el.selectionStart === input.length) {
        e.preventDefault();
        accept();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hist.current.length) {
        hidx.current = Math.max(0, hidx.current - 1);
        setInput(hist.current[hidx.current] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      hidx.current = Math.min(hist.current.length, hidx.current + 1);
      setInput(hist.current[hidx.current] || '');
    }
  };

  const focus = () => inputRef.current?.focus({ preventScroll: true });

  return { lines, input, setInput, ghost, locked, ascii, onKeyDown, run, focus };
}

export type Terminal = ReturnType<typeof useTerminal>;
