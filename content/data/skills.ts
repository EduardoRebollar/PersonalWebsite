import type { SkillCardGroup, SkillGroup } from '@/types/content';

export const skills: SkillGroup[] = [
  {
    label: 'Languages',
    items: ['Python', 'TypeScript', 'JavaScript', 'Node.js', 'Java', 'SQL', 'HTML/CSS', 'R'],
  },
  {
    label: 'ML / Data',
    items: [
      'PyTorch',
      'scikit-learn',
      'Pandas',
      'NumPy',
      'Matplotlib',
      'Seaborn',
      'spaCy',
      'NLTK',
      'Jupyter',
      'Snowflake',
      'Tableau',
      'Stata',
    ],
  },
  {
    label: 'Frameworks',
    items: ['Next.js', 'React', 'Flask', 'Leaflet', 'Tailwind'],
  },
  {
    label: 'Dev Tools',
    items: ['Git', 'GitHub', 'VS Code', 'Vercel', 'LaTeX', 'Active Directory', 'Windows', 'macOS'],
  },
  {
    label: 'Microsoft',
    items: ['Word', 'Excel', 'PowerPoint', 'Outlook', 'OneDrive'],
  },
  {
    label: 'Google Workspace',
    items: [
      'Google Docs',
      'Google Sheets',
      'Google Slides',
      'Google Forms',
      'Google Sites',
      'Google Drive',
    ],
  },
  {
    label: 'Communication',
    items: [
      'Gmail',
      'Google Calendar',
      'Google Meet',
      'Google Chat',
      'Zoom',
      'WhatsApp',
      'GroupMe',
      'Remind',
    ],
  },
  {
    label: 'Network & Creative',
    items: ['LinkedIn', 'Handshake', 'Notion', 'Airtable', 'Softr', 'Canva', 'Zotero'],
  },
];

/**
 * Coursework + Other — rendered as animated highlight cards (icon + gradient
 * title + descriptor) rather than the orbits or plain pills. `icon` is a lucide
 * component name resolved in components/ui/SkillHighlightCard.tsx.
 */
export const skillHighlights: SkillCardGroup[] = [
  {
    label: 'Coursework',
    items: [
      {
        name: 'Data Structures',
        descriptor: 'Trees, graphs, hashing, complexity',
        icon: 'Binary',
      },
      {
        name: 'NLP',
        descriptor: 'Sequence models, embeddings, spaCy/NLTK',
        icon: 'MessagesSquare',
      },
      {
        name: 'Linear Algebra',
        descriptor: 'Vectors, matrices, eigen-decomposition',
        icon: 'Grid3x3',
      },
      { name: 'Discrete Math', descriptor: 'Logic, proofs, combinatorics', icon: 'Hash' },
      { name: 'Statistics', descriptor: 'Inference, regression, distributions', icon: 'Sigma' },
      {
        name: 'Applied Econometrics',
        descriptor: 'Causal inference, panel models (Stata)',
        icon: 'TrendingUp',
      },
      { name: 'Game Theory', descriptor: 'Nash equilibria, strategic models', icon: 'Dices' },
      {
        name: 'Social Data Science',
        descriptor: 'Networks, computational social analysis',
        icon: 'Network',
      },
      {
        name: 'Computer Organization',
        descriptor: 'Assembly, memory, CPU architecture',
        icon: 'Cpu',
      },
    ],
  },
  {
    label: 'Other',
    items: [
      {
        name: 'Bilingual (Eng/Span)',
        descriptor: 'Native fluency — written & spoken',
        icon: 'Languages',
      },
      {
        name: 'Mentorship',
        descriptor: 'Peer tutoring & student leadership',
        icon: 'HeartHandshake',
      },
      { name: 'Technical Writing', descriptor: 'Case studies, research, docs', icon: 'PenLine' },
    ],
  },
];

/**
 * One-line blurbs for each orbital skill, surfaced in the click-to-reveal
 * SkillPopover (components/ui/SkillPopover.tsx). Keyed by the exact skill name;
 * looked up case-insensitively via `getSkillBlurb`. A side map (rather than
 * objects in `SkillGroup.items`) keeps the orbit + marquee code untouched.
 * Unmatched names degrade gracefully — the popover shows name + category only.
 */
