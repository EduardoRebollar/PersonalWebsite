/* eslint-disable react/jsx-key -- Command outputs are authored as arrays of
   bare JSX lines for readability; each line is assigned a stable numeric `id`
   key when wrapped into a scrollback row in useTerminal (push/pushMany), so the
   runtime keys are correct and the static rule is a false positive here. */

/**
 * Terminal engine for the About section — command registry + typewriter
 * helpers, ported from the design handoff (term-engine.jsx) to strict TS.
 *
 * Multi-color syntax mapping (resolved via the .about-terminal local token
 * block in globals.css): indigo accent · teal secondary · amber warn ·
 * green chart-5 · pink chart-4 · dim muted-foreground.
 */

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { projects } from '@/content/data/projects';
import { site } from '@/content/data/site';
import { hasMDX } from '@/lib/mdx';

/* ---- styled inline fragments --------------------------------------- */
const tOk = (t: ReactNode) => <span className="tm-ok">{t}</span>;
const tAcc = (t: ReactNode) => <span className="tm-acc">{t}</span>;
const tDim = (t: ReactNode) => <span className="tm-dim">{t}</span>;
const tWn = (t: ReactNode) => <span className="tm-warnc">{t}</span>;
const tKey = (t: ReactNode) => <span className="tm-key">{t}</span>;

const colRow = (name: ReactNode, desc: ReactNode, w = '11ch') => (
  <span>
    <span className="tm-acc" style={{ display: 'inline-block', width: w }}>
      {name}
    </span>
    {tDim(desc)}
  </span>
);

export { tOk, tDim, tAcc };

/* one skill group: domain label (teal) + the real tools, ·-separated. */
const skillGroupRow = (label: string, items: string[]) => (
  <span className="tm-skillg">
    <span className="sg-label">{tKey(label)}</span>
    <span className="sg-items">
      {items.map((t, i) => (
        <span key={i}>
          {i ? tDim(' · ') : ''}
          {tAcc(t)}
        </span>
      ))}
    </span>
  </span>
);

