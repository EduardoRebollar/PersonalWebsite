import type { SkillGroup } from '@/types/content';

export const skills: SkillGroup[] = [
  {
    label: 'Languages',
    items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'SQL', 'HTML/CSS', 'R'],
  },
  {
    label: 'ML / Data',
    items: ['PyTorch', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter', 'Snowflake'],
  },
  {
    label: 'Frameworks',
    items: ['Next.js', 'React', 'Flask', 'Leaflet', 'Tailwind'],
  },
  {
    label: 'Tools',
    items: ['Git', 'GitHub', 'Airtable', 'Softr', 'Active Directory', 'Linux', 'macOS'],
  },
  {
    label: 'Coursework',
    items: [
      'Data Structures',
      'NLP',
      'Linear Algebra',
      'Discrete Math',
      'Statistics',
      'Applied Econometrics',
      'Game Theory',
      'Social Data Science',
      'Computer Organization',
    ],
  },
  {
    label: 'Other',
    items: ['Bilingual (English / Spanish)', 'Mentorship', 'Technical Writing'],
  },
];
