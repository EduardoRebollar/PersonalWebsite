import type { Metadata } from 'next';
import { LaHistoryApp } from '@/components/laHistory/LaHistoryApp';

export const metadata: Metadata = {
  title: 'LA History — Interactive Demo',
  description:
    'A constructivist learning game across Los Angeles — Leaflet map, era unlocks, concept-map editor, and a Socratic AI tutor. Play directly in your browser; progress saves locally.',
  robots: { index: false, follow: true },
};

export default function LaHistoryPlayPage() {
  return <LaHistoryApp />;
}