export const skillBlurbs: Record<string, string> = {
  // Languages
  Python: 'My primary language — ML, data, and backend work.',
  TypeScript: 'Typed JavaScript for everything I ship to production.',
  JavaScript: 'The web runtime under all the front-end work.',
  'Node.js': 'Server-side JS for tooling, scripts, and APIs.',
  Java: 'OOP fundamentals and coursework data structures.',
  SQL: 'Querying and shaping relational data.',
  'HTML/CSS': 'Semantic markup and the styling foundation of the web.',
  R: 'Statistical computing and econometric analysis.',
  // ML / Data
  PyTorch: 'Building and training neural nets — my BiLSTM work.',
  'scikit-learn': 'Classic ML: pipelines, baselines, evaluation.',
  Pandas: 'The workhorse for wrangling tabular data.',
  NumPy: 'Vectorized numerical computing under everything.',
  Matplotlib: 'Plotting results and exploratory figures.',
  Seaborn: 'Statistical visualization on top of Matplotlib.',
  spaCy: 'Industrial-strength NLP pipelines and tokenization.',
  NLTK: 'Classic NLP toolkit for text processing.',
  Jupyter: 'Notebooks for iterative analysis and prototyping.',
  Snowflake: 'Cloud data warehousing and large-scale queries.',
  Tableau: 'Interactive dashboards and data storytelling.',
  Stata: 'Econometrics — panel models and causal inference.',
  // Frameworks
  'Next.js': 'The App Router framework behind this site.',
  React: 'Component model for every interface I build.',
  Flask: 'Lightweight Python APIs and quick backends.',
  Leaflet: 'Interactive maps — the LA History project.',
  Tailwind: 'Utility-first styling, used across this portfolio.',
  // Dev Tools
  Git: 'Version control for every project.',
  GitHub: 'Where my code lives, reviews, and ships from.',
  'VS Code': 'My daily editor and debugging home base.',
  Vercel: 'Where this site deploys on every push.',
  LaTeX: 'Typesetting papers, proofs, and research write-ups.',
  'Active Directory': 'Managing identity and access at ITS.',
  Windows: 'Primary OS for IT support and development.',
  macOS: 'Cross-platform development and support.',
  // Microsoft
  Word: 'Documents, reports, and formal writing.',
  Excel: 'Spreadsheets, modeling, and quick analysis.',
  PowerPoint: 'Decks for presentations and project pitches.',
  Outlook: 'Email and calendar in professional settings.',
  OneDrive: 'Cloud file sync across Microsoft tools.',
  // Google Workspace
  'Google Docs': 'Collaborative writing and shared drafts.',
  'Google Sheets': 'Lightweight collaborative spreadsheets.',
  'Google Slides': 'Quick collaborative presentation decks.',
  'Google Forms': 'Surveys and data collection.',
  'Google Sites': 'Simple internal sites and resource hubs.',
  'Google Drive': 'Cloud storage and file collaboration.',
  // Communication
  Gmail: 'Day-to-day professional email.',
  'Google Calendar': 'Scheduling and time management.',
  'Google Meet': 'Remote meetings and office hours.',
  'Google Chat': 'Team messaging within Workspace.',
  Zoom: 'Video calls for class, work, and tutoring.',
  WhatsApp: 'Quick coordination and group chats.',
  GroupMe: 'Student-group and club coordination.',
  Remind: 'Reaching students for tutoring and mentorship.',
  // Network & Creative
  LinkedIn: 'Professional networking and presence.',
  Handshake: 'Recruiting and campus opportunities.',
  Notion: 'Notes, docs, and project planning.',
  Airtable: 'Flexible databases for tracking projects.',
  Softr: 'No-code front-ends on top of Airtable.',
  Canva: 'Quick graphics and visual design.',
  Zotero: 'Reference management for research.',
};

/** Case-insensitive blurb lookup, mirroring `getIcon` in orbiting-skills.tsx. */
export function getSkillBlurb(name: string): string | undefined {
  const target = name.toLowerCase().trim();
  for (const key in skillBlurbs) {
    if (key.toLowerCase() === target) return skillBlurbs[key];
  }
  return undefined;
}
