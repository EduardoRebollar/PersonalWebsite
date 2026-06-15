// Editorial content for the LA History case-study "broadsheet" page
// (/work/la-history). Location + era data is reused from ./locations and ./eras;
// only the case-study prose, the four-version results, user-testing findings,
// reflections, productionization ledger, the scripted tutor exchange, and the
// gazetteer's curated display years / era labels live here.

import type { EraKey } from '@/types/laHistory';

export type CaseStudyMeta = {
  year: number;
  standfirst: string;
  team: readonly string[];
  /** The author's individual contribution — turns a group project into a personal case study. */
  myRole: string;
  course: string;
  school: string;
  links: { demo: string; paper: string; plan: string };
};

export type Theory = { name: string; gloss: string; body: string };
export type HardPart = { n: string; title: string; body: string };
export type LedgerRow = { k: string; v: string };
export type Criterion = { n: string; name: string; desc: string };
export type Version = { v: string; score: number; note: string };
export type Finding = { k: string; t: string; d: string };
export type Change = { t: string; d: string };
export type ReflectionPoint = { t: string; d: string };
export type TutorTurn = { who: 'tutor' | 'student'; text: string };

export type CaseStudyContent = {
  meta: CaseStudyMeta;
  whatItIs: string;
  bet: string;
  theories: readonly Theory[];
  whyLocal: string;
  stackProse: string;
  hardParts: readonly HardPart[];
  production: readonly LedgerRow[];
  results: {
    intro: string;
    scoreMax: number;
    criteria: readonly Criterion[];
    versions: readonly Version[];
    finding: string;
  };
  userTesting: {
    intro: string;
    findings: readonly Finding[];
    changes: readonly Change[];
  };
  reflections: {
    quote: string;
    points: readonly ReflectionPoint[];
  };
  tutorDemo: readonly TutorTurn[];
};

