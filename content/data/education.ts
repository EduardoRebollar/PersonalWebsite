import type { EducationItem } from '@/types/content';

export const education: EducationItem[] = [
  {
    institution: 'Occidental College',
    credential: 'B.S. Computer Science & Economics',
    start: '2023-08',
    end: '2027-05',
    focus: ['Machine Learning', 'NLP', 'Econometrics', 'Data Structures', 'Algorithms', 'Statistics'],
    honors: ["Dean's List, 2023 – present"],
    activities: ['Latine Student Union', 'Computer Science Club'],
    images: [
      {
        src: '/journey/occidental-college.jpg',
        alt: 'Eduardo presenting his data-visualization interactivity research at a podium in an Occidental College lecture hall.',
        objectPosition: 'center 25%',
      },
    ],
  },
  {
    institution: 'Bell Senior High School',
    credential: 'High School Diploma',
    start: '2019-08',
    end: '2023-06',
    focus: [
      'Web Development',
      'Javascript',
      'HTML/CSS',
      'Calculus',
      'Microeconomics',
    ],
    honors: ['Gifted STEM Magnet program — first-generation college student'],
    activities: [
      '4-Year Track & Field / Cross Country',
      'Two-time LA Marathon finisher (Students Run LA)',
    ],
    images: [
      {
        src: '/journey/BHS.jpg',
        alt: 'Eduardo at his Bell Senior High School graduation in cap and gown with honor cords and a BHS sash.',
      },
    ],
  },
];
