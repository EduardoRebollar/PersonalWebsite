// Presentation metadata for the LA History replica — vivid era colors,
// emojis, and badge icons, ported from the original Flask app
// (static/js/utils.js eraColor/eraEmoji/eraLabel; seed_db.py badge icons).
// Kept separate from content/data/laHistory/eras.ts because that file is
// auto-generated and currently carries muted (portfolio-tuned) accents; the
// replica drives era visuals off these canonical values + the `.{era}` CSS
// classes, matching the original.

import type { EraKey } from '@/types/laHistory';

export type EraMeta = {
  /** Vivid era accent (matches the ported CSS --era-* tokens). */
  color: string;
  /** Marker / sidebar emoji. */
  emoji: string;
  /** Era-filter pill label (e.g. "Tongva"). */
  filterLabel: string;
  /** Capitalized era-key label used in the sidebar (e.g. "Native"). */
  label: string;
  /** Long era label (e.g. "Era 1 · Tongva"). */
  eraLabel: string;
};

export const ERA_META: Record<EraKey, EraMeta> = {
  native: {
    color: '#b87316',
    emoji: '🌿',
    filterLabel: 'Tongva',
    label: 'Native',
    eraLabel: 'Era 1 · Tongva',
  },
  spanish: {
    color: '#5c7a2e',
    emoji: '⚓',
    filterLabel: 'Spanish',
    label: 'Spanish',
    eraLabel: 'Era 2 · Spanish/Mexican',
  },
  rancho: {
    color: '#2d5f96',
    emoji: '🏗️',
    filterLabel: 'Rancho',
    label: 'Rancho',
    eraLabel: 'Era 3 · Rancho/American',
  },
  modern: {
    color: '#a82828',
    emoji: '🌆',
    filterLabel: 'Modern',
    label: 'Modern',
    eraLabel: 'Era 4 · Modern LA',
  },
};

/** Badge id (= original slug) → emoji icon, from seed_db.py seed_badges(). */
export const BADGE_ICONS: Record<string, string> = {
  first_steps: '🗺️',
  explorer: '🧭',
  native_scholar: '🌿',
  century_seeker: '⭐',
  historian: '📜',
  spanish_era_complete: '⚓',
  rancho_era_complete: '🏗️',
  modern_era_complete: '🌆',
  first_victory: '🏆',
  quiz_master: '🎓',
  era_synthesizer_1: '🌿',
  era_synthesizer_2: '🧩',
  era_synthesizer_3: '🔗',
  era_synthesizer_4: '🌐',
  master_cartographer: '🗺️',
  thrifty_scholar: '💡',
};

export function badgeIcon(id: string): string {
  return BADGE_ICONS[id] ?? '🏅';
}
