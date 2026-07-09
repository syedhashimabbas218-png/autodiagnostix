import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const QUALITY = 70;
const ROOT = path.resolve('public');
const SKIP_EXT = new Set(['.svg', '.ico']);
const SKIP_DIRS = new Set(['backups']);

const results = { converted: 0, skipped: 0, errors: 0 };

async function convertFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (SKIP_EXT.has(ext)) return;
  if (ext === '.webp') {
    const stats = fs.statSync(filePath);
    if (stats.size > 0) return;
  }
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, ext);
  const webpPath = path.join(dir, base + '.webp');
  const avifPath = path.join(dir, base + '.avif');

  try {
    const img = sharp(filePath);
    const meta = await img.metadata();

    if (!['png', 'jpeg', 'jpg', 'webp'].includes(meta.format)) return;

    const webpBuf = await img.webp({ quality: QUALITY }).toBuffer();
    fs.writeFileSync(webpPath, webpBuf);
    const avifBuf = await img.avif({ quality: QUALITY }).toBuffer();
    fs.writeFileSync(avifPath, avifBuf);

    const origSize = fs.statSync(filePath).size;
    const webpSize = webpBuf.length;
    const avifSize = avifBuf.length;
    const saved = ((1 - webpSize / origSize) * 100).toFixed(1);

    results.converted++;
    process.stdout.write(`  ✓ ${path.relative(ROOT, filePath)} (${(origSize/1024).toFixed(0)}K → webp:${(webpSize/1024).toFixed(0)}K avif:${(avifSize/1024).toFixed(0)}K, -${saved}%)\n`);
  } catch (err) {
    results.errors++;
    process.stderr.write(`  ✗ ${path.relative(ROOT, filePath)}: ${err.message}\n`);
  }
}

async function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) await walk(fullPath);
    } else if (entry.isFile()) {
      await convertFile(fullPath);
    }
  }
}

console.log('Optimizing images in public/...\n');
const start = Date.now();
await walk(ROOT);
const elapsed = ((Date.now() - start) / 1000).toFixed(1);
console.log(`\nDone in ${elapsed}s: ${results.converted} converted, ${results.errors} errors`);
