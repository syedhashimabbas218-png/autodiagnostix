// Download the self-hosted web fonts into public/fonts/ (run from astro/).
//
// Inter and Manrope (SIL OFL 1.1) are fetched as Google's variable latin and
// latin-ext subsets. Material Symbols Outlined (Apache 2.0) is fetched as a
// subset containing only ICON_NAMES. Self-hosting removes two render-blocking
// third-party stylesheets and their extra connections from every page.
//
// When a page starts using a new Material Symbols ligature, add it to
// ICON_NAMES (alphabetical) and re-run: node scripts/fetch-fonts.mjs
import { mkdir, writeFile } from 'node:fs/promises';

export const ICON_NAMES = ['arrow_forward', 'call', 'category', 'info', 'local_shipping', 'location_on', 'mail', 'map', 'precision_manufacturing', 'schedule', 'support_agent', 'verified', 'workspace_premium'];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const OUT = new URL('../public/fonts/', import.meta.url);

async function css(url) {
  const response = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

async function download(url, name) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(new URL(name, OUT), bytes);
  console.log(`${name}  ${(bytes.length / 1024).toFixed(1)} KB`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await mkdir(OUT, { recursive: true });
  const text = await css('https://fonts.googleapis.com/css2?family=Inter:wght@400..800&family=Manrope:wght@400..800&display=swap');
  for (const [, subset, body] of text.matchAll(/\/\* ([a-z-]+) \*\/\s*@font-face \{([^}]*)\}/g)) {
    if (subset !== 'latin' && subset !== 'latin-ext') continue;
    const family = /font-family: '([^']+)'/.exec(body)[1].toLowerCase();
    await download(/url\(([^)]+)\)/.exec(body)[1], `${family}-${subset}.woff2`);
  }
  const icons = await css(`https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&icon_names=${ICON_NAMES.join(',')}&display=block`);
  await download(/url\(([^)]+)\)/.exec(icons)[1], 'material-symbols-subset.woff2');
}
