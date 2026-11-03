// Read-only browser audit. Uses the repository's existing Playwright installation.
import { chromium, firefox, webkit } from '../app/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';

const phase = process.argv[2] || 'baseline';
const origin = process.env.AUDIT_URL || 'http://127.0.0.1:4321';
const engine = process.env.AUDIT_BROWSER || 'chromium';
const output = `.playwright-mcp/ux-audit/${phase}-${engine}`;
await mkdir(output, { recursive: true });
const browser = await ({ chromium, firefox, webkit, edge: chromium }[engine]).launch(engine === 'edge' ? { channel: 'msedge' } : {});
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const staticPages = (await readdir('astro/src/pages')).filter(p => p.endsWith('.astro') && p !== 'admin.astro').map(p => '/' + p.replace('.astro', '').replace(/^index$/, ''));
const routes = [...staticPages, '/products', '/brands', '/category/scanners', '/brand/launch', '/product/919-max'];
const results = [];
for (const route of routes) {
  const widths = route === '/' ? [320, 375, 430, 600, 768, 1024, 1440, 1920] : [320, 768, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    const start = Date.now();
    const response = await page.goto(origin + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 3000))]));
    await page.waitForTimeout(800);
    // Freeze the carousel at the same frame, then reveal below-fold content.
    await page.addStyleTag({ content: '* { animation-play-state: paused !important; }' });
    await page.screenshot({ path: `${output}/${route.replaceAll('/', '_') || 'home'}-${width}.png`, fullPage: true });
    const metrics = await page.evaluate(() => ({
      path: location.pathname, width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      title: document.title, canonical: document.querySelector('[rel="canonical"]')?.href,
      headings: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()),
      text: document.querySelector('main')?.innerText,
      invalidJsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].filter(s => { try { JSON.parse(s.textContent); return false; } catch { return true; } }).length,
      unnamedInputs: [...document.querySelectorAll('input:not([type="hidden"]),textarea,select')].filter(i => !i.labels?.length && !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby')).length,
      brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth && i.getAttribute('src')).map(i => i.src),
      headerOverflow: document.querySelector('#site-header')?.scrollWidth > innerWidth,
      links: [...new Set([...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href')))],
    }));
    results.push({ ...metrics, status: response.status(), elapsedMs: Date.now() - start });
    await writeFile(`${output}/results.json`, JSON.stringify({ origin, engine, errors, results }, null, 2));
  }
}
await writeFile(`${output}/results.json`, JSON.stringify({ origin, engine, errors, results }, null, 2));
console.log(JSON.stringify({ output, pages: routes.length, checks: results.length, errors, overflow: results.filter(r => r.scrollWidth > r.width + 1 || r.headerOverflow).map(({ path, width, scrollWidth, headerOverflow }) => ({ path, width, scrollWidth, headerOverflow })), invalidJsonLd: results.filter(r => r.invalidJsonLd).length }, null, 2));
await browser.close();