export const caseStudy: CaseStudyContent = {
  meta: {
    year: 2026,
    standfirst:
      'Teaching a city by making a player connect its places — not memorize them.',
    team: ['Eduardo Rebollar', 'Miranda Samayoa-Cobon', 'Joy Botros'],
    myRole:
      'I worked across the full stack — the Flask + SQLAlchemy backend, the Leaflet map and the era-unlock progression, and the Socratic tutor’s prompt design and four-version evaluation.',
    course: 'COMP 395 · AI and Learning Technologies',
    school: 'Occidental College',
    links: {
      demo: '/work/la-history/play',
      paper: '/projects/la-history/report.pdf',
      plan: '/projects/la-history/productionization.md',
    },
  },

  whatItIs:
    'LA History is an educational web game that walks a player through fifteen historical locations across Los Angeles — from Tongva and Kuruvungna villages, through Spanish missions and the Rancho period, to modern landmarks like the Watts Towers and the Bradbury Building. You move across an interactive Leaflet map, read a location’s history, take a short quiz, build a concept map of relationships between places, and — when you’re stuck — talk to a Socratic AI tutor that asks rather than answers.',
  bet:
    'We took the position that making connections is what produces lasting understanding — not reading facts once and moving on. The whole app is shaped around three theories of how learning works.',

  theories: [
    {
      name: 'Constructivism',
      gloss: 'Players build knowledge, they don’t receive it.',
      body:
        'Players don’t passively receive facts; they build knowledge by exploring, quizzing, and constructing concept maps. Every interaction has to produce a mental change in the player, or it isn’t earning its place.',
    },
    {
      name: 'Zone of Proximal Development',
      gloss: 'Vygotsky — the tutor asks, never tells.',
      body:
        'The Socratic tutor responds to your current concept map and chat history with a guiding question, not an answer. It pulls you forward into the next thing you almost know.',
    },
    {
      name: 'Schema theory',
      gloss: 'The concept map externalizes the schema.',
      body:
        'The concept map is where the player externalizes the schema they’re building — relationships between locations across eras (e.g. “Mission San Gabriel forcibly relocated Tongva from Kuruvungna”).',
    },
  ],

  whyLocal:
    'We ran the tutor on a local Ollama instance with gemma:latest. That keeps the prompt and chat history off third-party servers — which matters for an educational tool used by minors — and makes the tutor’s response style controllable rather than a moving target. The trade-off is real latency (a 4 GB model on a laptop is slow); in production you’d swap for an API.',

  stackProse:
    'The stack is deliberately boring: Flask 3 + SQLAlchemy 2 + SQLite for the backend, vanilla JavaScript and Leaflet for the frontend, Ollama on localhost:11434 for the LLM. No Node build, no bundler, no SPA framework — the whole app is a few hundred lines of templates and a handful of JS event handlers attached to map markers.',

  hardParts: [
    {
      n: '01',
      title: 'The era-unlock progression',
      body:
        'Locations are gated by era (Native → Spanish → Rancho → Modern). You can’t just hop to the Watts Towers — you have to demonstrate enough understanding of earlier eras first. That gating is a per-user state machine the database tracks alongside points and badges.',
    },
    {
      n: '02',
      title: 'The Socratic tutor’s prompt design',
      body:
        'The tutor’s system prompt isn’t “answer the student’s question.” It’s a contract: take the current concept-map state, ask a question that bridges what they have to what they don’t, and never reveal the connection directly. A lot of A/B testing until the model would consistently withhold answers and guide instead.',
    },
    {
      n: '03',
      title: 'The concept-map evaluator',
      body:
        'Every concept the player adds is scored by the LLM against the canonical relationships — “is this a real connection?” — but with partial credit for novel but defensible relationships. The evaluator returns structured JSON the app can grade against.',
    },
  ],

  production: [
    {
      k: 'Hosting',
      v: 'Containerized Flask on Fly.io — always-on, not serverless. The tutor streams tokens; cold starts are unacceptable when thirty students sign on at once.',
    },
    {
      k: 'Database',
      v: 'Managed Postgres (Fly or Supabase) replaces SQLite — SQLAlchemy makes the migration nearly free.',
    },
    {
      k: 'LLM',
      v: 'Claude Haiku 4.5 replaces local Ollama — sub-second first-token latency, holds the Socratic persona across long chats, ~$0.025 per session.',
    },
    {
      k: 'Privacy',
      v: 'Student chat is FERPA-relevant, so names never enter the API call — only conversation history. Encryption at rest, teacher-only review of flagged chats, semester-bound retention.',
    },
    {
      k: 'Cost & guardrails',
      v: '~$700 / month at 1,000 daily users. A ~15-message per-session cap controls cost variance — and keeps students on task instead of treating the tutor as a chatbot.',
    },
  ],

  results: {
    intro:
      'Before writing a single prompt we fixed four criteria and a 17-scenario test set, then scored four prompt versions — two independent local-model runs each, for 32 points per scenario.',
    scoreMax: 32,
    criteria: [
      {
        n: '01',
        name: 'Does not supply answers',
        desc: 'Withholds historical facts even when the student pushes, and guides them to build the knowledge instead. The core constructivist commitment.',
      },
      {
        n: '02',
        name: 'Asks clarifying questions',
        desc: 'Checks what the student already knows — and reads their current map state — before redirecting. The Zone of Proximal Development in practice.',
      },
      {
        n: '03',
        name: 'Encourages analysis',
        desc: 'Pushes past recall toward causation and comparison. “Why are these two connected?” beats “What is this thing?”',
      },
      {
        n: '04',
        name: 'Length & clarity',
        desc: 'Two or three sentences ending on one specific question that names the student’s next concept-map move.',
      },
    ],
    versions: [
      { v: 'v1', score: 21.9, note: 'Baseline contract — don’t state facts, ask questions.' },
      { v: 'v2', score: 22.3, note: 'Added rules; quietly regressed others.' },
      { v: 'v3', score: 25.6, note: 'Peak. Tightest balance across all four criteria.' },
      { v: 'v4', score: 24.5, note: 'More rules, slight regression.' },
    ],
    finding:
      'The most consistent lesson: negative constraints (“do not state facts”) are far easier to encode in language than generative ones (“let the student lead”) — and rule-stacking doesn’t compose. Each new version risked silently regressing a criterion an earlier one had stabilized.',
  },

  userTesting: {
    intro:
      'Four target-learner participants — high-school and college age, two from LA and two not, all recruited from outside the team — ran 20–25-minute think-aloud sessions on the map, the concept map, and the tutor.',
    findings: [
      {
        k: '01',
        t: 'Edge direction wasn’t self-explanatory',
        d: 'Three of four assumed connections were bidirectional. The tutor graded historical accuracy but never addressed the structural confusion.',
      },
      {
        k: '02',
        t: 'Nobody used the tutor naturally',
        d: 'Participants rarely started a conversation; when prompted they gave one-word replies or treated it like a search box. The Socratic design assumed engagement that didn’t happen on its own.',
      },
      {
        k: '03',
        t: 'Feedback quality was inconsistent',
        d: 'On a “seashells” edge between San Gabriel Valley and Ballona Wetlands, the tutor drifted off-topic. Helpfulness rated about 3.5 / 5.',
      },
      {
        k: '04',
        t: 'Learners wanted different amounts of guidance',
        d: 'Some preferred to work alone and ask on their own terms; others welcomed the steering. One setting didn’t fit everyone.',
      },
    ],
    changes: [
      {
        t: 'Re-scoped the tutor to the concept map',
        d: 'It now responds only to connections you’ve already built — no arbitrary Q&A — forcing every exchange to be task-relevant.',
      },
      {
        t: 'Taught the prompt about edge direction',
        d: 'The tutor now asks what a connection’s direction means before grading its history.',
      },
      {
        t: 'Redesigned the tutorial',
        d: 'A dim-and-highlight overlay on one screen instead of corner pop-ups, with a skip for returning users.',
      },
      {
        t: 'Cut the tutorial copy',
        d: 'Reduced to essential steps after “too many instructions” feedback.',
      },
    ],
  },

  reflections: {
    quote:
      'Building a good educational AI tool is much harder than building a good chatbot. The chatbot just needs to be helpful. The tutor needs to know when to be unhelpful, when to stay silent, and when to ask a question the student doesn’t want to answer but needs to.',
    points: [
      {
        t: 'Theory is easier to specify than to enforce',
        d: 'Each learning theory mapped cleanly to a feature on paper; closing the gap to a prompt that actually behaved that way was harder than expected.',
      },
      {
        t: 'We overestimated the appetite for Socratic teaching',
        d: 'Several participants wanted direct answers and less friction — they came to learn LA history, not to be interrogated about their own thinking.',
      },
      {
        t: 'Next version: a Browse Mode',
        d: 'Readable location articles with no quizzes or unlock gates, plus an opt-in tutor — so students choose guidance rather than have it imposed.',
      },
      {
        t: 'What we’d do differently: test earlier',
        d: 'The first session surfaced the tutorial, chat, and directionality problems we could have caught weeks sooner.',
      },
    ],
  },

  tutorDemo: [
    {
      who: 'tutor',
      text: 'You’ve unlocked Kuruvungna Springs and Mission San Gabriel. What do you think connected them?',
    },
    { who: 'student', text: 'They’re both old? I’m not sure.' },
    {
      who: 'tutor',
      text: 'Think about people, not just dates. When the mission was founded in 1771, where did its labor come from?',
    },
    { who: 'student', text: 'Oh — the Tongva from villages like Kuruvungna?' },
    {
      who: 'tutor',
      text: 'Now add that as an edge on your concept map. What word would you put on the line between them?',
    },
  ],
};

// Short, broadsheet-friendly era labels for the gazetteer badges + filter tabs
// (the data file's `eras` names "Tongva (Native)" etc. read long here).
export const eraLabels: Record<EraKey, string> = {
  native: 'Tongva',
  spanish: 'Spanish',
  rancho: 'Rancho',
  modern: 'Modern',
};

// Curated single display year per location for the gazetteer cards (keyed by
// slug). Editorial — not always the first event's year — so it lives here, not
// in the auto-generated locations data.
export const gazetteerYears: Record<string, string> = {
  'kuruvungna-springs': '~3000 BCE',
  'ballona-wetlands': '~1000 CE',
  'san-gabriel-foothills': '~900 CE',
  'el-pueblo': '1781',
  'mission-san-gabriel': '1771',
  'fort-moore-hill': '1847',
  'old-chinatown': '1870s',
  'bradbury-building': '1893',
  'hollenbeck-park': '1892',
  'la-placita-church': '1784',
  'watts-towers': '1921–1954',
  'griffith-observatory': '1935',
  'chavez-ravine': '1950–1962',
  'macarthur-park': '1890',
  'hollywood-sign': '1923',
};
