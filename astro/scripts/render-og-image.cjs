// Re-render public/og-image.png from public/og-image.svg with the brand
// headline font (social networks do not render SVG previews).
// Usage (from astro/): node scripts/render-og-image.cjs  (needs Playwright)
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const svg = fs.readFileSync(require('path').resolve('public/og-image.svg'), 'utf8').replace(/font-family="system-ui, sans-serif"/g, `font-family="Manrope, system-ui, sans-serif"`);
  const html = `<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;800&display=block" rel="stylesheet"><style>html,body{margin:0;padding:0}svg{display:block}</style></head><body>${svg}</body></html>`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  console.log('manrope loaded:', await p.evaluate(() => document.fonts.check('800 72px Manrope')));
  await p.screenshot({ path: require('path').resolve('public/og-image.png'), clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await b.close();
})();
