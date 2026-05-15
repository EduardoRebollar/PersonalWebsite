/**
 * One-off image optimization script. Compresses portrait + selected MDX
 * figures so the deployed assets stay under budget.
 *
 *   bun run scripts/optimize-images.mjs
 *
 * Re-encodes JPGs at q=82 with a max-width cap, and tries a JPG version of
 * the PNG figures we know are oversized.
 *
 * Source of truth for the originals stays in `Personal Data/` (untracked).
 */

import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
const PERSONAL = join(ROOT, 'Personal Data', 'Personal Projects');

const jobs = [
  // Portrait: cap width, lower quality, keep JPG.
  {
    in: join(ROOT, 'Personal Data', 'Headshot.jpg'),
    out: join(ROOT, 'public', 'photo.jpg'),
    transform: (img) => img.resize({ width: 1400, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }),
  },
  // BiLSTM scatter grid: was 2.1 MB PNG, becomes a much smaller JPG.
  {
    in: join(
      PERSONAL,
      'BiLSTM vs Feedforward Neural Networks for Toxicity Detection',
      'images',
      'scatter_grid.png',
    ),
    out: join(ROOT, 'public', 'projects', 'bilstm-vs-ffnn', 'scatter_grid.jpg'),
    transform: (img) =>
      img
        .resize({ width: 1600, withoutEnlargement: true })
        .flatten({ background: '#0a1018' })
        .jpeg({ quality: 80, mozjpeg: true }),
  },
];

await Promise.all(
  jobs.map(async (job) => {
    await fs.mkdir(dirname(job.out), { recursive: true });
    const before = (await fs.stat(job.in)).size;
    const pipeline = sharp(job.in);
    await job.transform(pipeline).toFile(job.out);
    const after = (await fs.stat(job.out)).size;
    const pct = ((1 - after / before) * 100).toFixed(1);
    console.log(`  ${job.out.replace(ROOT, '.')}: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB (-${pct}%)`);
  }),
);

console.log('done.');
