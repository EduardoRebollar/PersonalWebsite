import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'Personal Data/**',
      'public/**',
      'next-env.d.ts',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react/no-unknown-property': 'off',
    },
  },
  {
    // R3F components inside useFrame intentionally mutate camera, mesh,
    // and uniform refs each frame — that's the idiomatic pattern. The
    // react-hooks/immutability rule isn't aware of useFrame's contract,
    // so we turn it off for scene code only.
    files: ['components/scene/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
];

export default eslintConfig;
