import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from '../app/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';

const engine = process.env.AUDIT_BROWSER || 'chromium';
const origin = process.env.AUDIT_URL || 'http://127.0.0.1:4321';
const browser = await ({ chromium, firefox, webkit, edge: chromium }[engine]).launch(engine === 'edge' ? { channel: 'msedge' } : {});
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
const errors = [];
const passed = [];
page.on('pageerror', error => errors.push(error.message));
const check = async (name, action) => { await action(); passed.push(name); console.log('PASS', name); };
try {
  await check('Normal-motion hero CTAs finish visible and at their intended position', async () => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(origin, { waitUntil: 'load' });
    await page.waitForFunction(() => [...document.querySelectorAll('.hero-cta')].every(el => {
      const style = getComputedStyle(el);
      return style.opacity === '1' && (style.transform === 'none' || Math.abs(new DOMMatrix(style.transform).m42) < 0.01);
    }));
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });
  await page.goto(origin, { waitUntil: 'load' });
  await check('Mobile disclosure, Escape and focus restoration', async () => {
    const menu = page.locator('#mobile-menu-btn');
    await menu.click();
    assert.equal(await menu.getAttribute('aria-expanded'), 'true');
    assert(await page.locator('#mobile-menu').isVisible());
    await page.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    assert(await menu.evaluate(el => el === document.activeElement));
  });
  await check('Hero loads only its first background initially; slide controls work', async () => {
    assert.equal(await page.locator('.hero-slideshow img').count(), 1);
    assert((await page.locator('.hero-slideshow img').getAttribute('src')).endsWith('hero-slide-1.webp'));
    await page.getByRole('button', { name: 'Go to slide 2', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[aria-label="Go to slide 2"]')?.getAttribute('aria-pressed') === 'true');
    assert(await page.locator('.hero-slideshow img[src$="hero-slide-2.webp"]').isVisible());
    await page.getByRole('button', { name: 'Go to slide 1', exact: true }).click();
  });
  await check('Tablet navigation fits; landscape menu can scroll', async () => {
    await page.setViewportSize({ width: 768, height: 375 });
    await page.locator('#mobile-menu-btn').click();
    assert(await page.locator('#mobile-menu').evaluate(el => el.clientHeight <= innerHeight && getComputedStyle(el).overflowY === 'auto'));
    await page.setViewportSize({ width: 1440, height: 900 });
    assert.equal(await page.locator('#mobile-menu-btn').getAttribute('aria-expanded'), 'false');
    assert(await page.locator('#site-header').evaluate(el => el.scrollWidth <= innerWidth));
  });
  await check('Search is a native modal with keyboard containment and dismissal', async () => {
    await page.getByRole('button', { name: 'Search products', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Search products' });
    await dialog.waitFor({ state: 'visible' });
    assert(await dialog.evaluate(el => el.matches(':modal')));
    await page.keyboard.press('Shift+Tab');
    assert(await dialog.evaluate(el => el.contains(document.activeElement)));
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Search products');
  });
  await page.route('**/api/search?*', async route => {
    const q = new URL(route.request().url()).searchParams.get('q');
    if (q === 'fail') return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
    if (q === 'old') await new Promise(resolve => setTimeout(resolve, 1000));
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ results: [{ id: q, name: `${q} result`, image: '/logo-full.webp', brand: 'Launch', category: 'Scanners', price: 'Contact for Quote' }] }) }).catch(() => {});
  });
  await check('Search ignores superseded requests and reports network failure', async () => {
    await page.keyboard.press('Control+k');
    const input = page.getByRole('textbox', { name: 'Search products, brands, categories' });
    await input.fill('old');
    await page.waitForRequest('**/api/search?q=old');
    await input.fill('new');
    await page.getByRole('link', { name: /new result/ }).waitFor();
    await page.waitForTimeout(1100);
    assert.equal(await page.getByRole('link', { name: /old result/ }).count(), 0);
    await input.fill('fail');
    await page.getByRole('alert').waitFor();
    await page.keyboard.press('Escape');
  });
  await check('Lift selector supports keyboard activation', async () => {
    const lift = page.locator('#lifts [role="button"]').nth(1);
    await lift.scrollIntoViewIfNeeded();
    await page.locator('astro-island:has(#lifts):not([ssr])').waitFor();
    await lift.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelectorAll('#lifts [role="button"]')[1]?.getAttribute('aria-pressed') === 'true');
  });
  await check('Native FAQ toggles with keyboard', async () => {
    const summary = page.locator('details summary').first();
    await summary.focus();
    const before = await summary.evaluate(el => el.parentElement.open);
    await page.keyboard.press('Enter');
    assert.notEqual(await summary.evaluate(el => el.parentElement.open), before);
  });
  await check('Product query deep link and clear filter', async () => {
    await page.goto(origin + '/products?q=919', { waitUntil: 'load' });
    const input = page.getByRole('textbox', { name: 'Search products', exact: true });
    assert.equal(await input.inputValue(), '919');
    assert.equal(await page.locator('a[href="/product/919-max"]').count(), 1, 'Public CMS must supply the expected test product');
    await input.fill('no-such-product-12345');
    await page.getByText('No products match your filters.').waitFor();
    await input.fill('');
    await page.locator('a[href="/product/919-max"]').waitFor();
  });
  await check('Native navigation and browser Back retain the products route', async () => {
    await page.locator('a[href="/product/919-max"]').first().click();
    await page.waitForURL('**/product/919-max');
    await page.goBack({ waitUntil: 'load' });
    assert(new URL(page.url()).pathname === '/products');
  });
  await check('Gallery controls and fixed action-bar clearance', async () => {
    await page.goto(origin + '/product/919-max', { waitUntil: 'load' });
    const gallery = page.locator('section[aria-label$="gallery"]');
    await gallery.scrollIntoViewIfNeeded();
    await page.locator('astro-island:has(section[aria-label$="gallery"]):not([ssr])').waitFor();
    await gallery.getByRole('button', { name: 'Next image', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[aria-label="Go to image 2"]')?.getAttribute('aria-current') === 'true');
    const legal = page.locator('footer a[href="/privacy-policy"]');
    await legal.scrollIntoViewIfNeeded();
    assert(await legal.evaluate(el => el.getBoundingClientRect().bottom <= innerHeight - document.querySelector('#product-actions').getBoundingClientRect().height));
  });
  await check('Contact native validation and autofill (no message submitted)', async () => {
    await page.goto(origin + '/contact', { waitUntil: 'load' });
    assert.equal(await page.locator('form').evaluate(el => el.checkValidity()), false);
    assert.equal(await page.locator('#email').getAttribute('autocomplete'), 'email');
    await page.locator('#email').fill('not-an-email');
    assert.equal(await page.locator('#email').evaluate(el => el.validity.typeMismatch), true);
  });
  await check('Small mobile search fits without horizontal overflow', async () => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.getByRole('button', { name: 'Search products', exact: true }).click();
    assert(await page.locator('dialog').evaluate(el => el.scrollWidth <= innerWidth));
    await page.keyboard.press('Escape');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  });
  assert.deepEqual(errors, []);
} finally {
  await mkdir('.playwright-mcp/ux-audit', { recursive: true });
  await writeFile(`.playwright-mcp/ux-audit/interactions-${engine}.json`, JSON.stringify({ engine, passed, errors }, null, 2));
  await browser.close();
}