/* mirrors content/data/skills.ts (technical groups). */
const SKILL_GROUPS: { label: string; items: string[] }[] = [
  { label: 'languages', items: ['Python', 'TypeScript', 'JavaScript', 'Node.js', 'Java', 'SQL', 'R', 'HTML/CSS'] },
  { label: 'ml / data', items: ['PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'spaCy', 'NLTK', 'Jupyter', 'Snowflake', 'Tableau', 'Stata'] },
  { label: 'frameworks', items: ['Next.js', 'React', 'Flask', 'Leaflet', 'Tailwind'] },
  { label: 'dev tools', items: ['Git', 'GitHub', 'VS Code', 'Vercel', 'LaTeX', 'Windows', 'macOS'] },
];

/* journey — a git-graph-style timeline. */
const jNode = (year: string, head: ReactNode) => (
  <span className="tm-jrow">
    <span className="jspine jnode">●</span>
    <span className="jyear">{tAcc(year)}</span>
    <span className="jhead">{head}</span>
  </span>
);
const jBody = (text: ReactNode) => (
  <span className="tm-jrow">
    <span className="jspine">│</span>
    <span className="jyear" />
    <span className="jtext">{tDim(text)}</span>
  </span>
);
const jMeta = (text: ReactNode) => (
  <span className="tm-jrow">
    <span className="jspine">│</span>
    <span className="jyear" />
    <span className="jtext jmeta">{text}</span>
  </span>
);

/* Drawn from Eduardo's essays + the repo's education / experience data. */
const JOURNEY: { y: string; h: string; m: string; b: string[] }[] = [
  { y: '2017', h: 'a PSAT in 7th grade cracks a door open', m: 'Bell, CA · the unexpected beginning',
    b: ["didn't think much of one Saturday-morning test — it quietly turned out to be the start of everything that followed."] },
  { y: '2018', h: 'Johns Hopkins CTY — astronomy, a first flight, a second family', m: "summers '18 & '19 · UC Santa Cruz, then Seattle",
    b: ['met scholars from China, India, all over the U.S. — learned the night sky, and learned how to belong somewhere brand new.',
        'it was in Seattle that I first discovered engineering — the moment the question shifted from what is out there to how do we build it.'] },
  { y: '2019', h: 'first build — a robotic car in an after-school class', m: 'middle-school robotics',
    b: ['wired together on a school Chromebook that froze if I opened a few tabs. the constraints made me patient with my tools and curious about what ran underneath.'] },
  { y: '2022', h: 'Tech 360 — my first real websites', m: 'summer 2022 · remote web-dev program',
    b: ['my first taste of turning structure and style into something that actually loads in a browser — and I found I liked helping classmates debug theirs as much as building my own.'] },
  { y: '2023', h: 'Bell Senior High — Track, Cross Country & two LA Marathons', m: '2019–2023 · Gifted STEM Magnet · first-generation',
    b: ['ran for my school and my neighborhood, proud to represent where I come from. my mom was the reason I crossed both finish lines.'] },
  { y: '2023', h: 'Occidental College — B.S. Computer Science & Economics', m: "2023–present · Dean's List",
    b: ['first in my family on this path, following a cousin who showed me it was possible. machine learning, NLP & econometrics — the seam of messy data and clear questions.'] },
  { y: '2023', h: 'STEAM:CODERS — Student Intern', m: 'Aug–Nov 2023 · Pasadena, CA',
    b: ['built an ETL pipeline into Snowflake with Pandas/Seaborn dashboards so a STEM-education nonprofit could answer its own questions.'] },
  { y: '2024', h: 'College Match LA — Software Development Intern', m: 'May–Aug 2024 · Los Angeles, CA',
    b: ['shipped an alumni-networking portal on Softr + Airtable to thousands of scholars; mentored the next first-gen applicants the way I was once mentored.'] },
  { y: '2024', h: 'Occidental College ITS — Student Technical Support', m: 'Aug 2024–present · Los Angeles, CA',
    b: ['frontline help for students & faculty across two campuses — repairs, Active Directory, deployments.'] },
  { y: 'now', h: 'senior comps — how interactivity shapes the way we read data', m: 'Occidental College · ongoing research',
    b: ['a task-based study on static vs. interactive dashboards — still chasing the question from that robotics class: how does this actually work, and who can it help?'] },
];

/* projects — built from the real project data so it stays in sync. */
const shorten = (s: string, max = 74): string => {
  if (s.length <= max) return s;
  const cut = s.lastIndexOf(' ', max);
  return s.slice(0, cut > 0 ? cut : max).trimEnd() + '…';
};
const projectRows = (): ReactNode[] =>
  projects.map((p) => {
    const internal = hasMDX(p.slug);
    const href = internal
      ? `/work/${p.slug}`
      : p.links?.repo ?? p.links?.demo ?? p.links?.live ?? `/work/${p.slug}`;
    const name = internal ? (
      <Link className="tm-inline-link" href={href}>
        {p.slug}
      </Link>
    ) : (
      <a className="tm-inline-link" href={href} target="_blank" rel="noopener noreferrer">
        {p.slug}
      </a>
    );
    return (
      <span className="tm-projrow">
        <span className="pj-name">{name}</span>
        <span className="pj-desc">{tDim(shorten(p.tagline))}</span>
      </span>
    );
  });

const BIO_PARAGRAPHS: string[] = [
  "I'm Eduardo, a Computer Science & Economics student at Occidental College working across machine learning, data, and the web.",
  "The first thing I built that felt like mine was a small robotic car wired together in an after-school class, on a Chromebook that couldn't hold more than a few tabs open. The constraints made me patient with my tools and curious about what was happening underneath them — habits I still lean on.",
  "These days I'm drawn to problems at the seam of messy data and clear questions — training models, pulling structure out of noise, and wrapping it all in something someone can actually use. Economics keeps me honest about why a result matters; the web is how I get it in front of people.",
];

export const COMMAND_NAMES = [
  'help', 'whoami', 'about', 'skills', 'focus', 'projects', 'journey',
  'contact', 'resume', 'portrait', 'neofetch', 'date',
  'banner', 'clear', 'matrix', 'coffee', 'echo', 'fortune', 'run', 'vim', 'hello', 'extras',
] as const;

/* ---- prompt + easter egg ------------------------------------------- */
export function Ps1() {
  return (
    <span className="tm-ps1">
      <span className="usr">eduardo</span>
      <span className="at">@portfolio</span>
      <span className="at">:</span>
      <span className="pth">~/about</span>
      <span className="sym">$</span>{' '}
    </span>
  );
}

function MatrixRain({ cols = 56, rows = 9, ms = 3000 }: { cols?: number; rows?: number; ms?: number }) {
  const [grid, setGrid] = useState('');
  useEffect(() => {
    const chars = 'アイウエオカキクケコサシスセソ01<>/\\|=+*';
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      let s = '';
      for (let y = 0; y < rows; y++) {
        let r = '';
        for (let x = 0; x < cols; x++) r += Math.random() < 0.5 ? chars[(Math.random() * chars.length) | 0] : ' ';
        s += r + '\n';
      }
      setGrid(s);
      if (now - t0 < ms) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cols, rows, ms]);
  return <pre className="tm-matrix">{grid}</pre>;
}

/* ---- the banner box ------------------------------------------------- */
export const bannerLines = (): ReactNode[] => [
  <div className="tm-bannerbox">
    <span className="ttl">eduardo@portfolio</span>
    <span className="sub">the person behind the work · v3.0</span>
  </div>,
  <span className="tm-dim">
    type <span className="tm-acc">help</span> to view commands
  </span>,
  <span>&nbsp;</span>,
];

/* ---- command registry ---------------------------------------------- */
export type TermCtx = {
  toggleAscii: () => void;
  asciiNext: boolean;
  runMatrix: () => void;
};
export type CommandResult = ReactNode[] | 'CLEAR' | 'BANNER';

export function MatrixRainNode() {
  return <MatrixRain />;
}

export function resolveCommand(raw: string, ctx: TermCtx): CommandResult {
  const cmd = raw.trim().toLowerCase();
  const [name, ...args] = cmd.split(/\s+/);
  const rest = args.join(' ');
  const social = (label: string) => site.socials.find((s) => s.label === label);

  switch (name) {
    case '':
      return [];
    case 'help':
    case '?':
      return [
        tDim('commands — type one, or press TAB to autocomplete:'),
        colRow('whoami', 'the short version'),
        colRow('about', 'the longer story'),
        colRow('skills', 'what I work with'),
        colRow('projects', 'things I’ve built'),
        colRow('journey', 'how I got here'),
        colRow('contact', 'how to reach me'),
        colRow('resume', 'open resume.pdf'),
        colRow('portrait', 'toggle ascii / photo'),
        colRow('clear', 'clear the screen'),
        colRow('extras', 'everything else — the full menu'),
      ];
    case 'extras':
    case 'more':
      return [
        tDim('// extra commands — the rest of the menu:'),
        colRow('focus', 'what I’m working on now', '10ch'),
        colRow('neofetch', 'system-style summary', '10ch'),
        colRow('date', 'current date & time', '10ch'),
        colRow('banner', 'reprint the welcome banner', '10ch'),
        colRow('echo', 'echo back any text', '10ch'),
        colRow('fortune', 'a line I try to live by', '10ch'),
        colRow('run', 'a runner’s confession', '10ch'),
        colRow('vim', 'help, I’m stuck', '10ch'),
        colRow('matrix', 'follow the white rabbit', '10ch'),
        colRow('coffee', 'brew a cup', '10ch'),
      ];
    case 'whoami':
    case 'who':
      return [
        <span>
          {tOk('Eduardo Rebollar')} {tDim('·')} CS &amp; Economics @ Occidental College
        </span>,
        tDim('Los Angeles, CA — building at the seam of ML, data & the web.'),
      ];
    case 'about':
    case 'cat':
    case 'story':
      return BIO_PARAGRAPHS.map((p) => <span className="tm-out">{p}</span>);
    case 'skills':
      return [
        tDim('// what I build with — by domain'),
        ...SKILL_GROUPS.map((g) => skillGroupRow(g.label, g.items)),
        <span>
          {tDim('→ run')} {tAcc('focus')} {tDim('for what I’m on now')}
        </span>,
      ];
    case 'focus':
    case 'now':
      return [
        tDim('// what’s on my desk right now'),
        <span>
          {tAcc('▸')} {tOk('senior comps')} {tDim('— a task-based study on how interactivity changes the way we read data')}
        </span>,
        <span>
          {tAcc('▸')} {tOk('personal builds')} {tDim('— side projects like this site: next.js, motion & a terminal that talks back')}
        </span>,
        <span>
          {tAcc('▸')} {tDim('tech support @ Occidental ITS — keeping the campus running')}
        </span>,
        <span>&nbsp;</span>,
        <span>
          {tDim('→ run')} {tAcc('projects')} {tDim('to see what’s shipping, or')} {tAcc('journey')} {tDim('for the full arc')}
        </span>,
      ];
    case 'projects':
    case 'work':
    case 'ls':
      return [
        tDim('drwxr-xr-x   projects/'),
        ...projectRows(),
        <span>
          {tDim('→ scroll to')} {tAcc('work')} {tDim('to browse the full case studies')}
        </span>,
      ];
    case 'journey':
    case 'timeline':
      return [
        tDim('// how I got here'),
        ...JOURNEY.flatMap((e) => [jNode(e.y, e.h), jMeta(e.m), ...e.b.map((t) => jBody(t))]),
        <span>
          {tDim('→ run')} {tAcc('projects')} {tDim('to see what came of it, or')} {tAcc('contact')} {tDim('to say hi')}
        </span>,
      ];
    case 'contact':
    case 'email':
      return [
        <span>
          {tOk('let’s talk.')} {tDim('I’m always up for a good conversation — about ML, data, a project, or a role.')}
        </span>,
        tDim('the fastest way to reach me is below — I read everything and reply.'),
        <span>&nbsp;</span>,
        colRow('email', <a className="tm-inline-link" href={`mailto:${site.email.primary}`}>{site.email.primary}</a>),
        colRow('oxy', <a className="tm-inline-link" href={`mailto:${site.email.secondary}`}>{site.email.secondary}</a>),
        colRow('github', <a className="tm-inline-link" href={social('GitHub')?.href} target="_blank" rel="noopener noreferrer">github.com/EduardoRebollar</a>),
        colRow('linkedin', <a className="tm-inline-link" href={social('LinkedIn')?.href} target="_blank" rel="noopener noreferrer">in/eduardo-rebollar</a>),
        <span>&nbsp;</span>,
        <span>
          {tDim('// based in Los Angeles, CA — open to opportunities. talk soon ')}
          {tAcc(':)')}
        </span>,
      ];
    case 'resume':
    case 'cv':
    case 'open':
      return [
        <span>
          {tOk('↗')} opening{' '}
          <a className="tm-inline-link" href={site.resumeHref} target="_blank" rel="noopener noreferrer">
            resume.pdf
          </a>{' '}
          …
        </span>,
      ];
    case 'portrait':
    case 'img':
      ctx.toggleAscii();
      return [
        <span>
          {tOk('✓')} portrait → {tAcc(ctx.asciiNext ? 'ascii' : 'photo')} {tDim('· see the panel →')}
        </span>,
      ];
    case 'neofetch':
      return [
        <span>
          {tAcc('eduardo')}
          <span className="tm-dim">@portfolio</span>
        </span>,
        tDim('────────────────────────────'),
        colRow('host', 'Occidental College · senior', '11ch'),
        colRow('os', 'curiosity-driven, constraint-tested', '11ch'),
        colRow('kernel', 'CS · Economics, dual major', '11ch'),
        colRow('uptime', '3 years building · since a 7th-grade PSAT', '11ch'),
        colRow('packages', '40+ tools installed (run skills)', '11ch'),
        colRow('shell', 'ML · Data · Web', '11ch'),
        colRow('editor', 'VS Code · Jupyter · LaTeX', '11ch'),
        colRow('langs', 'Python · TypeScript · SQL · R', '11ch'),
        colRow('stack', 'Next.js · React · PyTorch · Flask', '11ch'),
        colRow('memory', 'first-gen · Bell, CA → Los Angeles', '11ch'),
        colRow('location', 'Los Angeles, CA', '11ch'),
        colRow('coffee', 'always brewing (run coffee)', '11ch'),
        <span>
          <span className="tm-acc" style={{ display: 'inline-block', width: '11ch' }}>status</span>
          {tOk('● ')}open to work
        </span>,
      ];
    case 'date':
      return [tDim(new Date().toString())];
    case 'banner':
    case 'motd':
      return 'BANNER';
    case 'clear':
    case 'cls':
      return 'CLEAR';
    case 'matrix':
      ctx.runMatrix();
      return [tDim('entering the construct…')];
    case 'coffee':
    case 'brew':
      return [
        <pre className="tm-coffee">{"      ( (\n       ) )\n    .______.\n    |      |]   brewing… ☕\n    \\      /\n     `----'"}</pre>,
      ];
    case 'echo':
      return [<span className="tm-out">{rest}</span>];
    case 'fortune': {
      const fs = [
        'the constraints made me patient with my tools.',
        'how does this actually work — and who can it help?',
        'data is messy; the questions don’t have to be.',
        'ship it, then make it kind.',
        'first-gen energy: figure it out, then hold the door open.',
      ];
      return [
        <span>
          {tDim('“')}
          {tOk(fs[(Math.random() * fs.length) | 0])}
          {tDim('”')}
        </span>,
      ];
    }
    case 'run':
    case 'jog':
      return [
        <span>
          {tAcc('▸')} {tDim('2 LA Marathons logged · Track & Cross Country @ Bell')}
        </span>,
        tDim('still chasing finish lines — in code and on foot.'),
      ];
    case 'vim':
    case ':q':
    case ':wq':
    case ':q!':
    case 'nano':
    case 'emacs':
      return [
        <span>
          {tWn('you’re trapped.')} {tDim('to escape, type')} {tAcc('clear')} {tDim('— works every time.')}
        </span>,
      ];
    case 'hello':
    case 'hi':
    case 'hey':
      return [
        <span>
          {tOk('hey there.')} {tDim('glad you stopped by — try')} {tAcc('whoami')} {tDim('or')} {tAcc('contact')}
          {tDim('.')}
        </span>,
      ];
    default:
      return [
        <span>
          {tWn('command not found:')} {name}. type {tAcc('help')}.
        </span>,
      ];
  }
}

/* ====================================================================
   Typewriter — streams rich (JSX) output lines char-by-char.
   ==================================================================== */

type PropsWithChildren = { children?: ReactNode };
const childrenOf = (el: ReactElement): ReactNode => (el.props as PropsWithChildren).children;

/* true if the node tree contains a <pre> (ascii art / coffee) — print instantly. */
function containsPre(node: ReactNode): boolean {
  if (node == null || typeof node === 'boolean') return false;
  if (Array.isArray(node)) return node.some((c) => containsPre(c as ReactNode));
  if (isValidElement(node)) {
    if (node.type === 'pre') return true;
    return containsPre(childrenOf(node));
  }
  return false;
}

/* total count of visible text characters inside an arbitrary node tree */
function nodeTextLen(node: ReactNode): number {
  if (node == null || typeof node === 'boolean') return 0;
  if (typeof node === 'string' || typeof node === 'number') return String(node).length;
  if (Array.isArray(node)) return node.reduce((a: number, c) => a + nodeTextLen(c as ReactNode), 0);
  if (isValidElement(node)) return nodeTextLen(childrenOf(node));
  return 0;
}

/* return [node revealed to `budget` chars, remaining budget] */
function sliceNode(node: ReactNode, budget: number): [ReactNode, number] {
  if (budget <= 0) return [null, 0];
  if (node == null || typeof node === 'boolean') return [node, budget];
  if (typeof node === 'string' || typeof node === 'number') {
    const s = String(node);
    return s.length <= budget ? [s, budget - s.length] : [s.slice(0, budget), 0];
  }
  if (Array.isArray(node)) {
    const items = node as ReactNode[];
    const out: ReactNode[] = [];
    let b = budget;
    for (let i = 0; i < items.length; i++) {
      const [sc, nb] = sliceNode(items[i], b);
      out.push(isValidElement(sc) ? cloneElement(sc, { key: sc.key ?? i }) : sc);
      b = nb;
      if (b <= 0) break;
    }
    return [out, b];
  }
  if (isValidElement(node)) {
    const [child, nb] = sliceNode(childrenOf(node), budget);
    return [cloneElement(node, undefined, child), nb];
  }
  return [node, budget];
}

/* Inject the streaming caret inside the deepest last text-bearing element so it
   trails the actual last-typed character (a sibling after the node breaks for
   inline-grid rows like skills/journey). Returns [newNode, placed]. */
function appendCaretDeep(node: ReactNode, caret: ReactElement): [ReactNode, boolean] {
  if (node == null || typeof node === 'boolean') return [node, false];
  if (typeof node === 'string' || typeof node === 'number') return [node, false];
  if (Array.isArray(node)) {
    const arr = (node as ReactNode[]).slice();
    let idx = -1;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (nodeTextLen(arr[i]) > 0) { idx = i; break; }
    }
    if (idx === -1) {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (isValidElement(arr[i])) { idx = i; break; }
      }
    }
    if (idx === -1) return [arr, false];
    const [nn, placed] = appendCaretDeep(arr[idx], caret);
    if (placed) {
      arr[idx] = nn;
      return [arr, true];
    }
    arr.splice(idx + 1, 0, caret); // child was a bare string leaf — caret right after it
    return [arr, true];
  }
  if (isValidElement(node)) {
    const [nc, placed] = appendCaretDeep(childrenOf(node), caret);
    if (placed) return [cloneElement(node, undefined, nc), true];
    const kids = Children.toArray(childrenOf(node));
    kids.push(caret);
    return [cloneElement(node, undefined, kids), true];
  }
  return [node, false];
}

