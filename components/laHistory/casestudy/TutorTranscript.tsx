'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { caseStudy } from '@/content/data/laHistory/caseStudy';
import { easing } from '@/lib/motion';
import { Arrow } from './icons';

const wordsContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.028, delayChildren: 0.04 } },
};
const wordItem: Variants = {
  hidden: { opacity: 0, y: 4, filter: 'blur(3px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.32, ease: easing.outExpo } },
};

/** Tutor utterances reveal word-by-word; student replies appear as a block. */
function WordReveal({ text }: { text: string }) {
  return (
    <motion.div className="utt" variants={wordsContainer} initial="hidden" animate="show">
      {text.split(' ').map((w, i) => (
        <motion.span
          key={i}
          variants={wordItem}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {w + ' '}
        </motion.span>
      ))}
    </motion.div>
  );
}

/**
 * Live, steppable Socratic-tutor transcript. State machine (from the handoff):
 *   n      — turns revealed (starts at 1)
 *   typing — tutor "thinking" indicator
 * Advancing to a tutor turn shows the typing dots for 900ms first; advancing to
 * a student turn is immediate; once the script is exhausted the button replays.
 * Each new turn slides in, tutor text reveals per-word, and the footer status
 * pops on change — all collapsed to instant by the app-wide reduced-motion gate.
 */
export function TutorTranscript() {
  const demo = caseStudy.tutorDemo;
  const [n, setN] = useState(1);
  const [typing, setTyping] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const visible = demo.slice(0, n);
  const done = n >= demo.length;

  const advance = () => {
    if (done) {
      setN(1);
      return;
    }
    const next = demo[n];
    if (!next) return;
    if (next.who === 'tutor') {
      setTyping(true);
      timer.current = window.setTimeout(() => {
        setTyping(false);
        setN((v) => v + 1);
      }, 900);
    } else {
      setN((v) => v + 1);
    }
  };

  const nextWho = demo[n]?.who;
  const buttonLabel = done ? 'Replay' : nextWho === 'student' ? 'Student replies' : 'Tutor asks';
  const note = done
    ? 'concept-map edge added ✓'
    : typing
      ? 'tutor is thinking…'
      : 'ask, don’t tell';

  return (
    <div className="bs-transcript">
      <div className="bs-tr-bar">
        <span>Transcript · socratic_tutor.py</span>
        <span className="model">
          <i /> ollama · gemma
        </span>
      </div>
      <div className="bs-tr-feed" role="log" aria-live="polite" aria-label="Tutor transcript">
        {visible.map((m, i) => (
          <motion.div
            className={`bs-turn ${m.who}`}
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: easing.outExpo }}
          >
            <div className="spk">{m.who === 'tutor' ? 'Tutor' : 'Student'}</div>
            {m.who === 'tutor' ? <WordReveal text={m.text} /> : <div className="utt">{m.text}</div>}
          </motion.div>
        ))}
        {typing && (
          <motion.div
            className="bs-turn tutor"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: easing.outExpo }}
          >
            <div className="spk">Tutor</div>
            <div className="bs-typing" aria-label="Tutor is thinking">
              <i />
              <i />
              <i />
            </div>
          </motion.div>
        )}
      </div>
      <div className="bs-tr-foot">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={note}
            className="note"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25, ease: easing.outExpo }}
          >
            {note}
          </motion.span>
        </AnimatePresence>
        <button type="button" className="bs-step" onClick={advance} disabled={typing}>
          {buttonLabel}
          <Arrow s={13} />
        </button>
      </div>
    </div>
  );
}
