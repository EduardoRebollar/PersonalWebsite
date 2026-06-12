import type { ReactNode } from 'react';
import { lahFontVariables } from '@/components/laHistory/fonts';
// Scoped (.lah-root) parchment skin for the 1:1 LA History replica. Imported
// only here, so it never ships on any other route.
import '@/components/laHistory/styles/index.css';

/**
 * Route layout for the LA History interactive demo. It does not re-establish
 * <html>/<body> (the portfolio root layout owns those, and its <Nav>/<Footer>
 * already self-hide on this route). It only:
 *   - loads the scoped LA History stylesheet, and
 *   - exposes the Playfair Display / DM Sans variables to the subtree so the
 *     `.lah-root` skin can map them onto the original token names.
 */
export default function LaHistoryPlayLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className={lahFontVariables}>{children}</div>;
}
