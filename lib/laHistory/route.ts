// One source of truth for "are we inside the LA History demo right now".
// SceneMount, Nav, and Footer use this to suppress global chrome on the
// demo route so the interactive sub-app gets the full viewport.

'use client';

import { usePathname } from 'next/navigation';

export const LA_HISTORY_DEMO_PATH_PREFIX = '/work/la-history/play';

export function useIsLaHistoryDemoRoute(): boolean {
  const pathname = usePathname();
  if (!pathname) return false;
  return pathname === LA_HISTORY_DEMO_PATH_PREFIX
    || pathname.startsWith(`${LA_HISTORY_DEMO_PATH_PREFIX}/`);
}
