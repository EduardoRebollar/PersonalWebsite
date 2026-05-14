import { Geist, Instrument_Serif, JetBrains_Mono } from 'next/font/google';

export const fontSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
  preload: true,
});

export const fontDisplay = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-serif',
  weight: '400',
  style: ['normal', 'italic'],
  preload: true,
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  preload: false,
});

export const fontClassNames = `${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`;
