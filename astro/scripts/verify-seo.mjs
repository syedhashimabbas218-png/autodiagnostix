// Read-only integration check against a running build. No submissions or writes.
// Set SEO_BASE_URL and, if necessary, PUPPETEER_EXECUTABLE_PATH before running.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
import { SITE_URL } from '../src/utils/site.mjs';

const base = process.env.SEO_BASE_URL || 'http://127.0.0.1:4322';
const browser = await puppeteer.launch({ headless: true });
const parser = await browser.newPage();
const failures = [];
let urls = [];
try {
  const index = await fetch(`${base}/sitemap-index.xml`);
  assert.equal(index.status, 200);
  assert.ok((await index.text()).includes(`${SITE_URL}/sitemap-0.xml`));
  const sitemap = await fetch(`${base}/sitemap-0.xml`);
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.ok(urls.length > 0);
  assert.equal(new Set(urls).size, urls.length);
  assert.equal(xml.includes('<lastmod>'), false);

  const remaining = [...urls];
  async function worker() {
    while (remaining.length) {
      const url = remaining.shift();
      try {
        assert.ok(url.startsWith(`${SITE_URL}/`), `Wrong hostname: ${url}`);
        assert.equal(/[?#]/.test(url), false);
        const path = url.slice(SITE_URL.length);
        assert.equal(path.length > 1 && path.endsWith('/'), false);
        const response = await fetch(`${base}${path}`, { redirect: 'manual' });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('x-robots-tag')?.includes('noindex') || false, false);
        const html = await response.text();
        // Parse initial HTML without running scripts: proves SSR accessibility.
        const result = await parser.evaluate(source => {
          const doc = new DOMParser().parseFromString(source, 'text/html');
          return {
            title: doc.title,
            description: doc.querySelector('meta[name="description"]')?.content,
            canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),
            ogUrl: doc.querySelector('meta[property="og:url"]')?.content,
            h1: doc.querySelectorAll('h1').length,
            robots: doc.querySelector('meta[name="robots"]')?.content || '',
            data: [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent)),
            visibleText: doc.querySelector('main')?.textContent || '',
          };
        }, html);
        assert.ok(result.title && result.description);
        assert.equal(result.canonical, url);
        assert.equal(result.ogUrl, url);
        assert.equal(result.h1, 1);
        assert.equal(result.robots.includes('noindex'), false);
        assert.equal(JSON.stringify(result.data).includes('https://autodiagnostix.com.pk'), false);
        assert.ok(result.data.every(item => item['@type'] !== 'Article'));
        if (path.startsWith('/product/')) {
          const product = result.data.find(item => item['@type'] === 'Product');
          assert.ok(product);
          assert.equal(product.url, url);
          for (const field of ['offers', 'sku', 'dateModified', 'review', 'aggregateRating']) assert.equal(field in product, false);
          assert.ok(result.visibleText.includes(product.name));
          assert.ok(result.visibleText.includes('Request a Quote'));
        }
      } catch (error) {
        failures.push({ url, error: error.message });
      }
    }
  }
  await Promise.all([worker(), worker(), worker()]);

  for (const path of ['/seo-check-unknown', '/product/seo-check-unknown', '/category/seo-check-unknown', '/brand/seo-check-unknown']) {
    assert.equal((await fetch(`${base}${path}`)).status, 404, path);
  }
  const queryHtml = await (await fetch(`${base}/products?q=lift&utm_source=seo-check`)).text();
  assert.ok(queryHtml.includes(`rel="canonical" href="${SITE_URL}/products"`));
  const aliasHtml = await (await fetch(`${base}/brand/gti-tools`)).text();
  assert.ok(aliasHtml.includes(`rel="canonical" href="${SITE_URL}/brand/gtitools"`));
  assert.equal(urls.includes(`${SITE_URL}/brand/gti-tools`), false);
} finally {
  await browser.close();
}

console.log(JSON.stringify({
  urls: urls.length,
  products: urls.filter(url => url.includes('/product/')).length,
  categories: urls.filter(url => url.includes('/category/')).length,
  brands: urls.filter(url => url.includes('/brand/')).length,
  failures,
}, null, 2));
assert.equal(failures.length, 0, 'SEO integration checks failed');
