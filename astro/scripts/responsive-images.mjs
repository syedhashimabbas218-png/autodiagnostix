// Generate width-limited AVIF/WebP variants for large local display images so
// pages can serve them through <picture>/srcset instead of multi-megabyte PNGs.
// Usage (from astro/): node scripts/responsive-images.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('public/images');
// source file -> widths to emit (never upscaled beyond the source width)
const TARGETS = {
  'diagnostics-intelligence.png': [800, 1600],
  'adas-pro.png': [800, 1600],
  '2postlift.jpeg': [800],
  'unite4post.png': [800],
  'scissor-lift.png': [800],
};

for (const [file, widths] of Object.entries(TARGETS)) {
  const source = path.join(ROOT, file);
  const base = file.replace(/\.[a-z]+$/i, '');
  const { width: sourceWidth } = await sharp(source).metadata();
  for (const width of widths) {
    const w = Math.min(width, sourceWidth);
    const pipeline = sharp(source).resize({ width: w, withoutEnlargement: true });
    const avif = await pipeline.clone().avif({ quality: 55, effort: 6 }).toBuffer();
    const webp = await pipeline.clone().webp({ quality: 72 }).toBuffer();
    fs.writeFileSync(path.join(ROOT, `${base}-${width}w.avif`), avif);
    fs.writeFileSync(path.join(ROOT, `${base}-${width}w.webp`), webp);
    console.log(`${base}-${width}w  avif ${(avif.length / 1024).toFixed(0)}K  webp ${(webp.length / 1024).toFixed(0)}K`);
  }
}
