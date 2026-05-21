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
