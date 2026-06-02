import type { ExperienceItem } from '@/types/content';

export const experience: ExperienceItem[] = [
  {
    role: 'Student Technical Support',
    org: 'Occidental College ITS',
    start: '2024-08',
    end: 'present',
    location: 'Los Angeles, CA',
    type: 'part-time',
    impact: 'Frontline IT support for students, faculty, and staff across two campuses.',
    bullets: [
      'Resolve software, hardware, and network issues via walk-ins, phone, and email, escalating complex cases with detailed reproduction notes.',
      'Diagnose and repair Windows and macOS systems — updates, configurations, password resets, printer connectivity, basic laptop repairs.',
      'Maintain Active Directory accounts and software deployments using the department’s ITSM workflow.',
    ],
    tech: [
      'Active Directory',
      'Freshservice ITSM',
      'Windows',
      'macOS',
      'Printer Support',
    ],
  },
  {
    role: 'Software Development Intern',
    org: 'College Match LA',
    start: '2024-05',
    end: '2024-08',
    location: 'Los Angeles, CA',
    type: 'internship',
    impact:
      'Shipped an alumni-networking portal serving thousands of CMLA scholars and college students.',
    bullets: [
      'Designed and built a Softr web app on an Airtable backend covering networking, news, events, and a curated job/resource feed.',
      'Launched the portal at Scholar Success Day to an audience of 100+ alumni, scholars, organization members, and partner-org reps.',
      'Mentored rising high-school applicants during CMLA’s prep workshop — essay coaching, interview prep, college selection.',
    ],
    tech: [
      'Softr',
      'Airtable',
      'Web App Development',
      'Database Design',
      'UX Design',
      'Mentorship',
    ],
    images: [
      {
        src: '/journey/collegematch.jpg',
        alt: 'Eduardo with fellow College Match LA scholars at a CMLA program event.',
      },
    ],
  },
  {
    role: 'Student Intern',
    org: 'STEAM:CODERS',
    start: '2023-08',
    end: '2023-11',
    location: 'Pasadena, CA',
    type: 'internship',
    impact:
      'Built the data pipeline and analytics that let a STEM-education nonprofit answer its own questions.',
    bullets: [
      'Developed an ETL pipeline consolidating, sanitizing, and loading program data into Snowflake.',
      'Authored Jupyter dashboards in Pandas, Matplotlib, and Seaborn answering key program questions about reach and outcomes.',
      'Improved the data-analyst onboarding site so new hires could ramp without 1:1 hand-holding.',
    ],
    tech: [
      'Python',
      'Pandas',
      'Seaborn',
      'Matplotlib',
      'Snowflake',
      'Jupyter',
      'ETL Pipelines',
    ],
    images: [
      {
        src: '/journey/steamcoders.jpg',
        alt: 'Eduardo with two fellow STEAM:CODERS interns outside the idealab building in Pasadena.',
      },
    ],
  },
];
