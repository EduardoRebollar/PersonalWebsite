// Fonts for the LA History demo's 1:1 replica skin. The original Flask app
// uses Playfair Display (display/serif) + DM Sans (body). We load them via
// next/font and expose them under LA-History-specific CSS variable names
// (--lah-font-serif / --lah-font-sans) so they don't collide with the
// portfolio's global --font-display / --font-sans. The ported `main.css`
// maps the original token names (--font-display / --font-body / --font-serif)
// onto these inside `.lah-root`.

import { DM_Sans, Playfair_Display } from 'next/font/google';

export const fontSerif = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--lah-font-serif',
});

export const fontBody = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--lah-font-sans',
});

/** Space-joined font variable class names to spread onto the demo wrapper. */
export const lahFontVariables = `${fontSerif.variable} ${fontBody.variable}`;
