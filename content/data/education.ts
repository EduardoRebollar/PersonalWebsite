import type { EducationItem } from '@/types/content';

export const education: EducationItem[] = [
  {
    institution: 'Occidental College',
    credential: 'B.S. Computer Science & Economics',
    start: '2023-08',
    end: '2027-05',
    focus: ['Machine Learning', 'NLP', 'Econometrics', 'Data Structures'],
    honors: ["Dean's List, 2023 – present"],
    activities: ['Latine Student Union', 'Computer Science Club'],
  },
  {
    institution: 'College Match LA',
    credential: 'College Preparation Program',
    start: '2022-08',
    end: '2023-06',
    activities: [
      'College counseling',
      'Application workshops',
      'Personal-statement coaching',
    ],
  },
  {
    institution: 'Bell Senior High School',
    credential: 'High School Diploma',
    start: '2019-08',
    end: '2023-06',
    activities: [
      '4-Year Track & Field / Cross Country',
      'Two-time LA Marathon finisher (Students Run LA)',
    ],
  },
];
