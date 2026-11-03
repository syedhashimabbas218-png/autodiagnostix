import { chromium } from '../app/node_modules/playwright/index.mjs';
import sharp from '../astro/node_modules/sharp/lib/index.js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const baseline = JSON.parse(await readFile('.playwright-mcp/ux-audit/baseline-build-chromium/results.json', 'utf8'));
const routes = process.env.VISUAL_ROUTES ? process.env.VISUAL_ROUTES.split(',') : [...new Set(baseline.results.map(r => r.path))];
const before = process.env.BEFORE_URL || 'http://127.0.0.1:4324';
const after = process.env.AFTER_URL || 'http://127.0.0.1:4326';
const output = '.playwright-mcp/ux-audit/visual';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: 'no-preference' });
// Freeze automatic slide rotation, not entrance animations, in both builds.
await page.addInitScript(() => {
  const interval = window.setInterval.bind(window);
  window.setInterval = (callback, delay, ...args) => delay === 6000 || delay === 5000 ? 0 : interval(callback, delay, ...args);
});
let results = process.env.VISUAL_ROUTES ? JSON.parse(await readFile(`${output}/results.json`, 'utf8')) : [];
try {
  for (const route of routes) for (const width of [375, 1440]) {
    const samples = [];
    for (const [name, origin] of [['before', before], ['after', after]]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(origin + route, { waitUntil: 'load', timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      // Trigger native lazy images, island hydration and reveal animations.
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        await Promise.race([Promise.all([...document.images].filter(i => i.currentSrc).map(i => i.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 8000))]);
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1800);
      await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'), { timeout: 30000 });
      if (route === '/' && name === 'after') {
        await page.waitForFunction(() => [...document.querySelectorAll('.hero-cta')].every(el => {
          const style = getComputedStyle(el);
          return style.opacity === '1' && (style.transform === 'none' || Math.abs(new DOMMatrix(style.transform).m42) < 0.01);
        }), { timeout: 30000 });
      }
      const filename = `${output}/${route.replaceAll('/', '_')}-${width}-${name}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      const text = await page.locator('main').evaluate(el => {
        const copy = el.cloneNode(true);
        copy.querySelectorAll('script, style').forEach(node => node.remove());
        return copy.textContent;
      });
      const { data, info } = await sharp(filename).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      samples.push({ data, info, text: text.replace(/\s+/g, ' ').trim() });
    }
    const [a, b] = samples;
    let changedPixels = 0;
    let firstDifferentRow = null;
    let lastDifferentRow = null;
    const commonHeight = Math.min(a.info.height, b.info.height);
    for (let y = 0; y < commonHeight; y++) for (let x = 0; x < width; x++) {
      const ai = (y * a.info.width + x) * 4;
      const bi = (y * b.info.width + x) * 4;
      if (Math.max(...[0, 1, 2].map(c => Math.abs(a.data[ai + c] - b.data[bi + c]))) > 16) {
        changedPixels++;
        firstDifferentRow ??= y;
        lastDifferentRow = y;
      }
    }
    results = results.filter(result => result.route !== route || result.width !== width);
    results.push({ route, width, beforeHeight: a.info.height, afterHeight: b.info.height, contentMatches: a.text === b.text, firstDifferentRow, lastDifferentRow, changedPercent: +(100 * changedPixels / (width * commonHeight)).toFixed(4) });
    await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  }
  console.log(JSON.stringify({ comparisons: results.length, contentDifferences: results.filter(r => !r.contentMatches), visualDifferences: results.filter(r => r.changedPercent === null || r.changedPercent > 0.1) }, null, 2));
} finally { await browser.close(); }