/* types out a plain-text line char-by-char, then calls onDone */
export function TypeLine({
  text,
  className = '',
  tail = null,
  speed = 26,
  onDone,
}: {
  text: string;
  className?: string;
  tail?: ReactNode;
  speed?: number;
  onDone?: () => void;
}) {
  const [n, setN] = useState(0);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });
  // Only mounted when motion is allowed — useTerminal gates reduced-motion
  // upstream (boot prints instantly, command output bypasses the typewriter).
  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let i = 0;
    const step = () => {
      if (cancelled) return;
      i++;
      setN(i);
      if (i < text.length) timers.push(setTimeout(step, speed));
      else doneRef.current?.();
    };
    timers.push(setTimeout(step, speed));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [text, speed]);
  const typing = n < text.length;
  return (
    <span className={className}>
      {text.slice(0, n)}
      {typing ? <span className="tm-blockcaret" /> : tail}
    </span>
  );
}

/* types out one rich (JSX) line char-by-char, then calls onDone */
export function TypeOut({ node, speed = 11, onDone }: { node: ReactNode; speed?: number; onDone?: () => void }) {
  const total = useMemo(() => nodeTextLen(node), [node]);
  const [n, setN] = useState(0);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });
  // Only mounted with 0 < total <= 600 chars when motion is allowed — useTerminal
  // routes zero-text / oversized / reduced-motion lines elsewhere.
  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const step = () => {
      if (cancelled) return;
      i++;
      setN(i);
      if (i < total) timers.push(setTimeout(step, speed));
      else doneRef.current?.();
    };
    timers.push(setTimeout(step, speed));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [total, speed]);
  const [sliced] = sliceNode(node, n);
  if (n < total) {
    const caret = <span className="tm-blockcaret" key="__caret" />;
    const [withCaret, placed] = appendCaretDeep(sliced, caret);
    return (
      <span>
        {placed ? (
          withCaret
        ) : (
          <>
            {sliced}
            {caret}
          </>
        )}
      </span>
    );
  }
  return <span>{sliced}</span>;
}

export { containsPre, nodeTextLen };
