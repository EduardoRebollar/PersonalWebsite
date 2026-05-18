/**
 * Generate stylized cover PNGs for each project in content/data/projects.ts.
 *
 * Used by the Hero Parallax section. Each project gets a 1280×800 cover
 * rendered as SVG, then rasterized to PNG via sharp, saved to
 *   public/projects/<slug>/cover.png
 *
 * Replace any cover.png with a real screenshot later — the parallax component
 * doesn't care where the image came from, only that the file exists.
 *
 * Run with:  bun run scripts/generate-covers.ts
 */

import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { projects } from '../content/data/projects';

const WIDTH = 1280;
const HEIGHT = 800;

// Curated dark palettes — all cohere with the shadcn dark base.
const PALETTES: ReadonlyArray<readonly [string, string]> = [
  ['#0a0e1a', '#1a1f2e'], // deep navy
  ['#0c1117', '#1f2937'], // graphite
  ['#0e0a1a', '#241738'], // dark indigo
  ['#0a1a17', '#0f2920'], // dark teal
  ['#1a0c0a', '#2e1a17'], // dark warm
  ['#0a151a', '#162a33'], // dark cyan
  ['#170a1a', '#28172e'], // dark plum
];

// Site accent (matches --primary token in globals.css).
const ACCENT = '#818cf8';

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function paletteForSlug(slug: string): readonly [string, string] {
  const idx = hashSlug(slug) % PALETTES.length;
  return PALETTES[idx]!;
}

function wrapTitle(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildCoverSvg(opts: {
  slug: string;
  title: string;
  tech: readonly string[];
  year: number;
}): string {
  const [c1, c2] = paletteForSlug(opts.slug);
  const titleLines = wrapTitle(opts.title, 22);
  const fontSize = titleLines.length > 2 ? 56 : titleLines.length > 1 ? 64 : 76;
  const lineHeight = fontSize * 1.05;
  const totalTitleHeight = titleLines.length * lineHeight;
  // Vertically center the title block in the canvas.
  const titleStartY = (HEIGHT - totalTitleHeight) / 2 + fontSize;

  const titleTspans = titleLines
    .map(
      (line, i) =>
        `<tspan x="80" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join('');

  const techLine = opts.tech.join('  ·  ').toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${c1}" />
      <stop offset="1" stop-color="${c2}" />
    </linearGradient>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="16" cy="16" r="1" fill="rgba(255,255,255,0.05)" />
    </pattern>
    <radialGradient id="vignette" cx="0.3" cy="0.3" r="0.9">
      <stop offset="0" stop-color="rgba(255,255,255,0.06)" />
      <stop offset="1" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#dots)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)" />

  <!-- top accent stripe -->
  <line x1="80" y1="80" x2="160" y2="80" stroke="${ACCENT}" stroke-width="2" opacity="0.75" />

  <!-- year (top right, mono) -->
  <text x="${WIDTH - 80}" y="86" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="16" fill="rgba(255,255,255,0.5)" text-anchor="end" letter-spacing="3">
    ${opts.year}
  </text>

  <!-- title (large serif, left-aligned, vertically centered) -->
  <text x="80" y="${titleStartY}" font-family="'Instrument Serif', Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="400" fill="rgba(255,255,255,0.96)" letter-spacing="-1">
    ${titleTspans}
  </text>

  <!-- tech stack (mono, below title) -->
  <text x="80" y="${HEIGHT - 80}" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="14" fill="rgba(255,255,255,0.45)" letter-spacing="2.5">
    ${escapeXml(techLine)}
  </text>
</svg>`;
}

async function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = resolve(scriptDir, '..');
  let written = 0;

  for (const project of projects) {
    if (project.slug === '_example') continue;
    const svg = buildCoverSvg({
      slug: project.slug,
      title: project.title,
      tech: project.tech,
      year: project.year,
    });
    const outPath = resolve(repoRoot, 'public', 'projects', project.slug, 'cover.png');
    await mkdir(dirname(outPath), { recursive: true });
    await sharp(Buffer.from(svg)).png({ quality: 90, compressionLevel: 9 }).toFile(outPath);
    written++;
    console.log(`  ✓ ${project.slug} → ${outPath.replace(repoRoot, '.')}`);
  }

  console.log(`\nGenerated ${written} cover image(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
