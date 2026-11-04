// Bounded read-only laptop/mobile acceptance pass. Artifacts are local, ignored.
import puppeteer from 'puppeteer';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.SEO_BASE_URL || 'http://127.0.0.1:4327';
const output = '.tmp/responsive';
await mkdir(output, { recursive: true });
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const results = [];
const failures = [];
const check = (condition, label, viewport) => { if (!condition) failures.push({ viewport, label }); };

async function measure() {
  return page.evaluate(() => {
    const rect = node => { const r = node.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; };
    const visible = node => node && node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0;
    const header = document.querySelector('#site-header');
    const nav = document.querySelector('#desktop-navigation');
    const menu = document.querySelector('#mobile-menu-btn');
    const hero = document.querySelector('.hero-slideshow');
    const slide = hero?.querySelector('[aria-hidden="false"]');
    return {
      width: innerWidth, height: innerHeight,
      overflow: document.documentElement.scrollWidth > innerWidth,
      header: rect(header), navVisible: visible(nav), menuVisible: visible(menu),
      quoteVisible: visible(document.querySelector('#header-cta')),
      // Links have a 44px touch height, so measure the text box, not the link box.
      wrappedLinks: visible(nav) ? [...nav.querySelectorAll('.nav-link')].filter(link => { const range = document.createRange(); range.selectNodeContents(link); return range.getBoundingClientRect().height > parseFloat(getComputedStyle(link).lineHeight) * 1.5; }).map(link => link.innerText) : [],
      hero: hero && rect(hero),
      tagline: slide && rect(slide.querySelector('.hero-tagline')),
      title: slide && rect(slide.querySelector('.hero-title')),
      heroFont: slide && getComputedStyle(slide.querySelector('.hero-title')).fontSize,
      ctas: slide && [...slide.querySelectorAll('.hero-cta')].map(rect),
      controls: hero && rect(hero.lastElementChild),
    };
  });
}

try {
  for (const [width, height] of [[320, 720], [390, 844], [768, 1024], [1024, 768], [1280, 720], [1366, 600], [1366, 768], [1440, 900], [1536, 864], [1920, 1080]]) {
    const viewport = `${width}x${height}`;
    await page.setViewport({ width, height });
    const response = await page.goto(`${base}/`, { waitUntil: 'networkidle0' });
    check(response.status() === 200, 'Home returns 200', viewport);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${output}/home-${viewport}.png` });
    const initial = await measure();
    check(!initial.overflow, 'No horizontal page overflow', viewport);
    check(initial.navVisible === (width >= 1024), 'Desktop navigation is shown from 64rem (laptops included)', viewport);
    check(initial.menuVisible === (width < 1024), 'Compact navigation remains accessible below 64rem', viewport);
    check(initial.quoteVisible === (width >= 768), 'Laptop quote action remains visible', viewport);
    check(initial.wrappedLinks.length === 0, 'Desktop navigation labels do not wrap', viewport);
    const slides = [];
    for (let index = 0; index < 3; index++) {
      if (index) {
        await page.click(`button[aria-label="Go to slide ${index + 1}"]`);
        await page.waitForFunction(i => document.querySelector('.hero-slideshow').children[i].getAttribute('aria-hidden') === 'false', {}, index);
        // A short viewport may scroll to a below-fold slider control on click.
        // Evaluate layout at the top of the page, not at that scrolled position.
        await page.evaluate(() => window.scrollTo(0, 0));
      }
      const current = await measure();
      check(current.tagline.top >= current.header.bottom, `Slide ${index + 1} clears fixed header`, viewport);
      check(current.ctas.every(cta => cta.left >= 0 && cta.right <= width && cta.bottom <= current.hero.bottom), `Slide ${index + 1} actions are not clipped`, viewport);
      check(current.ctas.every(cta => cta.bottom <= current.controls.top || cta.right <= current.controls.left || cta.left >= current.controls.right), `Slide ${index + 1} actions do not overlap slider controls`, viewport);
      slides.push({ font: current.heroFont, taglineTop: current.tagline.top, headerBottom: current.header.bottom, actionBottom: Math.max(...current.ctas.map(cta => cta.bottom)), heroBottom: current.hero.bottom });
    }
    if (width >= 1024) {
      await page.click('#products-menu-btn');
      const panel = await page.$eval('#products-menu-panel', node => ({ hidden: node.hidden, right: node.getBoundingClientRect().right, links: node.querySelectorAll('a[href]').length }));
      check(!panel.hidden && panel.right <= width && panel.links >= 7, 'Products menu opens within the viewport with catalog links', viewport);
      await page.keyboard.press('Escape');
      check(await page.$eval('#products-menu-btn', node => node.getAttribute('aria-expanded') === 'false'), 'Products menu closes with Escape', viewport);
    } else {
      await page.click('#mobile-menu-btn');
      check(await page.$eval('#mobile-menu-btn', node => node.getAttribute('aria-expanded') === 'true'), 'Menu opens', viewport);
      const menu = await page.$eval('#mobile-menu', node => ({ bottom: node.getBoundingClientRect().bottom, links: node.querySelectorAll('a[href]').length }));
      check(menu.bottom <= height + 1 && menu.links >= 10, 'Menu fits the viewport and keeps catalog links', viewport);
      await page.keyboard.press('Escape');
      check(await page.$eval('#mobile-menu-btn', node => node.getAttribute('aria-expanded') === 'false'), 'Menu closes with Escape', viewport);
    }
    results.push({ viewport, navVisible: initial.navVisible, overflow: initial.overflow, slides });
  }

  await page.setViewport({ width: 1366, height: 768 });
  for (const path of ['/products', '/category/wheel-alignment', '/brand/launch', '/product/x-431-pro3-link']) {
    const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle0' });
    const current = await measure();
    check(response.status() === 200 && !current.overflow, `Catalog page fits: ${path}`, '1366x768');
    await page.screenshot({ path: `${output}/${path.replaceAll('/', '-').slice(1)}-1366x768.png` });
  }

  const favicon = await (await fetch(`${base}/favicon.svg?v=ax-20261103`)).text();
  check(favicon.includes('AutoDiagnostix AX') && !favicon.includes('#863bff'), 'Branded favicon is served', 'all');
} finally {
  await browser.close();
}
await writeFile(`${output}/results.json`, JSON.stringify({ results, failures }, null, 2));
console.log(JSON.stringify({ results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
